import json
from concurrent.futures import ThreadPoolExecutor

from services.safe_browsing import check_safe_browsing
from services.typosquatting import analyze_typosquatting, extract_domain, is_official_domain
from services.url_entropy import analyze_url_entropy
from services.url_heuristics import analyze_url_heuristics

RISK_LEVELS = [
    (76, "critico"),
    (51, "alto"),
    (26, "medio"),
    (0, "bajo"),
]

LEVEL_ORDER = ("bajo", "medio", "alto", "critico")
LEVEL_SCORE = {"bajo": 12, "medio": 38, "alto": 68, "critico": 90}
SLOW_TIMEOUT_S = 4.0


def score_to_level(score: int) -> str:
    for threshold, level in RISK_LEVELS:
        if score >= threshold:
            return level
    return "bajo"


def _rank(level: str) -> int:
    try:
        return LEVEL_ORDER.index(level)
    except ValueError:
        return 0


def _at_least(level: str, minimum: str) -> str:
    return LEVEL_ORDER[max(_rank(level), _rank(minimum))]


def _cap(level: str, maximum: str) -> str:
    return LEVEL_ORDER[min(_rank(level), _rank(maximum))]


def _bump(level: str) -> str:
    return LEVEL_ORDER[min(_rank(level) + 1, len(LEVEL_ORDER) - 1)]


def _fuente_estado(ok: bool, motivo: str = "") -> str:
    if ok:
        return "ok"
    return motivo or "omitido"


def _headers_signals(headers: dict) -> dict:
    if not headers:
        return {"tiene_senal": False, "alertas": []}
    lower = {str(k).lower(): v for k, v in headers.items()}
    missing = []
    if "strict-transport-security" not in lower:
        missing.append("HSTS")
    if "content-security-policy" not in lower:
        missing.append("CSP")
    alertas = [f"Falta cabecera de seguridad: {name}" for name in missing]
    return {"tiene_senal": bool(missing), "alertas": alertas, "faltan": missing}


def _nlp_signals(url: str) -> dict:
    from services.nlp_url_classifier import classify_url_nlp

    result = classify_url_nlp(url)
    detalle = result.get("detalle") or {}
    score = int(result.get("puntuacion_riesgo") or 0)
    return {
        "score": score,
        "sospechoso": score >= 20,
        "alertas": list(detalle.get("resumen") or []),
        "categoria": detalle.get("categoria"),
        "modelo": "patrones de lenguaje en la URL",
        "terminos": detalle.get("terminos_phishing") or [],
    }


def _analyze_instant(url: str) -> dict:
    domain = extract_domain(url)
    official = is_official_domain(domain)
    entropy = analyze_url_entropy(url)
    typos = analyze_typosquatting(url)
    heuristics = analyze_url_heuristics(url, official=official)
    nlp = _nlp_signals(url)
    oauth = None
    try:
        from services.oauth_phishing import inspect_oauth_url

        oauth = inspect_oauth_url(url)
    except Exception:
        oauth = {"tiene_senal": False, "alertas": [], "motivo": "error"}
    return {
        "domain": domain,
        "official": official,
        "entropy": entropy,
        "typos": typos,
        "heuristics": heuristics,
        "nlp": nlp,
        "oauth": oauth,
    }


def _decide_level(
    *,
    official: bool,
    strong_typo: bool,
    typo_aggravated: bool,
    sb_listed: bool,
    sb_severe: bool,
    new_domain: bool,
    phishing_heur: bool,
    entropy_hit: bool,
    tld_only: bool,
    nlp_hit: bool,
    web3_drain: bool,
    policy_hit: bool,
    phishing_anchor: bool,
) -> str:
    if official and not sb_listed:
        return "bajo"

    level = "bajo"
    if strong_typo:
        level = "critico" if typo_aggravated else "alto"
    if sb_listed:
        level = _at_least(level, "critico" if sb_severe else "alto")
    if web3_drain:
        level = _at_least(level, "alto")
    if new_domain and (strong_typo or phishing_heur):
        level = _bump(level)

    strong = strong_typo or sb_listed or web3_drain
    if not strong:
        weak = "bajo"
        if entropy_hit or tld_only or nlp_hit or phishing_heur:
            weak = "medio"
        if policy_hit and phishing_anchor:
            weak = _at_least(weak, "medio")
        elif policy_hit and not phishing_anchor:
            # Headers/OAuth/forms solos nunca pintan peligro.
            weak = _cap(_at_least(weak, "bajo"), "medio")
            if not (entropy_hit or tld_only or nlp_hit or phishing_heur):
                weak = "bajo"
        level = _at_least(level, weak)
        level = _cap(level, "medio")
    elif policy_hit and phishing_anchor and _rank(level) < _rank("medio"):
        level = "medio"

    if entropy_hit and not (strong_typo or sb_listed or web3_drain or phishing_heur or nlp_hit or tld_only):
        level = _cap(_at_least(level, "medio"), "medio")
    if tld_only and not (strong_typo or sb_listed or web3_drain or phishing_heur):
        level = _cap(_at_least(level, "medio"), "medio")

    return level


def _build_resumen(
    level: str,
    official: bool,
    alerts: list[str],
    strong_typo: bool,
    sb_listed: bool,
) -> list[str]:
    if official and not sb_listed:
        return [
            "Es el sitio oficial de la marca; el login u otras paginas internas no lo hacen peligroso.",
            *alerts[:4],
        ]
    if not alerts:
        if level == "bajo":
            return ["No encontramos senales claras de peligro."]
        return ["Hay senales de precaucion; revisa el detalle antes de ingresar datos."]
    if strong_typo:
        return [
            "El nombre del sitio imita una marca conocida y no es el dominio oficial.",
            *alerts[:6],
        ]
    if sb_listed:
        return ["Google Safe Browsing lo marca como peligroso.", *alerts[:6]]
    return alerts[:8]


def analyze_url(url: str, *, slow_signals: bool = True) -> dict:
    url = url.strip()
    instant = _analyze_instant(url)
    domain = instant["domain"]
    official = instant["official"]
    entropy = instant["entropy"]
    typos = instant["typos"]
    heuristics = instant["heuristics"]
    nlp = instant["nlp"]
    oauth = instant["oauth"] or {"tiene_senal": False, "alertas": []}

    strong_typo = bool(typos.get("fuerte"))
    phishing_heur = bool(
        heuristics.get("at_trick")
        or heuristics.get("ip_host")
        or heuristics.get("login_path")
    )
    typo_aggravated = strong_typo and (
        heuristics.get("login_path")
        or heuristics.get("at_trick")
        or heuristics.get("ip_host")
        or heuristics.get("shady_tld")
    )
    tld_only = bool(heuristics.get("shady_tld")) and not strong_typo and not phishing_heur
    entropy_hit = int(entropy.get("score") or 0) > 0
    nlp_hit = bool(nlp.get("sospechoso")) and not official

    provisional = _decide_level(
        official=official,
        strong_typo=strong_typo,
        typo_aggravated=typo_aggravated,
        sb_listed=False,
        sb_severe=False,
        new_domain=False,
        phishing_heur=phishing_heur,
        entropy_hit=entropy_hit,
        tld_only=tld_only,
        nlp_hit=nlp_hit,
        web3_drain=False,
        policy_hit=bool(oauth.get("tiene_senal")),
        phishing_anchor=strong_typo
        or heuristics.get("at_trick")
        or heuristics.get("ip_host"),
    )
    ambiguous = (not official) and _rank(provisional) <= _rank("medio")

    fuentes = {
        "heuristicas": "ok",
        "typosquatting": "ok",
        "entropia": "ok",
        "nlp": "lexico",
        "oauth": "url",
        "safe_browsing": "omitido",
        "dns_whois": "omitido",
        "html": "omitido",
        "web3": "omitido",
        "headers": "omitido",
        "formularios": "omitido",
    }

    safe_browsing = {
        "disponible": False,
        "en_lista": False,
        "amenazas": [],
        "score": 0,
        "alertas": [],
        "motivo": "omitido",
    }
    age_info = {"disponible": False, "edad_dias": None, "motivo": "omitido"}
    page = {
        "ok": False,
        "motivo": "omitido",
        "final_url": url,
        "html": "",
        "headers": {},
        "hops": [],
    }

    jobs = {}
    with ThreadPoolExecutor(max_workers=3) as pool:
        jobs["sb"] = pool.submit(check_safe_browsing, url)
        if slow_signals and ambiguous:
            from services.http_fetch import fetch_page_safe, url_fetch_allowed

            allowed, block_reason = url_fetch_allowed(
                url if "://" in url else f"https://{url}"
            )
            if not allowed:
                fuentes["html"] = block_reason
                fuentes["dns_whois"] = "omitido"
            else:
                from services.dns_osint import lookup_domain_age_days

                jobs["age"] = pool.submit(
                    lookup_domain_age_days, domain or "", SLOW_TIMEOUT_S
                )
                jobs["html"] = pool.submit(
                    fetch_page_safe, url, timeout=SLOW_TIMEOUT_S, want_html=True
                )

    try:
        safe_browsing = jobs["sb"].result()
        if safe_browsing.get("disponible"):
            fuentes["safe_browsing"] = "ok"
        else:
            fuentes["safe_browsing"] = safe_browsing.get("motivo") or "sin_clave"
    except Exception:
        fuentes["safe_browsing"] = "error"

    if "age" in jobs:
        try:
            age_info = jobs["age"].result()
            fuentes["dns_whois"] = _fuente_estado(
                bool(age_info.get("disponible")), age_info.get("motivo") or ""
            )
        except Exception:
            fuentes["dns_whois"] = "error"
            age_info = {"disponible": False, "edad_dias": None, "motivo": "error"}

    web3 = {"drain": False, "mild": False, "alertas": [], "patrones": []}
    headers_sig = {"tiene_senal": False, "alertas": []}
    forms_sig = {"tiene_senal": False, "alertas": []}
    verdict_url = url

    if "html" in jobs:
        try:
            page = jobs["html"].result()
            if page.get("ok"):
                fuentes["html"] = "ok"
            else:
                fuentes["html"] = page.get("motivo") or "error"
        except Exception:
            fuentes["html"] = "error"
            page = {"ok": False, "motivo": "error", "final_url": url, "html": "", "headers": {}, "hops": []}

        if page.get("ok"):
            final_url = page.get("final_url") or url
            hops = page.get("hops") or []
            if final_url and extract_domain(final_url) != domain:
                dest_typos = analyze_typosquatting(final_url)
                dest_official = is_official_domain(extract_domain(final_url))
                if dest_typos.get("fuerte") and not strong_typo and not dest_official:
                    verdict_url = final_url
                    instant_dest = _analyze_instant(final_url)
                    domain = instant_dest["domain"]
                    official = instant_dest["official"]
                    entropy = instant_dest["entropy"]
                    typos = instant_dest["typos"]
                    heuristics = instant_dest["heuristics"]
                    nlp = instant_dest["nlp"]
                    oauth = instant_dest["oauth"] or oauth
                    strong_typo = bool(typos.get("fuerte"))
                    phishing_heur = bool(
                        heuristics.get("at_trick")
                        or heuristics.get("ip_host")
                        or heuristics.get("login_path")
                    )
                    typo_aggravated = strong_typo and (
                        heuristics.get("login_path")
                        or heuristics.get("at_trick")
                        or heuristics.get("ip_host")
                        or heuristics.get("shady_tld")
                    )
                    tld_only = bool(heuristics.get("shady_tld")) and not strong_typo and not phishing_heur
                    entropy_hit = int(entropy.get("score") or 0) > 0
                    nlp_hit = bool(nlp.get("sospechoso")) and not official
                elif hops and extract_domain(final_url) != extract_domain(url):
                    verdict_url = url

            from services.web3_drainer import scan_web3_html

            web3 = scan_web3_html(page.get("html") or "")
            fuentes["web3"] = "ok"
            headers_sig = _headers_signals(page.get("headers") or {})
            fuentes["headers"] = "ok"
            html = page.get("html") or ""
            if html:
                try:
                    from services.double_submit_form import _parse_forms

                    forms = _parse_forms(html, page.get("final_url") or url)
                    cred = [f for f in forms if f.get("has_password") or f.get("has_email")]
                    external = [f for f in cred if not f.get("same_domain")]
                    if external:
                        forms_sig = {
                            "tiene_senal": True,
                            "alertas": [
                                "Un formulario envia datos a otro dominio."
                            ],
                        }
                    fuentes["formularios"] = "ok"
                except Exception:
                    fuentes["formularios"] = "error"
            else:
                fuentes["formularios"] = "omitido"

    sb_listed = bool(safe_browsing.get("en_lista"))
    threats = set(safe_browsing.get("amenazas") or [])
    sb_severe = bool(threats & {"MALWARE", "SOCIAL_ENGINEERING"})
    age_days = age_info.get("edad_dias")
    new_domain = isinstance(age_days, int) and age_days < 30
    web3_drain = bool(web3.get("drain")) and not official and (
        strong_typo
        or heuristics.get("shady_tld")
        or heuristics.get("at_trick")
        or heuristics.get("ip_host")
    )
    policy_hit = bool(
        headers_sig.get("tiene_senal")
        or oauth.get("tiene_senal")
        or forms_sig.get("tiene_senal")
    )
    phishing_anchor = bool(
        strong_typo
        or heuristics.get("at_trick")
        or heuristics.get("ip_host")
        or sb_listed
    )

    level = _decide_level(
        official=official,
        strong_typo=strong_typo,
        typo_aggravated=typo_aggravated,
        sb_listed=sb_listed,
        sb_severe=sb_severe,
        new_domain=new_domain,
        phishing_heur=phishing_heur,
        entropy_hit=entropy_hit,
        tld_only=tld_only,
        nlp_hit=nlp_hit,
        web3_drain=web3_drain,
        policy_hit=policy_hit,
        phishing_anchor=phishing_anchor,
    )

    score = LEVEL_SCORE.get(level, 12)
    if sb_listed:
        score = max(score, 85)
    score = min(100, score)

    all_alerts = (
        list(safe_browsing.get("alertas") or [])
        + list(entropy.get("alerts") or [])
        + list(typos.get("alerts") or [])
        + list(heuristics.get("alerts") or [])
    )
    if new_domain and (strong_typo or phishing_heur):
        all_alerts.insert(
            0,
            f"El dominio es muy nuevo ({age_days} dias) y hay senales de phishing.",
        )
    if web3_drain:
        all_alerts.extend(web3.get("alertas") or [])
    elif web3.get("mild"):
        all_alerts.append(
            "La pagina pide conectar una billetera; eso solo no la hace peligrosa."
        )
    if nlp_hit:
        all_alerts.extend((nlp.get("alertas") or [])[:2])
    if policy_hit and phishing_anchor:
        all_alerts.extend((oauth.get("alertas") or [])[:2])
        all_alerts.extend((headers_sig.get("alertas") or [])[:2])
        all_alerts.extend((forms_sig.get("alertas") or [])[:2])

    resumen = _build_resumen(level, official, all_alerts, strong_typo, sb_listed)

    explanation = {
        "safe_browsing": {
            k: v
            for k, v in safe_browsing.items()
            if k != "error"
        },
        "fuentes": fuentes,
        "fuentes_faltantes": [
            k
            for k, v in fuentes.items()
            if v not in ("ok", "lexico", "url")
        ],
        "dominio_oficial": official,
        "url_veredicto": verdict_url,
        "redirect": {
            "hops": page.get("hops") or [],
            "final": page.get("final_url"),
            "usado_destino": verdict_url != url,
        },
        "modulos": {
            "entropia": {
                "entropy": entropy.get("entropy"),
                "score": entropy.get("score"),
                "alerts": entropy.get("alerts") or [],
            },
            "typosquatting": {
                "domain": typos.get("domain"),
                "score": typos.get("score"),
                "fuerte": strong_typo,
                "matches": typos.get("matches") or [],
                "alerts": typos.get("alerts") or [],
            },
            "heuristicas": {
                "score": heuristics.get("score"),
                "alerts": heuristics.get("alerts") or [],
                "ip_host": heuristics.get("ip_host"),
                "at_trick": heuristics.get("at_trick"),
                "shady_tld": heuristics.get("shady_tld"),
                "login_path": heuristics.get("login_path"),
            },
            "nlp": {
                "modelo": nlp.get("modelo"),
                "sospechoso": nlp_hit,
                "categoria": nlp.get("categoria"),
                "alerts": (nlp.get("alertas") or [])[:4] if nlp_hit else [],
            },
            "dns_whois": {
                "edad_dias": age_days,
                "disponible": age_info.get("disponible"),
                "motivo": age_info.get("motivo"),
                "alerts": (
                    [f"Dominio registrado hace {age_days} dias."]
                    if new_domain
                    else []
                ),
            },
            "web3": {
                "drenaje": web3_drain,
                "connect_wallet": bool(web3.get("connect_wallet") or web3.get("mild")),
                "alerts": web3.get("alertas") or [],
            },
            "oauth": {
                "alerts": oauth.get("alertas") or [],
                "tiene_senal": bool(oauth.get("tiene_senal")),
            },
            "headers": {
                "alerts": headers_sig.get("alertas") or [],
                "tiene_senal": bool(headers_sig.get("tiene_senal")),
            },
            "formularios": {
                "alerts": forms_sig.get("alertas") or [],
                "tiene_senal": bool(forms_sig.get("tiene_senal")),
            },
        },
        "resumen": resumen,
    }

    return {
        "url": url,
        "puntuacion_riesgo": score,
        "nivel_riesgo": level,
        "explicacion": json.dumps(explanation, ensure_ascii=False),
        "detalle": explanation,
    }
