import json
import re
from collections import Counter

import httpx

from services.url_entropy import shannon_entropy
from services.url_analyzer import score_to_level

OBFUSCATION_PATTERNS = [
    (r"\beval\s*\(", "Uso de eval()", 25),
    (r"Function\s*\(", "Constructor Function()", 20),
    (r"atob\s*\(|btoa\s*\(", "Codificacion Base64 en runtime", 18),
    (r"\\x[0-9a-fA-F]{2}", "Secuencias hex escapadas", 15),
    (r"\\u[0-9a-fA-F]{4}", "Secuencias unicode escapadas", 12),
    (r"document\.write\s*\(", "document.write dinamico", 15),
    (r"fromCharCode", "Construccion de strings por char codes", 18),
]

RANDOM_VAR_RE = re.compile(r"\b[a-z][a-z0-9]{7,12}\b", re.I)


def _analyze_js_block(code: str) -> dict:
    score = 0
    alerts = []
    for pattern, msg, pts in OBFUSCATION_PATTERNS:
        if re.search(pattern, code):
            score += pts
            alerts.append(msg)

    entropy = round(shannon_entropy(code), 3)
    if entropy >= 5.5:
        score += 20
        alerts.append(f"Entropia del script muy alta ({entropy})")

    vars_found = RANDOM_VAR_RE.findall(code)
    if len(vars_found) >= 8:
        counts = Counter(vars_found)
        if max(counts.values()) <= 2 and len(counts) >= 6:
            score += 15
            alerts.append("Muchos identificadores aleatorios (posible ofuscacion)")

    return {"score": min(score, 60), "alerts": alerts, "entropy": entropy}


async def fetch_page_scripts(url: str) -> tuple[str, list[dict]]:
    async with httpx.AsyncClient(
        follow_redirects=True, timeout=15.0, verify=False
    ) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        html = resp.text

    scripts = []
    for match in re.finditer(r"<script[^>]*>(.*?)</script>", html, re.I | re.S):
        inline = match.group(1).strip()
        if inline:
            scripts.append({"tipo": "inline", "src": None, "size": len(inline)})

    for match in re.finditer(
        r'<script[^>]+src=["\']([^"\']+)["\']', html, re.I
    ):
        scripts.append({"tipo": "externo", "src": match.group(1), "size": 0})

    return html, scripts


async def analyze_page_javascript(url: str) -> dict:
    raw_url = url.strip()
    if not raw_url.startswith(("http://", "https://")):
        raw_url = f"https://{raw_url}"

    try:
        html, script_meta = await fetch_page_scripts(raw_url)
    except Exception as exc:
        raise ValueError(f"No se pudo obtener la pagina: {exc}") from exc

    inline_blocks = re.findall(
        r"<script[^>]*>(.*?)</script>", html, re.I | re.S
    )
    total_score = 0
    all_alerts = []
    block_results = []

    for i, block in enumerate(inline_blocks):
        if not block.strip():
            continue
        r = _analyze_js_block(block)
        total_score = max(total_score, r["score"])
        all_alerts.extend(r["alerts"])
        block_results.append(
            {
                "bloque": i + 1,
                "score": r["score"],
                "entropy": r["entropy"],
                "alerts": r["alerts"],
            }
        )

    if len(script_meta) > 15:
        total_score += 10
        all_alerts.append("Cantidad inusual de scripts en la pagina")

    total_score = min(100, total_score)
    nivel = score_to_level(total_score)
    detalle = {
        "tipo": "javascript",
        "url": raw_url,
        "scripts_detectados": len(script_meta),
        "bloques_inline_analizados": len(block_results),
        "bloques": block_results[:10],
        "scripts": script_meta[:20],
        "resumen": all_alerts
        or ["No se detecto ofuscacion significativa en scripts inline"],
    }
    return {
        "url": raw_url,
        "puntuacion_riesgo": total_score,
        "nivel_riesgo": nivel,
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
