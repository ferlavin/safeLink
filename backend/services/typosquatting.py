import json
from functools import lru_cache
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


@lru_cache(maxsize=1)
def _load_brands() -> list[str]:
    path = Path(__file__).resolve().parent.parent / "data" / "marcas_ar.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def _load_official_domains() -> list[dict]:
    path = Path(__file__).resolve().parent.parent / "data" / "marcas_oficiales.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def extract_domain(url: str) -> str | None:
    parsed = urlparse(url if "://" in url else f"https://{url}")
    host = (parsed.hostname or "").lower()
    if not host:
        netloc = (parsed.netloc or parsed.path.split("/")[0]).lower()
        if "@" in netloc:
            netloc = netloc.rsplit("@", 1)[-1]
        host = netloc.split(":")[0]
    return _bare_host(host) or None


def is_official_domain(domain: str | None) -> bool:
    if not domain:
        return False
    host = _bare_host(domain)
    for entry in _load_official_domains():
        for official in entry.get("dominios", []):
            off = _bare_host(official)
            if host == off or host.endswith(f".{off}"):
                return True
    return False


def _bare_host(host: str) -> str:
    host = (host or "").lower().rstrip(".")
    if host.startswith("www."):
        host = host[4:]
    return host


_CONFUSABLES = str.maketrans(
    {
        "а": "a",
        "е": "e",
        "о": "o",
        "р": "p",
        "с": "c",
        "х": "x",
        "у": "y",
        "і": "i",
        "ԁ": "d",
        "ɡ": "g",
        "４": "4",
        "１": "1",
        "０": "0",
    }
)


def _fold_host(host: str) -> str:
    text = _bare_host(host)
    try:
        text = text.encode("ascii").decode("idna")
    except (UnicodeError, UnicodeDecodeError, UnicodeEncodeError):
        pass
    return text.translate(_CONFUSABLES)


def _embedded_official(domain: str) -> tuple[str, str] | None:
    """Marca + dominio oficial si aparecen como bloque dentro de otro host."""
    host = _bare_host(domain)
    labels = [p for p in _fold_host(host).split(".") if p]
    for entry in _load_official_domains():
        marca = entry.get("marca", "")
        for official in entry.get("dominios", []):
            off = _bare_host(official)
            parts = [p for p in off.split(".") if p]
            n = len(parts)
            if n < 2 or len(labels) < n:
                continue
            for i in range(0, len(labels) - n + 1):
                if labels[i : i + n] != parts:
                    continue
                if host == off or host.endswith(f".{off}"):
                    continue
                return marca, official
    return None


def _folded_official(domain: str) -> tuple[str, str] | None:
    if is_official_domain(domain):
        return None
    folded = _fold_host(domain)
    if folded == _bare_host(domain):
        return None
    for entry in _load_official_domains():
        for official in entry.get("dominios", []):
            off = _bare_host(official)
            if folded == off or folded.endswith(f".{off}"):
                return entry.get("marca", ""), official
    return None


def _is_official_domain(domain: str) -> bool:
    return is_official_domain(domain)


_NOISE_LABELS = frozenset(
    {
        "www",
        "com",
        "net",
        "org",
        "co",
        "ar",
        "gob",
        "gov",
        "app",
        "io",
        "info",
        "edu",
        "cdn",
        "api",
        "static",
        "http",
        "https",
        "www2",
    }
)
_PHISH_LABEL_PARTS = frozenset(
    {
        "login",
        "secure",
        "signin",
        "account",
        "verify",
        "update",
        "support",
        "seguridad",
        "cuenta",
        "auth",
        "online",
        "pago",
        "bank",
        "banco",
        "web",
    }
)


def _meaningful_labels(domain: str) -> list[str]:
    host = _fold_host(domain)
    labels: list[str] = []
    seen: set[str] = set()
    for part in host.split("."):
        if not part or part in _NOISE_LABELS or part in seen:
            continue
        seen.add(part)
        labels.append(part)
    return labels


def _max_edit(brand: str) -> int:
    return 3 if len(brand) >= 8 else 2


def _inflated_brand(label: str, brand: str) -> bool:
    """youtubeee, yexample, galicia-seguridad. No 'internacional' por 'nacion'."""
    if len(brand) < 5:
        return False
    norm_label = _normalize(label)
    norm_brand = _normalize(brand)
    if not norm_brand or norm_label == norm_brand or norm_brand not in norm_label:
        return False
    extra = len(norm_label) - len(norm_brand)
    if extra <= 4 and (norm_label.startswith(norm_brand) or norm_label.endswith(norm_brand)):
        return True
    parts = [p for p in label.lower().replace("_", "-").split("-") if p]
    if norm_brand in parts and any(p in _PHISH_LABEL_PARTS for p in parts if p != norm_brand):
        return True
    return False


def analyze_typosquatting(url: str) -> dict:
    domain = extract_domain(url)
    if not domain:
        return {
            "domain": None,
            "score": 0,
            "alerts": [],
            "matches": [],
            "fuerte": False,
            "oficial": False,
        }

    if is_official_domain(domain):
        return {
            "domain": domain,
            "score": 0,
            "alerts": [],
            "matches": [],
            "fuerte": False,
            "oficial": True,
        }

    labels = _meaningful_labels(domain)
    if not labels:
        labels = [domain.split(".")[0]]
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
        matches.append(
            {"brand": marca, "distance": dist, "domain": domain, "reason": reason}
        )
        score = max(score, pts)
        alerts.append(reason)

    embedded = _embedded_official(domain)
    if embedded:
        marca, official = embedded
        _add_match(
            marca,
            0,
            f"'{domain}' mete el sitio oficial {official} dentro de otra direccion.",
            55,
        )
    folded = _folded_official(domain)
    if folded:
        marca, official = folded
        _add_match(
            marca,
            1,
            f"'{domain}' usa letras parecidas para imitar {official}.",
            55,
        )

    brands = _load_brands()
    for brand in brands:
        norm_brand = _normalize(brand)
        if len(norm_brand) < 3:
            continue
        for label in labels:
            norm_label = _normalize(label)
            if not norm_label:
                continue
            if norm_brand == norm_label:
                _add_match(
                    brand,
                    0,
                    f"'{domain}' usa el nombre '{brand}' pero no es el sitio oficial.",
                    35,
                )
                continue
            dist = _levenshtein(norm_label, norm_brand)
            max_dist = _max_edit(norm_brand)
            if 1 <= dist <= max_dist:
                _add_match(
                    brand,
                    dist,
                    f"'{domain}' se parece a '{brand}' (distancia {dist}); posible sitio falso.",
                    51 if dist == 1 else 30 if dist == 2 else 25,
                )
            elif _inflated_brand(label, brand):
                _add_match(
                    brand,
                    0,
                    f"'{domain}' contiene '{brand}' pero no es un dominio oficial.",
                    35,
                )

    for entry in _load_official_domains():
        marca = entry.get("marca", "")
        for official in entry.get("dominios", []):
            official_base = _bare_host(official).split(".")[0]
            norm_official = _normalize(official_base)
            if len(norm_official) < 4:
                continue
            for label in labels:
                norm_label = _normalize(label)
                if not norm_label:
                    continue
                if norm_official == norm_label:
                    _add_match(
                        marca,
                        0,
                        f"'{domain}' usa el nombre de {marca} pero el sitio oficial es {official}.",
                        35,
                    )
                    continue
                if len(norm_official) < 6:
                    continue
                dist = _levenshtein(norm_label, norm_official)
                max_dist = _max_edit(norm_official)
                if 1 <= dist <= max_dist:
                    _add_match(
                        marca,
                        dist,
                        f"'{domain}' imita a {marca}; el sitio oficial es {official}.",
                        51 if dist <= 1 else 30,
                    )
                elif _inflated_brand(label, official_base):
                    _add_match(
                        marca,
                        0,
                        f"'{domain}' evoca a {marca} pero no coincide con {official}.",
                        35,
                    )

    fuerte = score >= 25 or any(
        m.get("distance", 99) <= 2 or m.get("distance") == 0 for m in matches
    )
    return {
        "domain": domain,
        "score": min(score, 55),
        "alerts": alerts,
        "matches": matches,
        "fuerte": fuerte,
        "oficial": False,
    }
