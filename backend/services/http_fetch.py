"""Fetch HTTP(S) de URLs del usuario, con TLS verificado y bloqueo SSRF."""

from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import httpx

FETCH_TIMEOUT = 10.0
MAX_REDIRECTS = 5
MAX_HTML_BYTES = 1_000_000
SAFE_FETCH_TIMEOUT = 4.0
SAFE_MAX_REDIRECTS = 4
SAFE_HTML_BYTES = 250_000

BLOCKED_HOSTNAMES = frozenset(
    {
        "localhost",
        "localhost.localdomain",
        "metadata",
        "metadata.google.internal",
        "metadata.google.com",
        "metadata.goog",
        "instance-data",
        "kubernetes",
        "kubernetes.default",
        "kubernetes.default.svc",
        "kubernetes.default.svc.cluster.local",
        "internal",
    }
)


class UnsafeUrlError(ValueError):
    """La URL apunta a una red interna o no es http(s)."""


def normalize_url(url: str) -> str:
    raw = (url or "").strip()
    if not raw:
        raise UnsafeUrlError("La URL esta vacia")
    if "://" not in raw:
        raw = f"https://{raw}"
    return raw


def _blocked_message() -> str:
    return "No se pueden analizar direcciones internas o locales"


def _is_blocked_ip(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    if ip.version == 6 and ip.ipv4_mapped is not None:
        return _is_blocked_ip(ip.ipv4_mapped)
    if ip.is_private or ip.is_loopback or ip.is_link_local:
        return True
    if ip.is_multicast or ip.is_reserved or ip.is_unspecified:
        return True
    if ip.version == 4 and ip in ipaddress.ip_network("0.0.0.0/8"):
        return True
    if ip.version == 4 and ip in ipaddress.ip_network("100.64.0.0/10"):
        return True
    return False


def _hostname_blocked(host: str) -> bool:
    host = host.lower().rstrip(".")
    if host in BLOCKED_HOSTNAMES:
        return True
    if host.endswith(".localhost") or host.endswith(".local") or host.endswith(".internal"):
        return True
    if host.endswith(".arpa"):
        return True
    return False


def _ip_from_host_literal(host: str) -> ipaddress.IPv4Address | ipaddress.IPv6Address | None:
    try:
        return ipaddress.ip_address(host)
    except ValueError:
        pass
    if host.isdigit():
        try:
            value = int(host)
            if 0 <= value <= 0xFFFFFFFF:
                return ipaddress.IPv4Address(value)
        except (ValueError, OverflowError):
            return None
    return None


def _resolve_ips(host: str) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    try:
        infos = socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise UnsafeUrlError("No se pudo resolver el dominio") from exc
    ips: list[ipaddress.IPv4Address | ipaddress.IPv6Address] = []
    seen: set[str] = set()
    for info in infos:
        addr = info[4][0]
        if addr in seen:
            continue
        seen.add(addr)
        ips.append(ipaddress.ip_address(addr))
    if not ips:
        raise UnsafeUrlError("No se pudo resolver el dominio")
    return ips


def assert_public_http_url(url: str) -> str:
    """Normaliza y rechaza URLs internas. No hace el GET."""
    raw = normalize_url(url)
    parsed = urlparse(raw)
    if parsed.scheme not in ("http", "https"):
        raise UnsafeUrlError("Solo se permiten URLs http o https")
    if parsed.username or parsed.password:
        raise UnsafeUrlError("La URL no puede incluir credenciales")
    host = parsed.hostname
    if not host:
        raise UnsafeUrlError("URL invalida")
    if _hostname_blocked(host):
        raise UnsafeUrlError(_blocked_message())

    literal = _ip_from_host_literal(host)
    if literal is not None:
        if _is_blocked_ip(literal):
            raise UnsafeUrlError(_blocked_message())
        return raw

    for ip in _resolve_ips(host):
        if _is_blocked_ip(ip):
            raise UnsafeUrlError(_blocked_message())
    return raw


def assert_scan_http_url(url: str) -> str:
    """Normaliza para analizar. No resuelve DNS: un dominio trucho igual se puntua."""
    raw = normalize_url(url)
    parsed = urlparse(raw)
    if parsed.scheme not in ("http", "https"):
        raise UnsafeUrlError("Solo se permiten URLs http o https")
    host = parsed.hostname
    if not host:
        raise UnsafeUrlError("URL invalida")
    if _hostname_blocked(host):
        raise UnsafeUrlError(_blocked_message())
    literal = _ip_from_host_literal(host)
    if literal is not None and _is_blocked_ip(literal):
        raise UnsafeUrlError(_blocked_message())
    return raw


def is_blocked_ip_str(ip: str) -> bool:
    try:
        return _is_blocked_ip(ipaddress.ip_address(ip))
    except ValueError:
        return True


def url_fetch_allowed(url: str) -> tuple[bool, str]:
    """True si el host se puede pedir sin riesgo de SSRF interno."""
    try:
        raw = (url or "").strip()
        if "://" in raw:
            scheme = urlparse(raw).scheme
            if scheme not in ("http", "https"):
                return False, "solo_http_https"
        assert_public_http_url(url)
        return True, ""
    except UnsafeUrlError:
        return False, "host_bloqueado"


def fetch_page_safe(
    url: str,
    *,
    timeout: float = SAFE_FETCH_TIMEOUT,
    max_redirects: int = SAFE_MAX_REDIRECTS,
    want_html: bool = True,
) -> dict:
    """GET con TLS verificado, tope de redirects y bloqueo de IPs privadas.

    No lanza: si falla, devuelve ok=False y el motivo. Pensado para el motor
    unificado (timeouts cortos; el analisis sigue con el resto de senales).
    """
    try:
        current = normalize_url(url)
    except UnsafeUrlError:
        return {
            "ok": False,
            "motivo": "host_bloqueado",
            "final_url": url,
            "html": "",
            "headers": {},
            "hops": [],
        }
    hops: list[str] = [current]
    try:
        with httpx.Client(
            follow_redirects=False,
            timeout=timeout,
            verify=True,
            trust_env=False,
            max_redirects=0,
        ) as client:
            for _ in range(max_redirects + 1):
                allowed, reason = url_fetch_allowed(current)
                if not allowed:
                    return {
                        "ok": False,
                        "motivo": reason,
                        "final_url": current,
                        "html": "",
                        "headers": {},
                        "hops": hops,
                    }
                resp = client.get(current)
                if resp.is_redirect or resp.has_redirect_location:
                    loc = resp.headers.get("location")
                    if not loc:
                        return {
                            "ok": True,
                            "motivo": "",
                            "final_url": str(resp.url),
                            "html": "",
                            "headers": dict(resp.headers),
                            "hops": hops,
                            "status": resp.status_code,
                        }
                    nxt = urljoin(current, loc)
                    parsed = urlparse(nxt)
                    if parsed.scheme not in ("http", "https"):
                        return {
                            "ok": False,
                            "motivo": "redirect_esquema",
                            "final_url": current,
                            "html": "",
                            "headers": dict(resp.headers),
                            "hops": hops,
                        }
                    hops.append(nxt)
                    current = nxt
                    continue
                html = ""
                if want_html:
                    html = resp.content[:SAFE_HTML_BYTES].decode(
                        resp.encoding or "utf-8", errors="replace"
                    )
                return {
                    "ok": True,
                    "motivo": "",
                    "final_url": str(resp.url),
                    "html": html,
                    "headers": dict(resp.headers),
                    "hops": hops,
                    "status": resp.status_code,
                }
    except Exception as exc:
        return {
            "ok": False,
            "motivo": "timeout" if "timeout" in str(exc).lower() else "error",
            "error": str(exc)[:200],
            "final_url": current,
            "html": "",
            "headers": {},
            "hops": hops,
        }
    return {
        "ok": False,
        "motivo": "demasiados_redirects",
        "final_url": current,
        "html": "",
        "headers": {},
        "hops": hops,
    }


async def _request_following_redirects(
    url: str, *, method: str
) -> httpx.Response:
    current = assert_public_http_url(url)
    method = method.upper()
    async with httpx.AsyncClient(
        timeout=FETCH_TIMEOUT,
        verify=True,
        follow_redirects=False,
        trust_env=False,
    ) as client:
        for _ in range(MAX_REDIRECTS + 1):
            assert_public_http_url(current)
            if method == "HEAD":
                resp = await client.head(current)
            else:
                resp = await client.get(current)
            if resp.is_redirect:
                location = resp.headers.get("location", "")
                if not location:
                    raise UnsafeUrlError("Redirect sin destino")
                nxt = urljoin(str(resp.url), location)
                parsed = urlparse(nxt)
                if parsed.scheme not in ("http", "https"):
                    raise UnsafeUrlError("Redirect a un esquema no permitido")
                current = nxt
                method = "GET"
                continue
            resp.raise_for_status()
            return resp
    raise UnsafeUrlError("Demasiados redirects")


async def fetch_url(url: str, *, method: str = "GET") -> tuple[str, httpx.Headers, int]:
    resp = await _request_following_redirects(url, method=method)
    return str(resp.url), resp.headers, resp.status_code


async def fetch_html(url: str) -> tuple[str, str, httpx.Headers]:
    resp = await _request_following_redirects(url, method="GET")
    text = resp.text
    if len(text) > MAX_HTML_BYTES:
        text = text[:MAX_HTML_BYTES]
    return str(resp.url), text, resp.headers
