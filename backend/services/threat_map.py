import httpx
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.analysis import AnalisisUrl
from models.search_event import SearchEvent

COUNTRY_COORDS = {
    "Argentina": (-34.6, -58.4),
    "Unknown": (-34.6, -58.4),
}

ACTIVE_LEVELS = {"medio", "alto", "critico"}


def _geoip(ip: str) -> tuple[float, float, str]:
    if not ip or ip in ("127.0.0.1", "::1"):
        return (*COUNTRY_COORDS["Argentina"], "Argentina")
    try:
        with httpx.Client(timeout=5.0) as client:
            r = client.get(
                f"http://ip-api.com/json/{ip}",
                params={"fields": "status,lat,lon,country,city"},
            )
            data = r.json()
            if data.get("status") == "success":
                return (data["lat"], data["lon"], data.get("country", "Unknown"))
    except Exception:
        pass
    return (*COUNTRY_COORDS["Unknown"], "Unknown")


def build_threat_map(db: Session, hours: int = 24) -> dict:
    """Heatmap crowdsourced: eventos recientes de la comunidad SafeLink."""
    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    events = (
        db.query(
            SearchEvent.url,
            SearchEvent.level,
            SearchEvent.ip,
            SearchEvent.created_at,
        )
        .filter(SearchEvent.created_at >= since)
        .order_by(SearchEvent.created_at.desc())
        .limit(300)
        .all()
    )

    activas = [e for e in events if (e.level or "") in ACTIVE_LEVELS]

    if not activas:
        activas_q = (
            db.query(
                AnalisisUrl.url_analizada,
                AnalisisUrl.nivel_riesgo,
                AnalisisUrl.fecha_analisis,
            )
            .filter(
                AnalisisUrl.fecha_analisis >= since,
                AnalisisUrl.nivel_riesgo.in_(list(ACTIVE_LEVELS)),
            )
            .order_by(AnalisisUrl.fecha_analisis.desc())
            .limit(80)
            .all()
        )
        points = []
        for url, level, fecha in activas_q:
            lat, lon, country = COUNTRY_COORDS["Argentina"]
            points.append(
                {
                    "lat": lat,
                    "lon": lon,
                    "country": country,
                    "url": url[:120],
                    "level": level,
                    "weight": 1,
                    "urls": [url[:80]],
                    "ultimo_evento": fecha.isoformat() if fecha else None,
                }
            )
    else:
        grid: dict[tuple, dict] = {}
        for url, level, ip, created in activas:
            lat, lon, country = _geoip(ip or "")
            key = (round(lat, 1), round(lon, 1), level or "medio")
            if key not in grid:
                grid[key] = {
                    "lat": lat,
                    "lon": lon,
                    "country": country,
                    "level": level or "medio",
                    "weight": 0,
                    "urls": [],
                    "ultimo_evento": created.isoformat() if created else None,
                }
            grid[key]["weight"] += 1
            if len(grid[key]["urls"]) < 3:
                grid[key]["urls"].append(url[:80])
            if created and (
                not grid[key]["ultimo_evento"]
                or str(created) > grid[key]["ultimo_evento"]
            ):
                grid[key]["ultimo_evento"] = created.isoformat()

        points = list(grid.values())

    by_level = (
        db.query(AnalisisUrl.nivel_riesgo, func.count(AnalisisUrl.id))
        .group_by(AnalisisUrl.nivel_riesgo)
        .all()
    )

    return {
        "points": points,
        "total_puntos": len(points),
        "amenazas_activas": len(activas) if activas else len(points),
        "ventana_horas": hours,
        "actualizado": datetime.now(timezone.utc).isoformat(),
        "en_vivo": True,
        "resumen_niveles": {level: count for level, count in by_level},
        "total_analisis": db.query(func.count(AnalisisUrl.id)).scalar() or 0,
    }
