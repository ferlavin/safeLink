"""Palabra clave personal: se guarda en texto plano para mostrarla en correos."""

from __future__ import annotations

import html
import re

HTML_TAG_RE = re.compile(r"<[^>]*>")
CONTROL_RE = re.compile(r"[\x00-\x1f\x7f]")
ZERO_WIDTH_RE = re.compile(r"[\u200b-\u200d\ufeff]")

_OK_MESSAGE = "Palabra clave actualizada correctamente"


class AntiPhishingWordError(ValueError):
    """Input inválido para la palabra clave."""


def sanitize_anti_phishing_word(raw: str | None) -> str:
    if raw is None:
        raise AntiPhishingWordError("La palabra no puede estar vacia")
    text = html.unescape(str(raw))
    if HTML_TAG_RE.search(text):
        raise AntiPhishingWordError("La palabra no puede incluir HTML")
    text = CONTROL_RE.sub("", text)
    text = ZERO_WIDTH_RE.sub("", text)
    text = " ".join(text.split())
    lowered = text.lower()
    if not text:
        raise AntiPhishingWordError("La palabra no puede estar vacia ni ser solo espacios")
    if "<" in text or ">" in text or "javascript:" in lowered or "onerror=" in lowered:
        raise AntiPhishingWordError("La palabra no puede incluir HTML")
    if len(text) < 3:
        raise AntiPhishingWordError("La palabra debe tener al menos 3 caracteres")
    if len(text) > 100:
        raise AntiPhishingWordError("La palabra no puede superar 100 caracteres")
    return text


def official_email_footer(word: str | None) -> str:
    if not word:
        return (
            "\n\n—\nEste mensaje es de SafeLink. Si configuraste una palabra clave "
            "de seguridad y no aparece acá, no confíes en este correo."
        )
    return (
        f"\n\n—\nPalabra clave de seguridad: {word}\n"
        "SafeLink siempre incluye tu palabra en correos oficiales. "
        "Si un mensaje que dice ser nuestro no la tiene, no lo abras."
    )


def compose_official_email(*, subject: str, body: str, word: str | None) -> tuple[str, str]:
    """Todo correo oficial tiene que pasar por acá para no olvidar la palabra."""
    return subject, body.rstrip() + official_email_footer(word)


def official_email_html_mark(word: str | None) -> str:
    if not word:
        return (
            "<p>Este mensaje es de SafeLink. Si configuraste una palabra clave "
            "de seguridad y no aparece acá, no confíes en este correo.</p>"
        )
    safe = html.escape(word)
    return (
        f"<p><strong>Palabra clave de seguridad:</strong> {safe}</p>"
        "<p>SafeLink siempre incluye tu palabra en correos oficiales. "
        "Si un mensaje que dice ser nuestro no la tiene, no lo abras.</p>"
    )


def send_official_email(user, subject: str, body: str) -> bool:
    """Prepara el correo con la palabra del usuario.

    Hoy no hay SMTP configurado: igual se arma el cuerpo para que ningún
    envío futuro se mande sin el sello. Devuelve False si no se despachó.
    """
    word = getattr(user, "anti_phishing_word", None)
    compose_official_email(subject=subject, body=body, word=word)
    return False
