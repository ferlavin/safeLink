"""Generador de dataset sintetico de URLs legitimas vs phishing.

No usamos ninguna API: construimos ejemplos a partir de marcas conocidas y de
patrones tipicos de phishing (tokens de urgencia, TLDs raros, guiones,
sustitucion de letras por numeros, subdominios largos, IPs, etc.).
El transformer aprende esos patrones a nivel de caracteres.
"""

from __future__ import annotations

import json
import random
from pathlib import Path

BRANDS = [
    "google", "microsoft", "apple", "paypal", "netflix", "spotify", "instagram",
    "facebook", "whatsapp", "amazon", "mercadolibre", "mercadopago", "santander",
    "galicia", "bbva", "icbc", "macro", "supervielle", "patagonia", "brubank",
    "uala", "bancnacion", "banconacion", "afip", "anses", "binance", "ripio",
    "buenbit", "despegar", "rappi", "pedidosya", "movistar", "claro", "personal",
]

LEGIT_TLDS = [".com", ".com.ar", ".org", ".net", ".gov.ar", ".edu.ar", ".io", ".co"]
LEGIT_SUBS = ["", "www.", "app.", "login.", "secure.", "cuenta.", "mi."]
LEGIT_PATHS = [
    "", "/", "/login", "/home", "/account", "/dashboard", "/help",
    "/productos", "/ingresar", "/mi-cuenta", "/soporte", "/checkout",
    "/index.html", "/es/login", "/banca-online",
]

BAD_TLDS = [
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".click", ".club",
    ".online", ".site", ".info", ".buzz", ".rest", ".zip", ".live", ".cam",
    ".xy2", ".cc", ".ru", ".su", ".work",
]
PHISH_TOKENS = [
    "login", "secure", "verify", "verificar", "seguro", "actualizar", "update",
    "confirmar", "confirm", "account", "cuenta", "soporte", "support", "alerta",
    "suspendida", "bloqueada", "acceso", "ingreso", "validacion", "premio",
    "recompensa", "gratis", "oferta", "token", "wallet", "auth", "signin",
]
SEPARATORS = ["-", ".", "", "_"]
LEET = {"o": "0", "i": "1", "l": "1", "e": "3", "a": "4", "s": "5"}


def _leetify(word: str, prob: float = 0.4) -> str:
    out = []
    for ch in word:
        if ch in LEET and random.random() < prob:
            out.append(LEET[ch])
        else:
            out.append(ch)
    return "".join(out)


def make_legit(rng: random.Random) -> str:
    brand = rng.choice(BRANDS)
    sub = rng.choice(LEGIT_SUBS)
    tld = rng.choice(LEGIT_TLDS)
    path = rng.choice(LEGIT_PATHS)
    scheme = "https://" if rng.random() < 0.9 else "http://"
    return f"{scheme}{sub}{brand}{tld}{path}"


def make_phishing(rng: random.Random) -> str:
    brand = rng.choice(BRANDS)
    style = rng.randint(0, 6)
    scheme = "https://" if rng.random() < 0.5 else "http://"

    if style == 0:
        # banco-seguro-login.tk
        tokens = rng.sample(PHISH_TOKENS, rng.randint(2, 4))
        sep = rng.choice(["-", "."])
        host = sep.join([brand] + tokens)
        tld = rng.choice(BAD_TLDS)
        return f"{scheme}{host}{tld}/{rng.choice(PHISH_TOKENS)}"

    if style == 1:
        # leet del brand: g00gle-verify.xyz
        host = _leetify(brand, 0.6) + rng.choice(SEPARATORS) + rng.choice(PHISH_TOKENS)
        return f"{scheme}{host}{rng.choice(BAD_TLDS)}/login"

    if style == 2:
        # subdominio largo: brand.com.secure-login.tk
        host = f"{brand}.com{rng.choice(['-', '.'])}{rng.choice(PHISH_TOKENS)}{rng.choice(['-', '.'])}{rng.choice(PHISH_TOKENS)}"
        return f"{scheme}{host}{rng.choice(BAD_TLDS)}"

    if style == 3:
        # IP directa con path de marca
        ip = ".".join(str(rng.randint(1, 255)) for _ in range(4))
        return f"{scheme}{ip}/{brand}/{rng.choice(PHISH_TOKENS)}.php"

    if style == 4:
        # brand-arg-soporte123.online
        host = f"{brand}{rng.choice(['-', ''])}{rng.choice(['ar', 'arg', 'oficial', 'soporte'])}{rng.randint(1, 999)}"
        return f"{scheme}{host}{rng.choice(BAD_TLDS)}/{rng.choice(PHISH_TOKENS)}"

    if style == 5:
        # marca como subdominio de dominio random
        rand = "".join(rng.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(rng.randint(6, 12)))
        return f"{scheme}{brand}.{rand}{rng.choice(BAD_TLDS)}/{rng.choice(PHISH_TOKENS)}"

    # style 6: muchos guiones
    tokens = rng.sample(PHISH_TOKENS, rng.randint(3, 5))
    host = "-".join([brand] + tokens)
    return f"{scheme}{host}{rng.choice(BAD_TLDS)}"


def build_dataset(n_per_class: int = 6000, seed: int = 42) -> list[tuple[str, int]]:
    rng = random.Random(seed)
    data: list[tuple[str, int]] = []
    seen: set[str] = set()

    def add(url: str, label: int):
        if url not in seen:
            seen.add(url)
            data.append((url, label))

    attempts = 0
    while sum(1 for _, l in data if l == 0) < n_per_class and attempts < n_per_class * 5:
        add(make_legit(rng), 0)
        attempts += 1
    attempts = 0
    while sum(1 for _, l in data if l == 1) < n_per_class and attempts < n_per_class * 5:
        add(make_phishing(rng), 1)
        attempts += 1

    rng.shuffle(data)
    return data


if __name__ == "__main__":
    ds = build_dataset(2000)
    out = Path(__file__).resolve().parent / "sample_dataset.json"
    out.write_text(json.dumps(ds[:50], ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generadas {len(ds)} URLs. Muestra en {out}")
