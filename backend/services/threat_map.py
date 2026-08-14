import ipaddress
import time
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.analysis import AnalisisUrl
from models.search_event import SearchEvent

ACTIVE_LEVELS = {"medio", "alto", "critico"}
# ~11 km: en ciberseguridad la geolocalización por IP es una región, no una calle.
GEO_PRECISION = 1
GEO_CACHE_TTL_OK = 6 * 3600
GEO_CACHE_TTL_MISS = 15 * 60

_geo_cache: dict[str, tuple[float, float, str | None, float, bool]] = {}


def _is_public_ip(ip: str | None) -> bool:
    if not ip:
        return False
    try:
        return ipaddress.ip_address(ip.strip()).is_global
    except ValueError:
        return False


def _geoip(ip: str) -> tuple[float, float, str] | None:
    """Resuelve una IP pública a país/región. None si no hay dato confiable."""
    now = time.time()
    cached = _geo_cache.get(ip)
    if cached:
        lat, lon, country, expires, ok = cached
        if now < expires:
            return (lat, lon, country or "Desconocido") if ok else None

    result: tuple[float, float, str] | None = None
    try:
        with httpx.Client(timeout=4.0) as client:
            response = client.get(
                f"http://ip-api.com/json/{ip}",
                params={"fields": "status,lat,lon,country"},
            )
            data = response.json()
            if data.get("status") == "success" and data.get("lat") is not None:
                result = (
                    float(data["lat"]),
                    float(data["lon"]),
                    str(data.get("country") or "Desconocido"),
                )
    except Exception:
        result = None

    if result:
        _geo_cache[ip] = (*result, now + GEO_CACHE_TTL_OK, True)
    else:
        _geo_cache[ip] = (0.0, 0.0, None, now + GEO_CACHE_TTL_MISS, False)
    return result


def _approx(lat: float, lon: float) -> tuple[float, float]:
    return (round(lat, GEO_PRECISION), round(lon, GEO_PRECISION))


def build_threat_map(db: Session, hours: int = 24) -> dict:
    """Heatmap de detecciones reales de la comunidad. Sin puntos inventados."""
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

    unique_ips = {e.ip for e in activas if _is_public_ip(e.ip)}
    geo_by_ip = {ip: _geoip(ip) for ip in unique_ips}

    grid: dict[tuple, dict] = {}
    sin_ubicacion = 0
    for url, level, ip, created in activas:
        geo = geo_by_ip.get(ip) if ip else None
        if not geo:
            sin_ubicacion += 1
            continue
        lat, lon, country = geo
        lat, lon = _approx(lat, lon)
        key = (lat, lon, level or "medio")
        if key not in grid:
            grid[key] = {
                "lat": lat,
                "lon": lon,
                "country": country,
                "level": level or "medio",
                "weight": 0,
                "urls": [],
                "ultimo_evento": created.isoformat() if created else None,
                "aproximado": True,
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

    if not events:
        analisis_count = (
            db.query(func.count(AnalisisUrl.id))
            .filter(
                AnalisisUrl.fecha_analisis >= since,
                AnalisisUrl.nivel_riesgo.in_(list(ACTIVE_LEVELS)),
            )
            .scalar()
            or 0
        )
        amenazas_activas = analisis_count
        sin_ubicacion = analisis_count
    else:
        amenazas_activas = len(activas)

    resumen_rows = (
        db.query(SearchEvent.level, func.count(SearchEvent.id))
        .filter(SearchEvent.created_at >= since)
        .group_by(SearchEvent.level)
        .all()
    )
    if not resumen_rows:
        resumen_rows = (
            db.query(AnalisisUrl.nivel_riesgo, func.count(AnalisisUrl.id))
            .filter(AnalisisUrl.fecha_analisis >= since)
            .group_by(AnalisisUrl.nivel_riesgo)
            .all()
        )

    return {
        "points": points,
        "total_puntos": len(points),
        "amenazas_activas": amenazas_activas,
        "sin_ubicacion": sin_ubicacion,
        "ventana_horas": hours,
        "actualizado": datetime.now(timezone.utc).isoformat(),
        "en_vivo": False,
        "ubicacion_aproximada": True,
        "resumen_niveles": {level or "desconocido": count for level, count in resumen_rows},
        "total_analisis": db.query(func.count(AnalisisUrl.id)).scalar() or 0,
    }
