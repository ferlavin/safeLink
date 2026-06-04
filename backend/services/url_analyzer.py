import json

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

    total_score = min(
        100,
        entropy["score"] + typos["score"] + heuristics["score"],
    )
    level = score_to_level(total_score)

    all_alerts = entropy["alerts"] + typos["alerts"] + heuristics["alerts"]
    explanation = {
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

    return {
        "url": url,
        "puntuacion_riesgo": total_score,
        "nivel_riesgo": level,
        "explicacion": json.dumps(explanation, ensure_ascii=False),
        "detalle": explanation,
    }
