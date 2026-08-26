"""SSRF: loopback / metadata no se fetchean (Fase 2)."""

import asyncio

import pytest

from services.http_fetch import UnsafeUrlError, assert_public_http_url, assert_scan_http_url, fetch_html

LOOPBACK = [
    pytest.param("http://127.0.0.1/", id="ipv4_loopback"),
    pytest.param("http://127.0.0.1:8080/secret", id="ipv4_loopback_puerto"),
    pytest.param("http://localhost/", id="localhost"),
    pytest.param("http://[::1]/", id="ipv6_loopback"),
    pytest.param("http://169.254.169.254/", id="link_local_metadata"),
]


@pytest.mark.parametrize("url", LOOPBACK)
def test_assert_rechaza_url_interna(url):
    with pytest.raises(UnsafeUrlError):
        assert_public_http_url(url)


def test_fetch_html_127_no_abre_httpx(monkeypatch):
    """El GET no debe llegar a ejecutarse."""

    def boom(*_args, **_kwargs):
        raise AssertionError("httpx.AsyncClient no debería construirse para 127.0.0.1")

    monkeypatch.setattr("services.http_fetch.httpx.AsyncClient", boom)
    with pytest.raises(UnsafeUrlError):
        asyncio.run(fetch_html("http://127.0.0.1/"))


def test_scan_acepta_dominio_inexistente():
    url = "https://no-existe-safelink-test.invalid/login"
    assert assert_scan_http_url(url) == url


def test_scan_acepta_truco_arroba():
    url = "https://galicia.com.ar@evil.example/login"
    assert assert_scan_http_url(url) == url


def test_scan_sigue_bloqueando_localhost():
    with pytest.raises(UnsafeUrlError):
        assert_scan_http_url("http://127.0.0.1/")
