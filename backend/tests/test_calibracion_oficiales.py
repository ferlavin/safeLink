"""Dominios oficiales de marcas_oficiales.json + /login deben quedar en bajo."""

import json
from pathlib import Path

import pytest

from services.url_analyzer import analyze_url

DATA = Path(__file__).resolve().parent.parent / "data" / "marcas_oficiales.json"

SAMPLE_MARCAS = ("Banco Galicia", "AFIP", "Mercado Pago", "ANSES")


def _dominios_de(marca: str) -> list[str]:
    for entry in json.loads(DATA.read_text(encoding="utf-8")):
        if entry["marca"] == marca:
            return list(entry["dominios"])
    raise AssertionError(f"No está {marca} en marcas_oficiales.json")


def _casos_oficiales_login():
    casos = []
    for marca in SAMPLE_MARCAS:
        for dominio in _dominios_de(marca):
            casos.append(
                pytest.param(
                    f"https://{dominio}/login",
                    id=f"oficial_login_{dominio}",
                )
            )
            casos.append(
                pytest.param(
                    f"https://www.{dominio}/login",
                    id=f"oficial_www_login_{dominio}",
                )
            )
    return casos


@pytest.mark.parametrize("url", _casos_oficiales_login())
def test_oficial_con_login_es_bajo(url):
    result = analyze_url(url)
    assert result["nivel_riesgo"] == "bajo", (
        f"{url} debía ser bajo, fue {result['nivel_riesgo']} "
        f"({result['puntuacion_riesgo']})"
    )
