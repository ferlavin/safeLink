from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.analysis import AnalisisUrl
from models.enlace import Enlace
from models.reporte import Reporte
from services.typosquatting import extract_domain

# Solo reportes de la comunidad o análisis claramente riesgosos.
# No usamos cualquier scan ni la IP de quien analizó.
HIGH_LEVELS = {"alto", "critico"}
_LEVEL_RANK = {"critico": 4, "alto": 3, "medio": 2, "bajo": 1, "seguro": 0}


def _domain_of(url: str | None) -> str | None:
    if not url:
        return None
    host = extract_domain(url)
    return host or None


def _iso(value) -> str | None:
    if not value:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _bump(buckets: dict, url: str | None, level: str | None, when, fuente: str) -> None:
    domain = _domain_of(url)
    if not domain:
        return
    level = (level or "alto").lower()
    item = buckets.get(domain)
    if not item:
        buckets[domain] = {
            "dominio": domain,
            "nivel": level,
            "peso": 0,
            "fuente": fuente,
            "ultimo_evento": _iso(when),
        }
        item = buckets[domain]
    item["peso"] += 1
    if _LEVEL_RANK.get(level, 0) >= _LEVEL_RANK.get(item["nivel"], 0):
        item["nivel"] = level
    if fuente == "reporte":
        item["fuente"] = "reporte"
    if when and (not item["ultimo_evento"] or str(when) > str(item["ultimo_evento"])):
        item["ultimo_evento"] = _iso(when)


def build_threat_map(db: Session, hours: int = 24) -> dict:
    """Actividad reciente de reportes y análisis alto/crítico.

    No geolocaliza la IP de quien escaneó. No inventa puntos en un mapa
    mundial. Expone solo el dominio, no la URL completa.
    """
    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    report_rows = (
        db.query(Reporte.fecha_reporte, Enlace.url, Enlace.nivel_riesgo)
        .outerjoin(Enlace, Reporte.enlace_id == Enlace.id)
        .filter(Reporte.fecha_reporte >= since)
        .order_by(Reporte.fecha_reporte.desc())
        .limit(200)
        .all()
    )

    analysis_rows = (
        db.query(
            AnalisisUrl.url_analizada,
            AnalisisUrl.nivel_riesgo,
            AnalisisUrl.fecha_analisis,
        )
        .filter(
            AnalisisUrl.fecha_analisis >= since,
            AnalisisUrl.nivel_riesgo.in_(list(HIGH_LEVELS)),
        )
        .order_by(AnalisisUrl.fecha_analisis.desc())
        .limit(200)
        .all()
    )

    buckets: dict[str, dict] = {}
    for fecha, url, nivel in report_rows:
        _bump(buckets, url, nivel or "alto", fecha, "reporte")
    for url, nivel, fecha in analysis_rows:
        _bump(buckets, url, nivel, fecha, "analisis")

    dominios = sorted(buckets.values(), key=lambda d: (-d["peso"], d["dominio"]))

    resumen: dict[str, int] = {}
    for item in dominios:
        resumen[item["nivel"]] = resumen.get(item["nivel"], 0) + item["peso"]

    return {
        "points": [],
        "total_puntos": 0,
        "dominios": dominios,
        "amenazas_activas": len(dominios),
        "sin_ubicacion": 0,
        "ventana_horas": hours,
        "actualizado": datetime.now(timezone.utc).isoformat(),
        "en_vivo": False,
        "ubicacion_aproximada": False,
        "resumen_niveles": resumen,
        "total_analisis": db.query(func.count(AnalisisUrl.id)).scalar() or 0,
        "total_reportes": len(report_rows),
    }
