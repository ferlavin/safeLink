import json
import re
from io import BytesIO

from pypdf import PdfReader

from services.url_analyzer import analyze_url, score_to_level

URL_RE = re.compile(
    r"https?://[^\s\]\)\"'<>]+|www\.[^\s\]\)\"'<>]+",
    re.IGNORECASE,
)


def extract_urls_from_pdf(content: bytes) -> list[str]:
    reader = PdfReader(BytesIO(content))
    text_parts = []
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text_parts.append(extracted)
    full_text = "\n".join(text_parts)
    urls = []
    for match in URL_RE.findall(full_text):
        url = match.rstrip(".,;:")
        if not url.startswith("http"):
            url = f"https://{url}"
        if url not in urls:
            urls.append(url)
    return urls


def analyze_pdf(content: bytes, filename: str) -> dict:
    urls = extract_urls_from_pdf(content)
    link_results = []
    max_score = 0

    for url in urls[:30]:
        r = analyze_url(url)
        max_score = max(max_score, r["puntuacion_riesgo"])
        link_results.append(
            {
                "url": url,
                "puntuacion_riesgo": r["puntuacion_riesgo"],
                "nivel_riesgo": r["nivel_riesgo"],
                "alertas": r["detalle"].get("resumen", []),
            }
        )

    if not urls:
        nivel = "bajo"
        score = 0
        resumen = ["No se encontraron enlaces en el PDF"]
    else:
        nivel = score_to_level(max_score)
        score = max_score
        risky = [l for l in link_results if l["puntuacion_riesgo"] >= 26]
        resumen = [
            f"Se encontraron {len(urls)} enlace(s) en el documento",
            f"{len(risky)} enlace(s) con riesgo medio o superior",
        ]

    detalle = {
        "tipo": "pdf",
        "archivo": filename,
        "total_enlaces": len(urls),
        "enlaces": link_results,
        "resumen": resumen,
    }
    return {
        "url": f"pdf://{filename}",
        "puntuacion_riesgo": score,
        "nivel_riesgo": nivel,
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
