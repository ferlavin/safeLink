import re
from urllib.parse import parse_qs, unquote, urlparse

REDIRECT_KEYS = {
    "url",
    "redirect",
    "redir",
    "next",
    "return",
    "returnurl",
    "continue",
    "dest",
    "destination",
    "goto",
    "target",
    "u",
    "r",
}

SUSPICIOUS_TLDS = (".xyz", ".top", ".click", ".buzz", ".tk", ".ml", ".ga", ".cf", ".gq")
LOGIN_PATH_RE = re.compile(r"(login|signin|secure|account|verify|update)", re.I)
IP_HOST_RE = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")


def analyze_url_heuristics(url: str, *, official: bool = False) -> dict:
    score = 0
    alerts = []
    raw = url.strip()
    parsed = urlparse(raw if "://" in raw else f"https://{raw}")
    host = (parsed.netloc or "").lower()
    host_no_port = host.split(":")[0]
    path = parsed.path or ""

    ip_host = bool(IP_HOST_RE.match(host_no_port))
    if ip_host:
        score += 30
        alerts.append("No usa un nombre de sitio normal, solo numeros.")

    at_trick = "@" in raw
    if at_trick:
        score += 35
        alerts.append("El enlace usa un truco con '@' para confundirte.")

    many_dots = host.count(".") >= 4
    if many_dots:
        score += 20
        alerts.append("Tiene demasiadas partes en la direccion; suele usarse en estafas.")

    long_path = len(path) > 120
    if long_path:
        score += 15
        alerts.append("La direccion del enlace es demasiado larga.")

    shady_tld = any(host_no_port.endswith(t) for t in SUSPICIOUS_TLDS)
    if shady_tld:
        score += 15
        alerts.append("Termina en una extension poco habitual y sospechosa.")

    # En un dominio oficial, /login o /verify son normales (home banking).
    login_path = bool(LOGIN_PATH_RE.search(path))
    if login_path and not official:
        score += 10
        alerts.append("Pide datos sensibles en la direccion (login, verificar, etc.).")

    external_redirect = _external_redirect(parsed, host_no_port)
    if external_redirect:
        score += 40
        alerts.append("El enlace manda a otro sitio escondido en los parametros.")

    return {
        "score": min(score, 55),
        "alerts": alerts,
        "ip_host": ip_host,
        "at_trick": at_trick,
        "shady_tld": shady_tld,
        "login_path": login_path and not official,
        "many_dots": many_dots,
        "long_path": long_path,
        "external_redirect": external_redirect,
    }


def _external_redirect(parsed, page_host: str) -> bool:
    page_host = (page_host or "").lower()
    qs = parse_qs(parsed.query, keep_blank_values=False)
    for key, values in qs.items():
        if key.lower().replace("_", "") not in REDIRECT_KEYS and key.lower() not in REDIRECT_KEYS:
            continue
        for raw in values:
            value = unquote(raw or "").strip()
            if value.startswith("//"):
                value = "https:" + value
            if not value.lower().startswith(("http://", "https://")):
                continue
            other = (urlparse(value).hostname or "").lower()
            if other.startswith("www."):
                other = other[4:]
            page = page_host[4:] if page_host.startswith("www.") else page_host
            if other and other != page and not other.endswith("." + page):
                return True
    return False
