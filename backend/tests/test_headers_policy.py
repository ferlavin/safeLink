"""Headers flojos, solos, no pintan peligro (alto/crítico)."""

import asyncio

import pytest

from services.security_headers import analyze_security_headers

PELIGRO = {"alto", "critico"}


def test_headers_malos_en_sitio_generico_no_son_peligro(monkeypatch):
    async def fake_fetch(url):
        html = "<html><head><title>Recetas de cocina</title></head><body>Hola</body></html>"
        return url, html, {}

    monkeypatch.setattr("services.security_headers.fetch_html", fake_fetch)
    result = asyncio.run(analyze_security_headers("https://recetas-de-la-abuela.com/"))
    assert result["nivel_riesgo"] not in PELIGRO, (
        f"Headers ausentes en un blog no deberían ser peligro; "
        f"fue {result['nivel_riesgo']} ({result['puntuacion_riesgo']})"
    )
    assert result["detalle"]["contexto_sensible"] is False


def test_headers_malos_en_contexto_banco_pueden_ser_altos(monkeypatch):
    """Si el HTML se hace pasar por un banco, el semáforo sí puede subir."""

    async def fake_fetch(url):
        html = "<html><title>Home banking Galicia</title><body>Iniciar sesion</body></html>"
        return url, html, {}

    monkeypatch.setattr("services.security_headers.fetch_html", fake_fetch)
    result = asyncio.run(analyze_security_headers("https://sitio-generico.example/"))
    assert result["detalle"]["contexto_sensible"] is True
    assert result["puntuacion_riesgo"] > 45
