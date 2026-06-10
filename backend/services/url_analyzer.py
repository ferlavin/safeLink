import json

from services.safe_browsing import check_safe_browsing
from services.url_entropy import analyze_url_entropy
from services.url_heuristics import analyze_url_heuristics
from services.typosquatting import analyze_typosquatting

RISK_LEVELS = [
    (76, "critico"),
    (51, "alto"),
    (26, "medio"),
    (0, "bajo"),
]


def score_to_level(score: int) -> str:
    for threshold, level in RISK_LEVELS:
        if score >= threshold:
            return level
    return "bajo"


def analyze_url(url: str) -> dict:
    url = url.strip()
    entropy = analyze_url_entropy(url)
    typos = analyze_typosquatting(url)
    heuristics = analyze_url_heuristics(url)

    safe_browsing = check_safe_browsing(url)
    heuristic_score = entropy["score"] + typos["score"] + heuristics["score"]
    if typos["score"] >= 25 and heuristics["score"] >= 10:
        heuristic_score += 20
    total_score = min(100, max(heuristic_score, safe_browsing.get("score", 0)))
    if safe_browsing.get("en_lista"):
        total_score = max(total_score, 85)
    level = score_to_level(total_score)

    all_alerts = (
        safe_browsing.get("alertas", [])
        + entropy["alerts"]
        + typos["alerts"]
        + heuristics["alerts"]
    )
    explanation = {
        "safe_browsing": safe_browsing,
        "fuentes": ["heuristicas"]
        + (["safe_browsing"] if safe_browsing.get("disponible") else []),
        "modulos": {
            "entropia": {
                "entropy": entropy["entropy"],
                "score": entropy["score"],
                "alerts": entropy["alerts"],
            },
            "typosquatting": {
                "domain": typos["domain"],
                "score": typos["score"],
                "matches": typos["matches"],
                "alerts": typos["alerts"],
            },
            "heuristicas": {
                "score": heuristics["score"],
                "alerts": heuristics["alerts"],
            },
        },
        "resumen": all_alerts
        if all_alerts
        else ["No encontramos senales claras de peligro."],
    }
    if typos["score"] >= 25 and heuristics["score"] >= 10:
        explanation["resumen"] = [
            "Posible sitio falso con pagina de login — no ingreses datos.",
            *all_alerts,
        ]

    return {
        "url": url,
        "puntuacion_riesgo": total_score,
        "nivel_riesgo": level,
        "explicacion": json.dumps(explanation, ensure_ascii=False),
        "detalle": explanation,
    }
