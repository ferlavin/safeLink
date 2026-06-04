import json
import socket
import ssl
from datetime import datetime, timedelta, timezone
from pathlib import Path

import dns.resolver
import httpx
import whois

from services.typosquatting import extract_domain
from services.url_analyzer import score_to_level


def _load_asn_expected() -> dict:
    path = Path(__file__).resolve().parent.parent / "data" / "asn_esperados.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _resolve_a(domain: str) -> list[str]:
    try:
        answers = dns.resolver.resolve(domain, "A")
        return [str(r) for r in answers]
    except Exception:
        try:
            return list({item[4][0] for item in socket.getaddrinfo(domain, 443)})
        except Exception:
            return []


def _asn_lookup(ip: str) -> dict:
    try:
        with httpx.Client(timeout=6.0) as client:
            r = client.get(
                f"http://ip-api.com/json/{ip}",
                params={"fields": "status,as,org,isp,hosting,query"},
            )
            data = r.json()
            if data.get("status") == "success":
                return {
                    "ip": ip,
                    "asn": data.get("as"),
                    "org": data.get("org"),
                    "isp": data.get("isp"),
                    "hosting": data.get("hosting"),
                }
    except Exception:
        pass
    return {"ip": ip, "asn": None, "org": None, "isp": None, "hosting": None}


def _ssl_info(domain: str) -> dict:
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=8) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
        not_before = cert.get("notBefore")
        not_after = cert.get("notAfter")
        issuer = dict(x[0] for x in cert.get("issuer", []))
        return {
            "issuer": issuer.get("organizationName", "Desconocido"),
            "valido_desde": not_before,
            "valido_hasta": not_after,
        }
    except Exception:
        return {"issuer": None, "valido_desde": None, "valido_hasta": None}


def _check_blacklists(domain: str) -> dict:
    """Consulta URLhaus (abuso.ch) por apariciones del host."""
    try:
        with httpx.Client(timeout=8.0) as client:
            r = client.get(
                f"https://urlhaus-api.abuse.ch/v1/host/{domain}/",
                headers={"Accept": "application/json"},
            )
            if r.status_code == 200:
                data = r.json()
                if data.get("query_status") == "ok":
                    return {
                        "en_lista": True,
                        "fuente": "URLhaus",
                        "urls_maliciosas": len(data.get("urls", [])),
                        "alerta": f"Dominio reportado en URLhaus ({len(data.get('urls', []))} URLs)",
                    }
            return {
                "en_lista": False,
                "fuente": "URLhaus",
                "alerta": "Sin apariciones en URLhaus",
            }
    except Exception:
        return {
            "en_lista": False,
            "fuente": "URLhaus",
            "alerta": "No se pudo consultar listas negras en este momento",
        }


def _whois_timeline(domain: str) -> tuple[list[dict], dict]:
    meta = {}
    events = []
    try:
        w = whois.whois(domain)
        created = w.creation_date
        updated = w.updated_date
        expires = w.expiration_date
        if isinstance(created, list):
            created = created[0]
        if isinstance(updated, list):
            updated = updated[0]
        if isinstance(expires, list):
            expires = expires[0]
        meta["registrado"] = created
        if created:
            c = created.replace(tzinfo=timezone.utc) if created.tzinfo is None else created
            age_days = (datetime.now(timezone.utc) - c).days
            meta["edad_dias"] = age_days
            events.append(
                {
                    "fecha": created.isoformat() if hasattr(created, "isoformat") else str(created),
                    "evento": "Registro del dominio (WHOIS)",
                    "tipo": "registro",
                }
            )
            if age_days < 30:
                events.append(
                    {
                        "fecha": datetime.now(timezone.utc).isoformat(),
                        "evento": f"Dominio muy reciente ({age_days} dias) — riesgo de suplantacion",
                        "tipo": "alerta",
                    }
                )
        if updated:
            events.append(
                {
                    "fecha": updated.isoformat() if hasattr(updated, "isoformat") else str(updated),
                    "evento": "Cambio en registro WHOIS",
                    "tipo": "whois",
                }
            )
        if expires:
            events.append(
                {
                    "fecha": expires.isoformat() if hasattr(expires, "isoformat") else str(expires),
                    "evento": "Vencimiento del dominio",
                    "tipo": "whois",
                }
            )
    except Exception:
        events.append(
            {
                "fecha": datetime.now(timezone.utc).isoformat(),
                "evento": "WHOIS no disponible",
                "tipo": "info",
            }
        )
    return events, meta


def _dns_consistency(domain: str, ips: list[str]) -> dict:
    expected_map = _load_asn_expected()
    base = domain.split(".")[0].replace("-", "")
    expected = None
    for key, val in expected_map.items():
        if key in base or key in domain:
            expected = val
            break

    ip_details = [_asn_lookup(ip) for ip in ips[:3]]
    alerts = []
    score = 0
    suplantacion = False

    if not ips:
        alerts.append("No se pudo resolver el dominio en DNS")
        score = 40
    elif expected:
        for detail in ip_details:
            asn = detail.get("asn") or ""
            org = (detail.get("org") or "").lower()
            if expected.get("asn") and expected["asn"] not in asn:
                suplantacion = True
                score = max(score, 55)
                alerts.append(
                    f"ASN inesperado para marca conocida: {asn} ({detail.get('org')}) — se esperaba {expected['asn']}"
                )
            if detail.get("hosting") and expected.get("asn"):
                score = max(score, 45)
                alerts.append(
                    f"IP {detail['ip']} en hosting/VPS ({detail.get('isp')}) — posible suplantacion de infraestructura legitima"
                )
            elif expected.get("org"):
                if not any(o.lower() in org for o in expected["org"]):
                    score = max(score, 35)
                    alerts.append(
                        f"Organizacion de red '{detail.get('org')}' no coincide con proveedor esperado"
                    )
        if not suplantacion and not alerts:
            alerts.append(
                f"Resolucion coherente con infraestructura esperada ({expected.get('asn') or 'marca conocida'})"
            )
    else:
        for detail in ip_details:
            alerts.append(
                f"IP {detail['ip']} — ASN {detail.get('asn') or 'N/A'} — {detail.get('org') or 'desconocido'}"
            )

    return {
        "score": min(score, 70),
        "alerts": alerts,
        "ips": ips,
        "ip_detalle": ip_details,
        "asn_esperado": expected,
        "suplantacion_detectada": suplantacion,
    }


def analyze_dns_osint(url: str) -> dict:
    domain = extract_domain(url)
    if not domain:
        raise ValueError("Dominio invalido")

    ips = _resolve_a(domain)
    ssl_data = _ssl_info(domain)
    consistency = _dns_consistency(domain, ips)
    timeline, whois_meta = _whois_timeline(domain)
    blacklist = _check_blacklists(domain)

    if ssl_data.get("valido_desde"):
        timeline.append(
            {
                "fecha": ssl_data["valido_desde"],
                "evento": f"Primer certificado SSL visible ({ssl_data.get('issuer')})",
                "tipo": "ssl",
            }
        )
    if ssl_data.get("valido_hasta"):
        timeline.append(
            {
                "fecha": ssl_data["valido_hasta"],
                "evento": f"Vencimiento certificado SSL",
                "tipo": "ssl",
            }
        )

    timeline.append(
        {
            "fecha": datetime.now(timezone.utc).isoformat(),
            "evento": blacklist["alerta"],
            "tipo": "blacklist",
        }
    )

    for ip in ips[:1]:
        timeline.append(
            {
                "fecha": datetime.now(timezone.utc).isoformat(),
                "evento": f"Resolucion actual → {ip}",
                "tipo": "dns",
            }
        )

    score = min(100, consistency["score"])
    if blacklist.get("en_lista"):
        score = max(score, 80)
    if whois_meta.get("edad_dias", 999) < 30:
        score = max(score, 50)
    if not ips:
        score = max(score, 40)

    nivel = score_to_level(score)
    resumen = consistency["alerts"] + [blacklist["alerta"]]
    if whois_meta.get("edad_dias", 999) < 30:
        resumen.append("Dominio registrado hace menos de 30 dias")

    detalle = {
        "tipo": "dns_osint",
        "dominio": domain,
        "ficha_dominio": {
            "whois": whois_meta,
            "ssl": ssl_data,
            "blacklist": blacklist,
        },
        "consistencia_dns": consistency,
        "timeline": sorted(timeline, key=lambda x: x.get("fecha") or ""),
        "resumen": resumen,
    }
    return {
        "url": f"dns://{domain}",
        "puntuacion_riesgo": score,
        "nivel_riesgo": nivel,
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
