"""Fetch HTTP(S) de URLs del usuario, con TLS verificado y bloqueo SSRF."""

from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import httpx

FETCH_TIMEOUT = 10.0
MAX_REDIRECTS = 5
MAX_HTML_BYTES = 1_000_000

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


def is_blocked_ip_str(ip: str) -> bool:
    try:
        return _is_blocked_ip(ipaddress.ip_address(ip))
    except ValueError:
        return True


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
