import pytest

from services.anti_phishing import (
    AntiPhishingWordError,
    compose_official_email,
    official_email_html_mark,
    sanitize_anti_phishing_word,
)


def test_acepta_frase_normal():
    assert sanitize_anti_phishing_word("  luna roja  ") == "luna roja"


def test_rechaza_vacio_y_espacios():
    with pytest.raises(AntiPhishingWordError):
        sanitize_anti_phishing_word("   ")
    with pytest.raises(AntiPhishingWordError):
        sanitize_anti_phishing_word("")


def test_rechaza_corto():
    with pytest.raises(AntiPhishingWordError):
        sanitize_anti_phishing_word("ab")


def test_rechaza_html_aunque_quede_texto():
    with pytest.raises(AntiPhishingWordError):
        sanitize_anti_phishing_word("<script>alert(1)</script>")
    with pytest.raises(AntiPhishingWordError):
        sanitize_anti_phishing_word("mi <b>clave</b> secreta")


def test_rechaza_javascript():
    with pytest.raises(AntiPhishingWordError):
        sanitize_anti_phishing_word("javascript:alert(1)")


def test_tope_100():
    with pytest.raises(AntiPhishingWordError):
        sanitize_anti_phishing_word("a" * 101)


def test_correo_oficial_incluye_la_palabra():
    subject, body = compose_official_email(
        subject="Aviso",
        body="Hola",
        word="luna roja",
    )
    assert subject == "Aviso"
    assert "luna roja" in body
    assert "Palabra clave" in body


def test_html_escapa_la_palabra():
    mark = official_email_html_mark('a & b <c>')
    assert "&amp;" in mark
    assert "<c>" not in mark
