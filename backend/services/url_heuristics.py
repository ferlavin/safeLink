import re
from urllib.parse import urlparse

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

    return {
        "score": min(score, 45),
        "alerts": alerts,
        "ip_host": ip_host,
        "at_trick": at_trick,
        "shady_tld": shady_tld,
        "login_path": login_path and not official,
        "many_dots": many_dots,
        "long_path": long_path,
    }
