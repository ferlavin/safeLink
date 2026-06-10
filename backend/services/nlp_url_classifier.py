import json
import re
from urllib.parse import urlparse, unquote

from services.url_analyzer import score_to_level

TOKEN_RE = re.compile(r"[a-záéíóúñ0-9]+", re.I)

PHISHING_LEXICON = {
    "urgente": 18,
    "urgent": 18,
    "suspendida": 22,
    "suspendido": 22,
    "bloqueada": 20,
    "bloqueado": 20,
    "verificar": 15,
    "verify": 15,
    "confirmar": 15,
    "confirm": 15,
    "actualizar": 14,
    "update": 12,
    "seguridad": 12,
    "security": 12,
    "login": 10,
    "signin": 10,
    "password": 12,
    "contraseña": 12,
    "cuenta": 10,
    "account": 10,
    "banco": 16,
    "bank": 16,
    "nacion": 14,
    "galicia": 14,
    "mercadopago": 16,
    "afip": 16,
    "premio": 14,
    "gift": 14,
    "free": 12,
    "gratis": 12,
    "click": 10,
    "token": 8,
    "oauth": 8,
    "secure": 8,
    "wallet": 10,
    "crypto": 10,
    "phishing": 25,
    "scam": 25,
    "fraude": 22,
    "estafa": 22,
}

LEGITIMATE_LEXICON = {
    "www": 3,
    "com": 2,
    "org": 2,
    "gov": 8,
    "edu": 8,
    "ar": 4,
    "help": 6,
    "support": 6,
    "docs": 6,
    "about": 4,
    "contact": 4,
    "privacy": 5,
    "terms": 4,
}

URGENCY_PATTERNS = [
    (r"\b24\s*h(oras?)?\b", "Presion temporal (24 horas)", 15),
    (r"\binmediat(o|a)\b", "Lenguaje de urgencia", 12),
    (r"\bexpir(a|e|acion)\b", "Amenaza de expiracion", 14),
    (r"\bultim[oa]\s+oportunidad\b", "Escasez artificial", 16),
]


def _tokenize_url(url: str) -> list[str]:
    parsed = urlparse(url)
    parts = [
        parsed.netloc,
        parsed.path,
        parsed.query,
        unquote(parsed.fragment or ""),
    ]
    text = " ".join(parts).lower()
    return TOKEN_RE.findall(text)


def classify_url_nlp(url: str) -> dict:
    url = url.strip()
    tokens = _tokenize_url(url)
    token_set = set(tokens)

    phishing_score = 0
    legit_score = 0
    matched_phishing: list[dict] = []
    matched_legit: list[str] = []

    for token in tokens:
        if token in PHISHING_LEXICON:
            pts = PHISHING_LEXICON[token]
            phishing_score += pts
            matched_phishing.append({"token": token, "peso": pts})
        if token in LEGITIMATE_LEXICON:
            legit_score += LEGITIMATE_LEXICON[token]
            matched_legit.append(token)

    full_text = " ".join(tokens)
    urgency_alerts = []
    for pattern, msg, pts in URGENCY_PATTERNS:
        if re.search(pattern, full_text, re.I):
            phishing_score += pts
            urgency_alerts.append(msg)

    hyphen_count = url.count("-")
    if hyphen_count >= 3:
        phishing_score += 10
        urgency_alerts.append(f"Dominio con muchos guiones ({hyphen_count})")

    netloc = urlparse(url if "://" in url else f"https://{url}").netloc
    labels = netloc.split(".")
    if len(labels) >= 4:
        phishing_score += 8
        urgency_alerts.append("Subdominio muy largo (posible camuflaje)")

    net_score = max(0, phishing_score - legit_score // 2)
    net_score = min(100, net_score)

    if net_score >= 45:
        categoria = "phishing_probable"
        categoria_label = "Phishing probable"
    elif net_score >= 20:
        categoria = "sospechoso"
        categoria_label = "Sospechoso"
    else:
        categoria = "neutral"
        categoria_label = "Neutral / legitimo"

    confianza = min(99, max(35, net_score + len(matched_phishing) * 3))

    alerts = urgency_alerts.copy()
    if matched_phishing:
        top = sorted(matched_phishing, key=lambda x: -x["peso"])[:5]
        alerts.append(
            "Terminos sensibles: "
            + ", ".join(f"{t['token']} (+{t['peso']})" for t in top)
        )
    if not alerts:
        alerts = ["No se detectaron patrones linguisticos de estafa en la URL."]

    detalle = {
        "tipo": "nlp_url_classifier",
        "url": url,
        "categoria": categoria,
        "categoria_label": categoria_label,
        "confianza_pct": confianza,
        "tokens_analizados": len(tokens),
        "tokens_unicos": len(token_set),
        "terminos_phishing": matched_phishing[:10],
        "terminos_legitimos": matched_legit[:8],
        "puntuacion_phishing": phishing_score,
        "puntuacion_legitima": legit_score,
        "resumen": alerts,
    }

    return {
        "url": url,
        "puntuacion_riesgo": net_score,
        "nivel_riesgo": score_to_level(net_score),
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
