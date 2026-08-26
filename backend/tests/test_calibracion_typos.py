"""Typos obvios de Galicia / AFIP / Mercado Pago → alto o crítico."""

import pytest

from services.url_analyzer import analyze_url

ALTO_O_CRITICO = {"alto", "critico"}

# Una letra de diferencia o TLD raro / path de login sobre la marca.
TYPOS = [
    pytest.param("https://bancogalica.com/login", id="galicia_falta_letra_login"),
    pytest.param("https://bancogalicla.com/", id="galicia_letra_transpuesta"),
    pytest.param("https://galicia.xyz/", id="galicia_tld_xyz"),
    pytest.param("https://galicia-seguridad.com/login", id="galicia_dominio_trucho_login"),
    pytest.param("https://afip.xyz/", id="afip_tld_xyz"),
    pytest.param("https://afip.com/login", id="afip_no_oficial_login"),
    pytest.param("https://mercadopaqo.com.ar/", id="mercadopago_una_letra"),
    pytest.param("https://mercadopago.xyz/login", id="mercadopago_tld_xyz_login"),
    pytest.param(
        "https://secure.galicia.com.ar.verify-user.xyz/login",
        id="galicia_oficial_embebido",
    ),
    pytest.param("https://login.afip.gob.ar.seguridad.com/", id="afip_oficial_embebido"),
    pytest.param(
        "https://galicia.com.ar@phishing-login.xyz/secure",
        id="galicia_truco_arroba",
    ),
    pytest.param(
        "https://galicia.com.ar/login?url=https://evil-login.xyz/",
        id="galicia_redirect_oculto",
    ),
]


@pytest.mark.parametrize("url", TYPOS)
def test_typo_obvio_es_alto_o_critico(url):
    result = analyze_url(url)
    assert result["nivel_riesgo"] in ALTO_O_CRITICO, (
        f"{url} debía ser alto/crítico, fue {result['nivel_riesgo']} "
        f"({result['puntuacion_riesgo']})"
    )
