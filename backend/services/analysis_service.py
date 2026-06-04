import json
from datetime import datetime, timezone

from fastapi import Request
from sqlalchemy.orm import Session

from models.analysis import AnalisisUrl
from models.search_event import SearchEvent
from models.user import User
from schemas.analysis import UrlAnalysisHistoryItem
from services.url_analyzer import analyze_url
from services.user_copy import humanize_detalle


def save_analysis(db: Session, user: User, result: dict) -> AnalisisUrl:
    now = datetime.now(timezone.utc)
    row = AnalisisUrl(
        usuario_id=user.id,
        url_analizada=result["url"],
        nivel_riesgo=result["nivel_riesgo"],
        explicacion=result["explicacion"],
        fecha_analisis=now,
        puntuacion_riesgo=result["puntuacion_riesgo"],
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def log_search_event(
    db: Session,
    user: User,
    url: str,
    level: str,
    request: Request | None = None,
) -> None:
    ip = None
    user_agent = None
    if request:
        ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

    event = SearchEvent(
        user_id=user.id,
        email=user.email,
        url=url,
        level=level,
        created_at=datetime.now(timezone.utc),
        ip=ip,
        user_agent=user_agent,
    )
    db.add(event)
    db.commit()


def _format_response(row: AnalisisUrl, detalle: dict | None) -> dict:
    return {
        "id": row.id,
        "url": row.url_analizada,
        "puntuacion_riesgo": row.puntuacion_riesgo or 0,
        "nivel_riesgo": row.nivel_riesgo,
        "explicacion": row.explicacion,
        "detalle": detalle,
        "fecha_analisis": row.fecha_analisis,
    }


def persist_result(
    db: Session,
    user: User,
    result: dict,
    request: Request | None = None,
    log_event: bool = True,
) -> dict:
    row = save_analysis(db, user, result)
    if log_event:
        log_search_event(db, user, result["url"], result["nivel_riesgo"], request)
    detalle = result.get("detalle")
    if detalle is None and isinstance(result.get("explicacion"), str):
        try:
            detalle = json.loads(result["explicacion"])
        except json.JSONDecodeError:
            detalle = {"resumen": [result["explicacion"]]}
    return _format_response(row, humanize_detalle(detalle))


def run_and_persist(
    db: Session, user: User, url: str, request: Request | None = None
) -> dict:
    result = analyze_url(url)
    return persist_result(db, user, result, request)


def list_user_history(db: Session, user_id: int, limit: int = 50) -> list[AnalisisUrl]:
    return (
        db.query(AnalisisUrl)
        .filter(AnalisisUrl.usuario_id == user_id)
        .order_by(AnalisisUrl.fecha_analisis.desc())
        .limit(limit)
        .all()
    )


def _is_web_url(url: str) -> bool:
    return url.startswith("http://") or url.startswith("https://")


def _to_history_item(row: AnalisisUrl) -> UrlAnalysisHistoryItem:
    return UrlAnalysisHistoryItem(
        id=row.id,
        url_analizada=row.url_analizada,
        nivel_riesgo=row.nivel_riesgo,
        puntuacion_riesgo=row.puntuacion_riesgo,
        fecha_analisis=row.fecha_analisis,
    )


def list_history_by_risk(
    db: Session, user_id: int, limit_per_group: int = 15
) -> dict[str, list[UrlAnalysisHistoryItem]]:
    rows = (
        db.query(AnalisisUrl)
        .filter(AnalisisUrl.usuario_id == user_id)
        .order_by(AnalisisUrl.fecha_analisis.desc())
        .limit(limit_per_group * 4)
        .all()
    )
    grouped: dict[str, list[UrlAnalysisHistoryItem]] = {
        "bajo": [],
        "medio": [],
        "alto": [],
    }
    for row in rows:
        if not _is_web_url(row.url_analizada):
            continue
        nivel = row.nivel_riesgo
        if nivel == "critico":
            bucket = "alto"
        elif nivel in grouped:
            bucket = nivel
        else:
            continue
        if len(grouped[bucket]) >= limit_per_group:
            continue
        grouped[bucket].append(_to_history_item(row))
    return grouped


def get_analysis(db: Session, analysis_id: int, user_id: int) -> AnalisisUrl | None:
    return (
        db.query(AnalisisUrl)
        .filter(AnalisisUrl.id == analysis_id, AnalisisUrl.usuario_id == user_id)
        .first()
    )
