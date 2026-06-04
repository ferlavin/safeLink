"""Textos en lenguaje claro para usuarios (web y extension)."""

from __future__ import annotations

NIVEL_LABELS = {
    "bajo": "Parece seguro",
    "medio": "Ten cuidado",
    "alto": "Riesgo alto",
    "critico": "Muy peligroso",
}

ESTADO_LABELS = {
    "seguro": "Seguro",
    "precaucion": "Precaucion",
    "peligro": "Peligroso",
}

_ALERT_REPLACEMENTS: list[tuple[str, str]] = [
    (
        "Entropia muy alta: posible payload codificado o parametros ofuscados",
        "El enlace se ve muy raro o enredado; puede estar ocultando algo.",
    ),
    (
        "Entropia elevada: URL inusualmente compleja",
        "El enlace es mas largo o confuso de lo normal.",
    ),
    (
        "La URL contiene '@' (posible tecnica de ofuscacion)",
        "El enlace usa un truco con '@' para confundirte.",
    ),
    (
        "Demasiados subdominios (posible phishing)",
        "Tiene demasiadas partes en la direccion; suele usarse en estafas.",
    ),
    (
        "No se detectaron indicadores de riesgo significativos",
        "No encontramos senales claras de peligro.",
    ),
    ("Fuzzy match:", "Nombre parecido a una marca conocida:"),
]


def nivel_riesgo_label(nivel: str) -> str:
    return NIVEL_LABELS.get(nivel, nivel.replace("_", " ").capitalize())


def humanize_alert(text: str) -> str:
    if not text:
        return text
    out = text.strip()
    for old, new in _ALERT_REPLACEMENTS:
        if old in out:
            out = out.replace(old, new)
    out = out.replace("typosquatting", "imitacion de nombre")
    out = out.replace("Typosquatting", "Imitacion de nombre")
    return out.strip()


def humanize_resumen(lines: list[str] | None) -> list[str]:
    if not lines:
        return ["No encontramos problemas evidentes."]
    return [humanize_alert(line) for line in lines if line]


def humanize_detalle(detalle: dict | None) -> dict | None:
    if not detalle:
        return detalle
    out = dict(detalle)
    if "resumen" in out:
        out["resumen"] = humanize_resumen(out.get("resumen"))
    modulos = out.get("modulos")
    if isinstance(modulos, dict):
        new_mod = {}
        for key, mod in modulos.items():
            if not isinstance(mod, dict):
                new_mod[key] = mod
                continue
            m = dict(mod)
            if m.get("alerts"):
                m["alerts"] = humanize_resumen(m["alerts"])
            new_mod[key] = m
        out["modulos"] = new_mod
    return out
