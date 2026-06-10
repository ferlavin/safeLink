import json
import re
from urllib.parse import parse_qs, urlparse

from services.http_fetch import fetch_html, normalize_url
from services.url_analyzer import score_to_level

OAUTH_PROVIDERS = {
    "accounts.google.com": "Google",
    "login.microsoftonline.com": "Microsoft",
    "www.facebook.com": "Facebook",
    "appleid.apple.com": "Apple",
    "github.com": "GitHub",
}

OAUTH_PATH_PATTERNS = [
    r"/oauth2?/",
    r"/oauth/authorize",
    r"/signin/oauth",
    r"/openid-connect/",
    r"/authorize\?",
]

FAKE_PROVIDER_PATTERNS = [
    (r"google[-_.]?login|googIe|g00gle|accounts[-_]google", "Imitacion de login Google", 35),
    (r"microsoft[-_.]?login|microsft|microsooft", "Imitacion de login Microsoft", 35),
    (r"facebook[-_.]?login|faceb00k|fb[-_]login", "Imitacion de login Facebook", 35),
    (r"apple[-_.]?id|appIe[-_]id", "Imitacion de login Apple", 30),
]

SUSPICIOUS_REDIRECT_TLDS = {".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".click"}

# Scopes peligrosos: dan control total o acceso amplio que casi ninguna app
# legitima necesita para un simple "iniciar sesion".
DANGEROUS_SCOPES = [
    (r"mail\.google\.com|gmail\.modify|gmail\.send|mail\.read", "Acceso total a tu correo (leer/enviar/borrar)", 35),
    (r"drive($|[^.])|drive\.file|/auth/drive\b", "Acceso a todos tus archivos de Drive", 30),
    (r"contacts|/auth/contacts", "Acceso a tu lista de contactos", 18),
    (r"admin\.|/auth/admin|directory|cloud-platform", "Permisos de ADMINISTRADOR de la cuenta", 45),
    (r"full_access|read_write|offline_access", "Acceso completo / permanente (offline)", 25),
    (r"user\.read\.all|directory\.read\.all|mail\.readwrite", "Lectura masiva de datos del directorio/correo", 35),
    (r"files\.readwrite\.all|sites\.readwrite\.all", "Escritura en todos los archivos/sitios", 35),
    (r"publish_actions|manage_pages|pages_manage", "Publicar/administrar en tu nombre", 28),
    (r"delete|destroy", "Permiso para borrar datos", 22),
]

# Scopes esperables y de bajo riesgo en un login normal (OpenID Connect).
NORMAL_SCOPES = {"openid", "email", "profile", "name", "phone", "address", "basic"}


def _is_official_oauth_host(host: str, provider_hosts: set[str]) -> bool:
    host = host.lower().split(":")[0]
    return any(host == p or host.endswith("." + p) for p in provider_hosts)


def _split_scopes(raw_scope: str) -> list[str]:
    # Los scopes pueden venir separados por espacio, '+' o coma.
    parts = re.split(r"[\s,+]+", raw_scope.strip())
    return [p for p in parts if p]


def _analyze_scopes(scopes: list[str]) -> tuple[int, list[str], list[dict]]:
    score = 0
    alertas = []
    detectados = []
    joined = " ".join(scopes).lower()

    for pattern, msg, pts in DANGEROUS_SCOPES:
        if re.search(pattern, joined, re.I):
            score += pts
            alertas.append(f"Scope peligroso: {msg}")
            detectados.append({"scope": msg, "puntos": pts})

    no_normales = [
        s for s in scopes
        if s.lower() not in NORMAL_SCOPES
        and not s.lower().endswith(("openid", "email", "profile"))
    ]
    if len(no_normales) >= 4:
        score += 15
        alertas.append(
            f"Pide demasiados permisos para un login ({len(no_normales)} scopes no estandar)"
        )

    return score, alertas, detectados


async def analyze_oauth_phishing(url: str) -> dict:
    raw = normalize_url(url)
    parsed = urlparse(raw)
    host = parsed.netloc.lower()
    path_query = (parsed.path + "?" + parsed.query).lower()

    score = 0
    alertas = []
    indicadores = []

    is_oauth_flow = any(re.search(p, path_query) for p in OAUTH_PATH_PATTERNS)
    params = parse_qs(parsed.query)

    scopes_solicitados: list[str] = []
    scopes_detectados: list[dict] = []
    if "scope" in params:
        scopes_solicitados = _split_scopes(params["scope"][0])
        s_score, s_alertas, s_det = _analyze_scopes(scopes_solicitados)
        score += s_score
        alertas.extend(s_alertas)
        scopes_detectados = s_det
        if s_det:
            indicadores.append(
                {"tipo": "scopes_excesivos", "detalle": [d["scope"] for d in s_det]}
            )

    if is_oauth_flow or "redirect_uri" in params or "client_id" in params:
        indicadores.append({"tipo": "flujo_oauth", "detalle": "Parametros OAuth en la URL"})
        if "redirect_uri" in params:
            redirect = params["redirect_uri"][0]
            red_parsed = urlparse(redirect)
            red_host = red_parsed.netloc.lower()
            if red_host and not _is_official_oauth_host(red_host, set(OAUTH_PROVIDERS)):
                if any(red_host.endswith(tld) for tld in SUSPICIOUS_REDIRECT_TLDS):
                    score += 40
                    alertas.append(
                        f"redirect_uri apunta a dominio sospechoso: {red_host}"
                    )
                else:
                    score += 25
                    alertas.append(
                        f"redirect_uri no coincide con dominio oficial: {red_host}"
                    )
                indicadores.append(
                    {"tipo": "redirect_sospechoso", "detalle": redirect[:200]}
                )

        if "client_id" in params and not _is_official_oauth_host(host, set(OAUTH_PROVIDERS)):
            score += 15
            alertas.append("client_id en URL de dominio no oficial")

        if "state" not in params and is_oauth_flow:
            score += 10
            alertas.append("Flujo OAuth sin parametro state (CSRF)")

    official = _is_official_oauth_host(host, set(OAUTH_PROVIDERS))
    if official:
        provider = next(
            (OAUTH_PROVIDERS[p] for p in OAUTH_PROVIDERS if host == p or host.endswith("." + p)),
            "Proveedor",
        )
        indicadores.append({"tipo": "host_oficial", "detalle": provider})

    for pattern, msg, pts in FAKE_PROVIDER_PATTERNS:
        full = host + path_query
        if re.search(pattern, full, re.I) and not official:
            score += pts
            alertas.append(msg)
            indicadores.append({"tipo": "fake_provider", "detalle": msg})

    html = ""
    headers = None
    try:
        _, html, headers = await fetch_html(raw)
        html_lower = html.lower()

        oauth_forms = len(
            re.findall(
                r'<form[^>]*action=["\'][^"\']*(oauth|authorize|login)[^"\']*["\']',
                html_lower,
            )
        )
        if oauth_forms and not official:
            score += 20
            alertas.append(f"Formulario OAuth/login en dominio no oficial ({oauth_forms})")
            indicadores.append({"tipo": "form_oauth", "detalle": str(oauth_forms)})

        if re.search(r"sign in with google|continuar con google|iniciar sesion con google", html_lower):
            if "accounts.google.com" not in host:
                score += 30
                alertas.append("Boton 'Iniciar con Google' en sitio que no es Google")
                indicadores.append({"tipo": "boton_google_falso", "detalle": host})

        hidden_redirects = re.findall(
            r'<input[^>]*type=["\']hidden["\'][^>]*name=["\']redirect[^"\']*["\']',
            html_lower,
        )
        if hidden_redirects:
            score += 15
            alertas.append("Campo oculto redirect en formulario de login")

        # Scopes embebidos en enlaces/botones de "login con Google/Microsoft"
        if not scopes_solicitados:
            for m in re.finditer(r"scope=([^&\"'\s>]+)", html, re.I):
                found = _split_scopes(m.group(1).replace("%20", " ").replace("+", " "))
                if found:
                    s_score, s_alertas, s_det = _analyze_scopes(found)
                    if s_det:
                        score += s_score
                        alertas.extend(s_alertas)
                        scopes_solicitados = found
                        scopes_detectados = s_det
                        indicadores.append(
                            {
                                "tipo": "scopes_en_html",
                                "detalle": [d["scope"] for d in s_det],
                            }
                        )
                        break
    except Exception as exc:
        alertas.append(f"No se pudo descargar la pagina: {exc}")

    score = min(100, score)
    if not alertas:
        if official:
            alertas = ["El host parece un proveedor OAuth oficial."]
        else:
            alertas = ["No se detectaron indicadores claros de OAuth phishing."]

    detalle = {
        "tipo": "oauth_phishing",
        "url": raw,
        "host": host,
        "es_proveedor_oficial": official,
        "flujo_oauth_detectado": is_oauth_flow,
        "parametros_oauth": list(params.keys()),
        "scopes_solicitados": scopes_solicitados,
        "scopes_peligrosos": scopes_detectados,
        "indicadores": indicadores,
        "resumen": alertas,
    }

    return {
        "url": raw,
        "puntuacion_riesgo": score,
        "nivel_riesgo": score_to_level(score),
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
