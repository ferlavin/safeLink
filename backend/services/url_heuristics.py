import re
from urllib.parse import urlparse


def analyze_url_heuristics(url: str) -> dict:
    score = 0
    alerts = []
    raw = url.strip()
    parsed = urlparse(raw if "://" in raw else f"https://{raw}")
    host = (parsed.netloc or "").lower()
    path = parsed.path or ""

    if re.match(r"^\d{1,3}(\.\d{1,3}){3}(:\d+)?$", host.split(":")[0]):
        score += 30
        alerts.append("No usa un nombre de sitio normal, solo numeros.")

    if "@" in raw:
        score += 35
        alerts.append("El enlace usa un truco con '@' para confundirte.")

    if host.count(".") >= 4:
        score += 20
        alerts.append("Tiene demasiadas partes en la direccion; suele usarse en estafas.")

    if len(path) > 120:
        score += 15
        alerts.append("La direccion del enlace es demasiado larga.")

    suspicious_tlds = (".xyz", ".top", ".click", ".buzz", ".tk", ".ml")
    if any(host.endswith(t) for t in suspicious_tlds):
        score += 15
        alerts.append("Termina en una extension poco habitual y sospechosa.")

    if re.search(r"(login|signin|secure|account|verify|update)", path, re.I):
        score += 10
        alerts.append("Pide datos sensibles en la direccion (login, verificar, etc.).")

    return {"score": min(score, 45), "alerts": alerts}
