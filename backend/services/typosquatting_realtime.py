import json
from pathlib import Path

from services.typosquatting import _levenshtein, _load_brands, extract_domain
from services.url_analyzer import score_to_level


def _normalize(s: str) -> str:
    return s.lower().replace("-", "").replace(".", "")


def _load_official_domains() -> list[dict]:
    path = Path(__file__).resolve().parent.parent / "data" / "marcas_oficiales.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def analyze_typosquatting_realtime(url: str) -> dict:
    """Comparacion dedicada dominio actual vs marcas argentinas (Levenshtein)."""
    domain = extract_domain(url)
    if not domain:
        raise ValueError("Dominio invalido")

    base = domain.split(".")[0]
    norm_domain = _normalize(domain)
    brands = _load_brands()
    official = _load_official_domains()

    matches = []
    score = 0
    alerts = []

    for brand in brands:
        if brand == base:
            continue
        dist = _levenshtein(base, brand)
        if 1 <= dist <= 2:
            matches.append(
                {
                    "tipo": "nombre_similar",
                    "marca": brand,
                    "distancia": dist,
                    "dominio_analizado": domain,
                }
            )
            score = max(score, 45 if dist == 1 else 30)
            alerts.append(
                f"El nombre '{domain}' se parece a la marca '{brand}' y podria ser una estafa."
            )

    for entry in official:
        for oficial in entry["dominios"]:
            norm_oficial = _normalize(oficial)
            if norm_domain == norm_oficial:
                continue
            dist_full = _levenshtein(norm_domain, norm_oficial)
            if 1 <= dist_full <= 3:
                matches.append(
                    {
                        "tipo": "dominio_imitador",
                        "marca": entry["marca"],
                        "dominio_legitimo": oficial,
                        "distancia": dist_full,
                        "dominio_analizado": domain,
                    }
                )
                score = max(score, 50 if dist_full <= 2 else 35)
                alerts.append(
                    f"Podria estar fingiendo ser {entry['marca']}: '{domain}' en lugar del sitio real '{oficial}'."
                )

    score = min(100, score)
    nivel = score_to_level(score)
    detalle = {
        "tipo": "typosquatting_tiempo_real",
        "dominio_actual": domain,
        "matches": matches,
        "resumen": alerts
        or [f"'{domain}' no parece copiar marcas conocidas de Argentina."],
    }
    return {
        "url": f"typosquat://{domain}",
        "puntuacion_riesgo": score,
        "nivel_riesgo": nivel,
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
