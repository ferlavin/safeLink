"""Un TLD sospechoso sin imitar marca no alcanza para crítico."""

import pytest

from services.url_analyzer import analyze_url

TLD_SIN_MARCA = [
    pytest.param("https://randomblog.xyz/", id="xyz_blog"),
    pytest.param("https://ejemplo.xyz/about", id="xyz_about"),
    pytest.param("https://fotos-vacaciones.xyz/", id="xyz_fotos"),
    pytest.param("https://cool-site.top/", id="top_generico"),
    pytest.param("https://newsletter.click/", id="click_generico"),
]


@pytest.mark.parametrize("url", TLD_SIN_MARCA)
def test_tld_sospechoso_sin_marca_no_es_critico(url):
    result = analyze_url(url)
    assert result["nivel_riesgo"] != "critico", (
        f"{url} no debería ser crítico solo por el TLD "
        f"({result['nivel_riesgo']}, {result['puntuacion_riesgo']})"
    )
    assert result["nivel_riesgo"] in {"bajo", "medio"}
