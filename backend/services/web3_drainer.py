import json
import re

from services.http_fetch import normalize_url
from services.typosquatting import analyze_typosquatting, extract_domain, is_official_domain
from services.url_analyzer import score_to_level
from services.url_heuristics import analyze_url_heuristics

# Connect wallet / ethereum solos no pintan rojo: un dapp serio los tiene.
MILD_PATTERNS = [
    (r"connect\s+wallet|conectar\s+billetera|connectwallet", "Boton Connect Wallet"),
    (r"window\.ethereum|ethereum\.request", "Acceso a proveedor Ethereum"),
    (r"walletconnect|WalletConnect", "Integracion WalletConnect"),
    (r"signTypedData|personal_sign|eth_sign", "Solicitud de firma"),
]

DRAIN_PATTERNS = [
    (r"setApprovalForAll", "setApprovalForAll (aprobacion de todos los tokens)", 40),
    (r"transferFrom|safeTransferFrom", "transferFrom (posible drenaje)", 35),
    (r"unlimited\s+approval|maxUint256|0xffffffffffffffffffffffffffffffff", "Aprobacion ilimitada (maxUint256)", 40),
    (r"drain|drainer|sweep\s+funds", "Terminologia de drainer", 35),
    (r"approve\s*\([^)]*maxUint256|permit\s*\(", "approve/permit con tope ilimitado", 30),
]


def scan_web3_html(html: str) -> dict:
    """Senales Web3 sobre HTML ya descargado. No inventa score si html esta vacio."""
    if not html:
        return {
            "drain": False,
            "mild": False,
            "alertas": [],
            "patrones": [],
            "connect_wallet": False,
        }
    alertas = []
    patrones = []
    mild = False
    drain = False
    for pattern, msg in MILD_PATTERNS:
        if re.search(pattern, html, re.I):
            mild = True
            patrones.append({"patron": msg, "severidad": "info"})
    for pattern, msg, pts in DRAIN_PATTERNS:
        if re.search(pattern, html, re.I):
            drain = True
            alertas.append(msg)
            patrones.append({"patron": msg, "severidad": "drain", "puntos": pts})
    connect_wallet = bool(
        re.search(r"connect\s*wallet|conectar\s*billetera", html, re.I)
    )
    return {
        "drain": drain,
        "mild": mild,
        "alertas": alertas,
        "patrones": patrones,
        "connect_wallet": connect_wallet,
    }


async def analyze_web3_drainer(url: str) -> dict:
    raw = normalize_url(url)
    domain = extract_domain(raw)
    official = is_official_domain(domain)

    from services.http_fetch import fetch_page_safe

    fetched = fetch_page_safe(raw, timeout=5.0, want_html=True)
    if not fetched.get("ok"):
        detalle = {
            "tipo": "web3_drainer",
            "url": raw,
            "omitido": True,
            "motivo": fetched.get("motivo") or "error",
            "patrones_detectados": [],
            "connect_wallet_detectado": False,
            "resumen": [
                "No se pudo leer la pagina; no inventamos un riesgo Web3."
            ],
        }
        return {
            "url": raw,
            "puntuacion_riesgo": 0,
            "nivel_riesgo": "bajo",
            "explicacion": json.dumps(detalle, ensure_ascii=False),
            "detalle": detalle,
        }

    typos = analyze_typosquatting(raw)
    heuristics = analyze_url_heuristics(raw, official=official)
    tramposo = bool(
        typos.get("fuerte")
        or heuristics.get("shady_tld")
        or heuristics.get("ip_host")
        or heuristics.get("at_trick")
    )

    scan = scan_web3_html(fetched.get("html") or "")
    score = 0
    alerts = list(scan["alertas"])
    if scan["drain"] and not official and tramposo:
        score = 70
        alerts.insert(
            0,
            "Patrones de drenaje de fondos en un dominio que no es oficial.",
        )
    elif scan["drain"] and not official:
        alerts.append(
            "Hay llamadas de aprobacion de tokens; el dominio no parece tramposo por si solo."
        )
    elif scan["mild"]:
        alerts.append(
            "La pagina pide conectar wallet; eso solo no implica que sea una estafa."
        )

    score = min(100, score)
    nivel = score_to_level(score) if score else "bajo"
    detalle = {
        "tipo": "web3_drainer",
        "url": fetched.get("final_url") or raw,
        "patrones_detectados": scan["patrones"],
        "connect_wallet_detectado": scan["connect_wallet"],
        "drenaje": scan["drain"],
        "dominio_oficial": official,
        "resumen": alerts
        or ["No se detectaron patrones tipicos de crypto drainer en el HTML"],
    }
    return {
        "url": raw,
        "puntuacion_riesgo": score,
        "nivel_riesgo": nivel,
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
