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


def _normalize(s: str) -> str:
    return s.lower().replace("-", "").replace(".", "").replace("_", "")


def _load_brands() -> list[str]:
    path = Path(__file__).resolve().parent.parent / "data" / "marcas_ar.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _load_official_domains() -> list[dict]:
    path = Path(__file__).resolve().parent.parent / "data" / "marcas_oficiales.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def extract_domain(url: str) -> str | None:
    parsed = urlparse(url if "://" in url else f"https://{url}")
    host = (parsed.netloc or parsed.path.split("/")[0]).lower()
    if host.startswith("www."):
        host = host[4:]
    return host or None


def _is_official_domain(domain: str) -> bool:
    domain = domain.lower()
    if domain.startswith("www."):
        domain = domain[4:]
    for entry in _load_official_domains():
        for official in entry.get("dominios", []):
            if domain == official or domain.endswith(f".{official}"):
                return True
    return False


def analyze_typosquatting(url: str) -> dict:
    domain = extract_domain(url)
    if not domain:
        return {"domain": None, "score": 0, "alerts": [], "matches": []}

    if _is_official_domain(domain):
        return {
            "domain": domain,
            "score": 0,
            "alerts": [],
            "matches": [],
        }

    base = domain.split(".")[0]
    norm_base = _normalize(base)
    matches = []
    score = 0
    alerts = []
    seen: set[str] = set()

    def _add_match(marca: str, dist: int, reason: str, pts: int) -> None:
        nonlocal score
        key = f"{marca}:{reason}"
        if key in seen:
            return
        seen.add(key)
        matches.append({"brand": marca, "distance": dist, "domain": domain, "reason": reason})
        score = max(score, pts)
        alerts.append(reason)

    brands = _load_brands()
    for brand in brands:
        norm_brand = _normalize(brand)
        if norm_brand == norm_base:
            if not _is_official_domain(domain):
                _add_match(
                    brand,
                    0,
                    f"'{domain}' usa el nombre '{brand}' pero no es el sitio oficial.",
                    35,
                )
            continue
        dist = _levenshtein(norm_base, norm_brand)
        max_dist = 3 if len(norm_brand) >= 8 else 2
        if 1 <= dist <= max_dist:
            _add_match(
                brand,
                dist,
                f"'{domain}' se parece a '{brand}' (distancia {dist}); posible sitio falso.",
                40 if dist == 1 else 30 if dist == 2 else 25,
            )
        elif len(norm_brand) >= 5 and norm_brand in norm_base and norm_brand != norm_base:
            _add_match(
                brand,
                0,
                f"'{domain}' contiene '{brand}' pero no es un dominio oficial.",
                35,
            )

    for entry in _load_official_domains():
        marca = entry.get("marca", "")
        for official in entry.get("dominios", []):
            official_base = official.split(".")[0]
            norm_official = _normalize(official_base)
            if norm_official == norm_base:
                continue
            dist = _levenshtein(norm_base, norm_official)
            max_dist = 3 if len(norm_official) >= 8 else 2
            if 1 <= dist <= max_dist:
                _add_match(
                    marca,
                    dist,
                    f"'{domain}' imita a {marca}; el sitio oficial es {official}.",
                    40 if dist <= 1 else 30,
                )
            elif len(norm_official) >= 6 and norm_official in norm_base:
                _add_match(
                    marca,
                    0,
                    f"'{domain}' evoca a {marca} pero no coincide con {official}.",
                    35,
                )

    return {
        "domain": domain,
        "score": min(score, 50),
        "alerts": alerts,
        "matches": matches,
    }
