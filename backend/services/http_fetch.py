import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import httpx

BLOCKED_HOSTNAMES = {
    "localhost",
    "localhost.localdomain",
    "metadata.google.internal",
    "metadata.goog",
    "metadata",
    "instance-data",
    "kubernetes",
    "internal",
}

MAX_HTML_BYTES = 250_000
SAFE_FETCH_TIMEOUT = 4.0
SAFE_MAX_REDIRECTS = 4


def normalize_url(url: str) -> str:
    raw = url.strip()
    if not raw.startswith(("http://", "https://")):
        raw = f"https://{raw}"
    return raw


def _host_is_blocked(host: str) -> bool:
    host = (host or "").strip().lower().split("%")[0]
    if not host:
        return True
    if host.startswith("[") and host.endswith("]"):
        host = host[1:-1]
    if ":" in host and not _looks_like_ipv6(host):
        host = host.rsplit(":", 1)[0]
    if host in BLOCKED_HOSTNAMES:
        return True
    if host.endswith(".localhost") or host.endswith(".internal") or host.endswith(".local"):
        return True
    try:
        ip = ipaddress.ip_address(host)
        return _ip_is_blocked(ip)
    except ValueError:
        pass
    try:
        infos = socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)
    except socket.gaierror:
        return True
    if not infos:
        return True
    for info in infos:
        try:
            ip = ipaddress.ip_address(info[4][0])
        except ValueError:
            continue
        if _ip_is_blocked(ip):
            return True
    return False


def _looks_like_ipv6(host: str) -> bool:
    return host.count(":") >= 2


def _ip_is_blocked(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    if ip.is_private or ip.is_loopback or ip.is_link_local:
        return True
    if ip.is_reserved or ip.is_multicast or ip.is_unspecified:
        return True
    if ip.version == 4 and ip in ipaddress.ip_network("100.64.0.0/10"):
        return True
    return False


def url_fetch_allowed(url: str) -> tuple[bool, str]:
    """True si el host se puede pedir sin riesgo de SSRF interno."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False, "solo_http_https"
    host = parsed.hostname or ""
    if _host_is_blocked(host):
        return False, "host_bloqueado"
    return True, ""


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
    current = normalize_url(url)
    hops: list[str] = [current]
    try:
        with httpx.Client(
            follow_redirects=False,
            timeout=timeout,
            verify=True,
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
                    html = resp.content[:MAX_HTML_BYTES].decode(
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


async def fetch_url(url: str, *, method: str = "GET") -> tuple[str, httpx.Headers, int]:
    raw = normalize_url(url)
    async with httpx.AsyncClient(
        follow_redirects=True, timeout=15.0, verify=False
    ) as client:
        if method.upper() == "HEAD":
            resp = await client.head(raw)
        else:
            resp = await client.get(raw)
        resp.raise_for_status()
        return raw, resp.headers, resp.status_code


async def fetch_html(url: str) -> tuple[str, str, httpx.Headers]:
    raw = normalize_url(url)
    async with httpx.AsyncClient(
        follow_redirects=True, timeout=15.0, verify=False
    ) as client:
        resp = await client.get(raw)
        resp.raise_for_status()
        return raw, resp.text, resp.headers
