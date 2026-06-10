import json
import re
from urllib.parse import urljoin, urlparse

from services.http_fetch import fetch_html, normalize_url
from services.url_analyzer import score_to_level

FORM_RE = re.compile(r"<form\b([^>]*)>(.*?)</form>", re.I | re.S)
ACTION_RE = re.compile(r'action\s*=\s*["\']([^"\']*)["\']', re.I)
METHOD_RE = re.compile(r'method\s*=\s*["\']([^"\']*)["\']', re.I)
INPUT_RE = re.compile(
    r'<input\b([^>]*?(?:type\s*=\s*["\'](?:password|email|text|hidden)["\'])[^>]*)>',
    re.I,
)
NAME_RE = re.compile(r'name\s*=\s*["\']([^"\']*)["\']', re.I)
TYPE_RE = re.compile(r'type\s*=\s*["\']([^"\']*)["\']', re.I)
ONSUBMIT_RE = re.compile(r'onsubmit\s*=\s*["\']([^"\']*)["\']', re.I)
FETCH_POST_RE = re.compile(
    r"fetch\s*\(\s*['\"]([^'\"]+)['\"][^)]*method\s*:\s*['\"]POST",
    re.I,
)

URL_IN_CALL_RE = re.compile(r"['\"](https?://[^'\"]+)['\"]", re.I)

# Canales encubiertos por los que un form puede mandar una "copia oculta"
# de los datos a un segundo destino, ademas del envio visible.
COVERT_CHANNELS = [
    ("sendBeacon", re.compile(r"navigator\.sendBeacon\s*\(\s*['\"]?([^'\")]+)", re.I), 30),
    ("Image().src", re.compile(r"new\s+Image\s*\(\s*\)\s*\.\s*src\s*=\s*['\"]([^'\"]+)", re.I), 25),
    ("XMLHttpRequest", re.compile(r"\.open\s*\(\s*['\"]POST['\"]\s*,\s*['\"]([^'\"]+)", re.I), 28),
    ("fetch", FETCH_POST_RE, 30),
]

HIDDEN_FORM_RE = re.compile(
    r"<form\b[^>]*(?:style\s*=\s*[\"'][^\"']*display\s*:\s*none|hidden\b|"
    r"style\s*=\s*[\"'][^\"']*(?:visibility\s*:\s*hidden|opacity\s*:\s*0))",
    re.I,
)
SUBMIT_LISTENER_RE = re.compile(
    r"addEventListener\s*\(\s*['\"]submit['\"]", re.I
)


def _extract_domain(url: str) -> str:
    return urlparse(url).netloc.lower()


def _resolve_action(base: str, action: str) -> str:
    if not action or action.startswith("#"):
        return base
    return urljoin(base, action)


def _parse_forms(html: str, page_url: str) -> list[dict]:
    page_domain = _extract_domain(page_url)
    forms = []

    for match in FORM_RE.finditer(html):
        attrs = match.group(1)
        body = match.group(2)
        action_m = ACTION_RE.search(attrs)
        method_m = METHOD_RE.search(attrs)
        action = _resolve_action(page_url, action_m.group(1) if action_m else page_url)
        method = (method_m.group(1) if method_m else "GET").upper()
        action_domain = _extract_domain(action)

        inputs = []
        for inp in INPUT_RE.finditer(body):
            tag = inp.group(1)
            name_m = NAME_RE.search(tag)
            type_m = TYPE_RE.search(tag)
            inputs.append(
                {
                    "name": name_m.group(1) if name_m else "",
                    "type": (type_m.group(1) if type_m else "text").lower(),
                }
            )

        onsubmit_m = ONSUBMIT_RE.search(attrs)
        is_hidden = bool(
            re.search(
                r"display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0|\bhidden\b",
                attrs,
                re.I,
            )
        )
        forms.append(
            {
                "action": action,
                "action_domain": action_domain,
                "method": method,
                "same_domain": action_domain == page_domain or not action_domain,
                "inputs": inputs,
                "has_password": any(i["type"] == "password" for i in inputs),
                "has_email": any(
                    i["type"] == "email" or "email" in i["name"].lower() for i in inputs
                ),
                "onsubmit": onsubmit_m.group(1) if onsubmit_m else None,
                "hidden": is_hidden,
            }
        )

    return forms


async def analyze_double_submit(url: str) -> dict:
    raw = normalize_url(url)
    page_domain = _extract_domain(raw)

    try:
        final_url, html, _ = await fetch_html(raw)
    except Exception as exc:
        raise ValueError(f"No se pudo acceder a la pagina: {exc}") from exc

    forms = _parse_forms(html, final_url)
    score = 0
    alertas = []
    hallazgos = []

    credential_forms = [f for f in forms if f["has_password"] or f["has_email"]]

    external_actions = [f for f in credential_forms if not f["same_domain"]]
    if external_actions:
        score += 35
        for f in external_actions:
            msg = f"Formulario envia credenciales a otro dominio: {f['action_domain']}"
            alertas.append(msg)
            hallazgos.append({"tipo": "action_externa", "detalle": f["action"]})

    if len(credential_forms) >= 2:
        domains = {f["action_domain"] or page_domain for f in credential_forms}
        if len(domains) >= 2:
            score += 40
            alertas.append(
                f"Doble envio: {len(credential_forms)} formularios de credenciales "
                f"a dominios distintos ({', '.join(domains)})"
            )
            hallazgos.append(
                {
                    "tipo": "doble_formulario",
                    "detalle": f"{len(credential_forms)} forms, dominios: {list(domains)}",
                }
            )

    hidden_exfil = []
    for form in credential_forms:
        hidden_names = [i["name"] for i in form["inputs"] if i["type"] == "hidden"]
        if len(hidden_names) >= 4:
            score += 12
            hidden_exfil.append(form["action"])
    if hidden_exfil:
        alertas.append(
            "Formularios con muchos campos ocultos (posible exfiltracion paralela)"
        )
        hallazgos.append({"tipo": "campos_ocultos", "detalle": hidden_exfil[:3]})

    for form in forms:
        if form["onsubmit"] and ("fetch(" in form["onsubmit"] or "XMLHttpRequest" in form["onsubmit"]):
            score += 25
            alertas.append("onsubmit envia datos por JavaScript ademas del action del form")
            hallazgos.append({"tipo": "onsubmit_js", "detalle": form["onsubmit"][:150]})

    # Canales encubiertos: una "copia oculta" enviada a un segundo destino.
    canales_encubiertos = []
    for nombre, regex, pts in COVERT_CHANNELS:
        for m in regex.finditer(html):
            destino = m.group(1)
            # fetch puede capturar rutas relativas; resolvemos contra la pagina
            destino_abs = destino if destino.startswith("http") else urljoin(final_url, destino)
            destino_domain = _extract_domain(destino_abs)
            if destino_domain and destino_domain != page_domain:
                canales_encubiertos.append(
                    {"canal": nombre, "destino": destino_abs[:120], "dominio": destino_domain}
                )

    if canales_encubiertos and credential_forms:
        score += 35
        primero = canales_encubiertos[0]
        alertas.append(
            f"Copia oculta de datos: {primero['canal']} envia a otro dominio "
            f"({primero['dominio']}) en paralelo al formulario visible."
        )
        hallazgos.append({"tipo": "canal_encubierto", "detalle": canales_encubiertos[:5]})

    # Formulario oculto (display:none) que duplica un formulario visible.
    hidden_cred_forms = [f for f in credential_forms if f["hidden"]]
    visible_cred_forms = [f for f in credential_forms if not f["hidden"]]
    if hidden_cred_forms and visible_cred_forms:
        score += 40
        destinos = {f["action_domain"] or page_domain for f in hidden_cred_forms}
        alertas.append(
            "Formulario OCULTO de credenciales junto a uno visible "
            f"(el oculto envia a: {', '.join(destinos)})."
        )
        hallazgos.append(
            {
                "tipo": "form_oculto",
                "detalle": [f["action"] for f in hidden_cred_forms[:3]],
            }
        )

    # Listener JS de 'submit' que puede disparar un segundo envio.
    if SUBMIT_LISTENER_RE.search(html) and credential_forms:
        extra_urls = [
            u for u in URL_IN_CALL_RE.findall(html)
            if _extract_domain(u) and _extract_domain(u) != page_domain
        ]
        if extra_urls:
            score += 18
            alertas.append(
                "Listener de 'submit' con envio a dominio externo (posible duplicado)."
            )
            hallazgos.append({"tipo": "submit_listener", "detalle": extra_urls[:5]})

    js_posts = FETCH_POST_RE.findall(html)
    external_js_posts = [
        u for u in js_posts
        if u.startswith("http") and _extract_domain(u) != page_domain
    ]
    if external_js_posts and credential_forms and not canales_encubiertos:
        score += 30
        alertas.append(
            f"POST adicional via fetch() a dominio externo: {external_js_posts[0][:80]}"
        )
        hallazgos.append({"tipo": "fetch_externo", "detalle": external_js_posts[:5]})

    duplicate_password_forms = [f for f in credential_forms if f["has_password"]]
    if len(duplicate_password_forms) >= 2:
        score += 20
        if not any("Doble envio" in a for a in alertas):
            alertas.append(
                "Multiples formularios con campo password en la misma pagina"
            )

    score = min(100, score)
    if not alertas:
        alertas = [
            f"No se detecto doble envio ({len(forms)} formulario(s) analizado(s))."
        ]

    detalle = {
        "tipo": "double_submit_form",
        "url": final_url,
        "dominio_pagina": page_domain,
        "formularios_total": len(forms),
        "formularios_credenciales": len(credential_forms),
        "formularios": [
            {
                "action": f["action"],
                "method": f["method"],
                "mismo_dominio": f["same_domain"],
                "campos": len(f["inputs"]),
                "tiene_password": f["has_password"],
                "oculto": f["hidden"],
            }
            for f in forms[:8]
        ],
        "hallazgos": hallazgos,
        "resumen": alertas,
    }

    return {
        "url": final_url,
        "puntuacion_riesgo": score,
        "nivel_riesgo": score_to_level(score),
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
