"""Imprime URL → nivel para calibrar el semáforo a mano.

Uso (desde backend/):

    python -m scripts.calibrate
"""

from __future__ import annotations

from unittest.mock import patch

from services.url_analyzer import analyze_url

SB_OFF = {
    "disponible": False,
    "en_lista": False,
    "amenazas": [],
    "score": 0,
    "alertas": [],
}

CASOS = [
    ("oficial Galicia + /login", "https://bancogalicia.com/login"),
    ("oficial Galicia www + /login", "https://www.bancogalicia.com.ar/login"),
    ("oficial AFIP + /login", "https://afip.gob.ar/login"),
    ("oficial Mercado Pago + /login", "https://www.mercadopago.com.ar/login"),
    ("oficial ANSES + /login", "https://anses.gob.ar/login"),
    ("typo Galicia falta letra + login", "https://bancogalica.com/login"),
    ("typo Galicia transpuesta", "https://bancogalicla.com/"),
    ("typo Galicia TLD .xyz", "https://galicia.xyz/"),
    ("typo Galicia dominio trucho + login", "https://galicia-seguridad.com/login"),
    ("typo AFIP .xyz", "https://afip.xyz/"),
    ("typo AFIP .com + login", "https://afip.com/login"),
    ("typo Mercado Pago una letra", "https://mercadopaqo.com.ar/"),
    ("typo Mercado Pago .xyz + login", "https://mercadopago.xyz/login"),
    ("TLD .xyz sin marca", "https://randomblog.xyz/"),
    ("TLD .xyz about sin marca", "https://ejemplo.xyz/about"),
    ("TLD .top sin marca", "https://cool-site.top/"),
]


def main() -> None:
    print(f"{'caso':<42} {'nivel':<8} {'pts':>4}  url")
    print("-" * 110)
    with patch("services.url_analyzer.check_safe_browsing", lambda url: dict(SB_OFF)):
        for caso, url in CASOS:
            result = analyze_url(url)
            print(
                f"{caso:<42} {result['nivel_riesgo']:<8} {result['puntuacion_riesgo']:>4}  {url}"
            )


if __name__ == "__main__":
    main()
