import json
import re

import httpx

from services.url_analyzer import score_to_level

DRAINER_PATTERNS = [
    (r"connect\s+wallet|conectar\s+billetera|connectwallet", "Boton Connect Wallet detectado", 20),
    (r"window\.ethereum|ethereum\.request", "Acceso a proveedor Ethereum", 25),
    (r"walletconnect|WalletConnect", "Integracion WalletConnect", 15),
    (r"setApprovalForAll|approve\s*\(|permit\s*\(", "Solicitud de aprobacion de tokens", 35),
    (r"transferFrom|safeTransferFrom", "Patron transferFrom (posible drenaje)", 30),
    (r"unlimited\s+approval|maxUint256|0xffffffffffffffffffffffffffffffff", "Aprobacion ilimitada de fondos", 40),
    (r"signTypedData|personal_sign|eth_sign", "Solicitud de firma de transaccion", 20),
    (r"drain|drainer|sweep\s+funds", "Terminologia de drainer en codigo", 35),
]


async def analyze_web3_drainer(url: str) -> dict:
    raw = url.strip()
    if not raw.startswith(("http://", "https://")):
        raw = f"https://{raw}"

    async with httpx.AsyncClient(
        follow_redirects=True, timeout=15.0, verify=False
    ) as client:
        resp = await client.get(raw)
        html = resp.text.lower()

    score = 0
    alerts = []
    patrones = []

    for pattern, msg, pts in DRAINER_PATTERNS:
        if re.search(pattern, html, re.I):
            score += pts
            alerts.append(msg)
            patrones.append({"patron": msg, "puntos": pts})

    wallet_buttons = len(re.findall(r"connect\s*wallet|conectar\s*billetera", html, re.I))
    if wallet_buttons >= 2:
        score += 15
        alerts.append("Multiples llamados a conectar wallet en la misma pagina")

    score = min(100, score)
    nivel = score_to_level(score)
    detalle = {
        "tipo": "web3_drainer",
        "url": raw,
        "patrones_detectados": patrones,
        "connect_wallet_detectado": wallet_buttons > 0,
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
