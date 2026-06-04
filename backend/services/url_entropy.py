import math
from collections import Counter


def shannon_entropy(text: str) -> float:
    """Entropia de Shannon sobre la cadena (bits por caracter)."""
    if not text:
        return 0.0
    counts = Counter(text)
    length = len(text)
    return -sum(
        (c / length) * math.log2(c / length) for c in counts.values()
    )


def analyze_url_entropy(url: str) -> dict:
    entropy = round(shannon_entropy(url), 3)
    # URLs normales suelen estar entre 3.5 y 5.5; valores muy altos son sospechosos
    score = 0
    alerts = []
    if entropy >= 5.8:
        score = 35
        alerts.append("El enlace se ve muy raro o enredado; puede estar ocultando algo.")
    elif entropy >= 5.2:
        score = 18
        alerts.append("El enlace es mas largo o confuso de lo normal.")
    return {
        "entropy": entropy,
        "score": score,
        "alerts": alerts,
    }
