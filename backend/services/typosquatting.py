import json
from pathlib import Path
from urllib.parse import urlparse


def _levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        curr = [i]
        for j, cb in enumerate(b, 1):
            cost = 0 if ca == cb else 1
            curr.append(min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost))
        prev = curr
    return prev[-1]


def _load_brands() -> list[str]:
    path = Path(__file__).resolve().parent.parent / "data" / "marcas_ar.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def extract_domain(url: str) -> str | None:
    parsed = urlparse(url if "://" in url else f"https://{url}")
    host = (parsed.netloc or parsed.path.split("/")[0]).lower()
    if host.startswith("www."):
        host = host[4:]
    return host or None


def analyze_typosquatting(url: str) -> dict:
    domain = extract_domain(url)
    if not domain:
        return {"domain": None, "score": 0, "alerts": [], "matches": []}

    brands = _load_brands()
    base = domain.split(".")[0]
    matches = []
    score = 0
    alerts = []

    for brand in brands:
        if brand == base:
            continue
        dist = _levenshtein(base, brand)
        if 1 <= dist <= 2:
            matches.append({"brand": brand, "distance": dist, "domain": domain})
            score = max(score, 40 if dist == 1 else 25)
            alerts.append(
                f"El sitio '{domain}' se parece mucho a '{brand}' y podria ser una copia falsa."
            )

    return {
        "domain": domain,
        "score": min(score, 50),
        "alerts": alerts,
        "matches": matches,
    }
