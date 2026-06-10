import json
import re
from functools import lru_cache
from pathlib import Path

from services.http_fetch import fetch_html, normalize_url
from services.url_analyzer import score_to_level

# Palabras que indican que el sitio se presenta como un servicio sensible
# (banco, billetera, login). Si "dice ser" esto y le faltan controles
# basicos como CSP/HSTS, el riesgo concreto es mucho mayor.
SENSITIVE_KEYWORDS = [
    "banco",
    "bank",
    "homebanking",
    "home banking",
    "billetera",
    "wallet",
    "tarjeta",
    "credito",
    "cbu",
    "cvu",
    "clave",
    "contrasena",
    "contraseña",
    "password",
    "iniciar sesion",
    "login",
    "ingresar",
    "cuenta",
    "transferencia",
    "saldo",
]

CRITICAL_HEADERS = {"content-security-policy", "strict-transport-security"}


@lru_cache(maxsize=1)
def _load_brands() -> list[str]:
    try:
        path = Path(__file__).resolve().parent.parent / "data" / "marcas_ar.json"
        return [b.lower() for b in json.loads(path.read_text(encoding="utf-8"))]
    except Exception:
        return []


def _detect_context(url: str, html: str) -> dict:
    text = (url + " " + html[:20000]).lower()
    keywords = [k for k in SENSITIVE_KEYWORDS if k in text]
    brands = [b for b in _load_brands() if b in text]
    # Es sensible si menciona claves/login/banca o nombra una marca conocida.
    es_sensible = bool(keywords) or bool(brands)
    return {
        "es_sensible": es_sensible,
        "palabras": keywords[:8],
        "marcas_mencionadas": brands[:8],
    }


def _hsts_ok(value: str) -> bool:
    if "max-age" not in value.lower():
        return False
    for part in value.split(";"):
        if "max-age" in part.lower():
            try:
                age = int(part.strip().split("=")[1].strip())
                return age >= 31536000
            except (ValueError, IndexError):
                return False
    return False


HEADER_CHECKS = [
    {
        "header": "strict-transport-security",
        "nombre": "HSTS (Strict-Transport-Security)",
        "peso": 18,
        "validar": lambda v: _hsts_ok(v),
        "ok": "Fuerza HTTPS por al menos 1 ano",
        "falta": "No fuerza conexiones HTTPS — vulnerable a downgrade",
        "debil": "HSTS presente pero max-age corto",
    },
    {
        "header": "content-security-policy",
        "nombre": "CSP (Content-Security-Policy)",
        "peso": 20,
        "validar": lambda v: len(v) > 10 and "default-src" in v.lower(),
        "ok": "Politica CSP definida",
        "falta": "Sin CSP — mayor riesgo de XSS e inyeccion",
        "debil": "CSP muy permisiva o incompleta",
    },
    {
        "header": "x-frame-options",
        "nombre": "X-Frame-Options",
        "peso": 12,
        "validar": lambda v: v.upper() in ("DENY", "SAMEORIGIN"),
        "ok": "Protege contra clickjacking",
        "falta": "Sin proteccion contra clickjacking",
        "debil": "Valor ALLOW-FROM obsoleto o poco seguro",
    },
    {
        "header": "x-content-type-options",
        "nombre": "X-Content-Type-Options",
        "peso": 10,
        "validar": lambda v: v.lower().strip() == "nosniff",
        "ok": "Evita MIME sniffing",
        "falta": "Sin nosniff — riesgo de MIME confusion",
        "debil": "Valor distinto de nosniff",
    },
    {
        "header": "referrer-policy",
        "nombre": "Referrer-Policy",
        "peso": 8,
        "validar": lambda v: v.lower() in (
            "no-referrer",
            "strict-origin-when-cross-origin",
            "same-origin",
            "strict-origin",
        ),
        "ok": "Controla filtracion de referrer",
        "falta": "Sin politica de referrer",
        "debil": "Politica de referrer permisiva",
    },
    {
        "header": "permissions-policy",
        "nombre": "Permissions-Policy",
        "peso": 8,
        "validar": lambda v: len(v) > 5,
        "ok": "Restringe APIs del navegador",
        "falta": "Sin Permissions-Policy",
        "debil": "Politica muy permisiva",
        "alternativa": "feature-policy",
    },
]


async def analyze_security_headers(url: str) -> dict:
    raw = normalize_url(url)
    final_url, html, headers = await fetch_html(raw)
    status = 200

    contexto = _detect_context(final_url, html)
    es_sensible = contexto["es_sensible"]

    headers_lower = {k.lower(): v for k, v in headers.items()}
    resultados = []
    score = 0
    alertas = []
    faltan_criticos = []

    for check in HEADER_CHECKS:
        key = check["header"]
        alt = check.get("alternativa")
        valor = headers_lower.get(key) or (headers_lower.get(alt) if alt else None)

        if valor is None:
            estado = "ausente"
            mensaje = check["falta"]
            # En un sitio que dice ser banco/login, faltar un header critico
            # pesa mucho mas: es una senal de alarma concreta.
            if es_sensible and key in CRITICAL_HEADERS:
                score += check["peso"] + 22
                faltan_criticos.append(check["nombre"])
            else:
                score += check["peso"]
        elif check["validar"](valor):
            estado = "ok"
            mensaje = check["ok"]
        else:
            score += check["peso"] // 2
            estado = "debil"
            mensaje = check["debil"]

        if estado != "ok":
            alertas.append(f"{check['nombre']}: {mensaje}")

        resultados.append(
            {
                "header": check["nombre"],
                "estado": estado,
                "valor": valor,
                "mensaje": mensaje,
            }
        )

    if es_sensible and faltan_criticos:
        contexto_label = (
            ", ".join(contexto["marcas_mencionadas"])
            or "manejo de credenciales/datos sensibles"
        )
        alertas.insert(
            0,
            f"ALARMA: el sitio aparenta ser un servicio sensible ({contexto_label}) "
            f"pero le faltan controles criticos: {', '.join(faltan_criticos)}.",
        )

    set_cookie = headers_lower.get("set-cookie", "")
    if set_cookie:
        cookie_flags = []
        if "secure" not in set_cookie.lower():
            score += 8
            cookie_flags.append("Cookie sin flag Secure")
        if "httponly" not in set_cookie.lower():
            score += 6
            cookie_flags.append("Cookie sin flag HttpOnly")
        if "samesite" not in set_cookie.lower():
            score += 5
            cookie_flags.append("Cookie sin SameSite")
        if cookie_flags:
            alertas.extend(cookie_flags)
            resultados.append(
                {
                    "header": "Set-Cookie",
                    "estado": "debil",
                    "valor": set_cookie[:120] + ("..." if len(set_cookie) > 120 else ""),
                    "mensaje": "; ".join(cookie_flags),
                }
            )

    score = min(100, score)
    ok_count = sum(1 for r in resultados if r["estado"] == "ok")
    grade = "A" if score <= 10 else "B" if score <= 25 else "C" if score <= 45 else "D" if score <= 65 else "F"

    if not alertas:
        alertas = [f"Headers de seguridad solidos ({ok_count} controles OK)."]

    detalle = {
        "tipo": "security_headers",
        "url": final_url,
        "http_status": status,
        "calificacion": grade,
        "headers_ok": ok_count,
        "headers_total": len(HEADER_CHECKS),
        "contexto_sensible": es_sensible,
        "contexto": contexto,
        "headers_criticos_faltantes": faltan_criticos,
        "headers_analizados": resultados,
        "resumen": alertas,
    }

    return {
        "url": final_url,
        "puntuacion_riesgo": score,
        "nivel_riesgo": score_to_level(score),
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
