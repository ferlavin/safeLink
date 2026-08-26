from collections import Counter
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.analysis import AnalisisUrl
from models.encuesta_respuesta import EncuestaRespuesta
from models.enlace import Enlace
from models.escaneo import Escaneo
from models.historial_login import HistorialLogin
from models.reporte import Reporte
from models.usage_event import UsageEvent
from schemas.historial_login import HistorialLoginOut
from schemas.stats import DailyStat, DomainStat, FeatureStat
from schemas.user_inspect import (
    InspectActivityItem,
    InspectAnalysisItem,
    InspectReporteItem,
    RiskStat,
    UserInspectCounts,
    UserInspectProfile,
    UserInspectResponse,
)
from services.usage_service import EVENT_LABELS, _domain_of, _since
from services.user_service import get_user

OPEN_REPORTE_STATES = ("Pendiente", "En revisión", "Respondido")
TOOL_EVENTS = frozenset(
    {
        "analyze_url",
        "analyze_pdf",
        "analyze_web3",
        "analyze_dns",
        "analyze_typosquatting",
        "analyze_nlp",
        "analyze_headers",
        "analyze_oauth",
        "analyze_forms",
        "analyze_page",
        "analyze_check",
    }
)


def _event_label(evento: str) -> str:
    return EVENT_LABELS.get(evento, evento.replace("_", " ").title())


def _as_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _count(db: Session, model, column, user_id: int) -> int:
    return db.query(func.count(model.id)).filter(column == user_id).scalar() or 0


def inspect_user(db: Session, user_id: int, days: int = 30) -> UserInspectResponse:
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    since = _since(days)

    analyses = _count(db, AnalisisUrl, AnalisisUrl.usuario_id, user_id)
    enlaces = _count(db, Enlace, Enlace.usuario_id, user_id)
    escaneos = _count(db, Escaneo, Escaneo.usuario_id, user_id)
    reportes = _count(db, Reporte, Reporte.usuario_id, user_id)
    encuestas = _count(db, EncuestaRespuesta, EncuestaRespuesta.usuario_id, user_id)
    logins = _count(db, HistorialLogin, HistorialLogin.usuario_id, user_id)

    reportes_abiertos = (
        db.query(func.count(Reporte.id))
        .filter(
            Reporte.usuario_id == user_id,
            Reporte.estado.in_(OPEN_REPORTE_STATES),
        )
        .scalar()
        or 0
    )
    eventos_periodo = (
        db.query(func.count(UsageEvent.id))
        .filter(UsageEvent.usuario_id == user_id, UsageEvent.fecha >= since)
        .scalar()
        or 0
    )
    extension_checks = (
        db.query(func.count(UsageEvent.id))
        .filter(UsageEvent.usuario_id == user_id, UsageEvent.evento == "analyze_check")
        .scalar()
        or 0
    )

    feature_rows = (
        db.query(UsageEvent.evento, func.count(UsageEvent.id))
        .filter(UsageEvent.usuario_id == user_id, UsageEvent.fecha >= since)
        .group_by(UsageEvent.evento)
        .order_by(func.count(UsageEvent.id).desc())
        .all()
    )
    features = [
        FeatureStat(evento=evento, label=_event_label(evento), count=count)
        for evento, count in feature_rows
    ]
    herramienta_top = next(
        (item for item in features if item.evento in TOOL_EVENTS),
        features[0] if features else None,
    )

    daily_rows = (
        db.query(func.date(UsageEvent.fecha), func.count(UsageEvent.id))
        .filter(UsageEvent.usuario_id == user_id, UsageEvent.fecha >= since)
        .group_by(func.date(UsageEvent.fecha))
        .order_by(func.date(UsageEvent.fecha))
        .all()
    )
    daily = [DailyStat(date=str(day), count=count) for day, count in daily_rows if day]

    risk_rows = (
        db.query(AnalisisUrl.nivel_riesgo, func.count(AnalisisUrl.id))
        .filter(AnalisisUrl.usuario_id == user_id)
        .group_by(AnalisisUrl.nivel_riesgo)
        .all()
    )
    riesgos = [
        RiskStat(nivel=nivel or "desconocido", count=count)
        for nivel, count in risk_rows
    ]
    riesgos.sort(key=lambda item: item.count, reverse=True)

    url_rows = (
        db.query(AnalisisUrl.url_analizada)
        .filter(AnalisisUrl.usuario_id == user_id)
        .all()
    )
    domain_counter: Counter[str] = Counter()
    for (url,) in url_rows:
        domain = _domain_of(url)
        if domain:
            domain_counter[domain] += 1
    dominios = [
        DomainStat(domain=domain, count=count)
        for domain, count in domain_counter.most_common(8)
    ]

    analisis_rows = (
        db.query(AnalisisUrl)
        .filter(AnalisisUrl.usuario_id == user_id)
        .order_by(AnalisisUrl.fecha_analisis.desc().nullslast())
        .limit(10)
        .all()
    )
    analisis_recientes = [
        InspectAnalysisItem(
            id=row.id,
            url=row.url_analizada,
            nivel_riesgo=row.nivel_riesgo,
            puntuacion_riesgo=row.puntuacion_riesgo,
            fecha_analisis=row.fecha_analisis,
        )
        for row in analisis_rows
    ]

    login_rows = (
        db.query(HistorialLogin)
        .filter(HistorialLogin.usuario_id == user_id)
        .order_by(HistorialLogin.fecha.desc().nullslast())
        .limit(10)
        .all()
    )
    logins_recientes = [HistorialLoginOut.model_validate(row) for row in login_rows]

    reporte_rows = (
        db.query(Reporte, Enlace.url)
        .outerjoin(Enlace, Reporte.enlace_id == Enlace.id)
        .filter(Reporte.usuario_id == user_id)
        .order_by(Reporte.fecha_reporte.desc().nullslast())
        .limit(10)
        .all()
    )
    reportes_recientes = [
        InspectReporteItem(
            id=row.id,
            motivo=row.motivo,
            estado=row.estado,
            fecha_reporte=row.fecha_reporte,
            enlace_url=url,
            origin_type=row.origin_type,
            origin_message=row.origin_message,
            screenshot_path=row.screenshot_path,
        )
        for row, url in reporte_rows
    ]

    activity_rows = (
        db.query(UsageEvent)
        .filter(UsageEvent.usuario_id == user_id)
        .order_by(UsageEvent.fecha.desc().nullslast())
        .limit(12)
        .all()
    )
    actividad_reciente = [
        InspectActivityItem(
            evento=row.evento,
            label=_event_label(row.evento),
            fecha=row.fecha,
        )
        for row in activity_rows
    ]

    last_event = (
        db.query(func.max(UsageEvent.fecha))
        .filter(UsageEvent.usuario_id == user_id)
        .scalar()
    )
    last_analysis = (
        db.query(func.max(AnalisisUrl.fecha_analisis))
        .filter(AnalisisUrl.usuario_id == user_id)
        .scalar()
    )
    candidates = [
        value
        for value in (
            _as_utc(user.last_login),
            _as_utc(last_event),
            _as_utc(last_analysis),
        )
        if value is not None
    ]
    ultima_actividad = max(candidates) if candidates else None

    return UserInspectResponse(
        days=min(max(days, 1), 365),
        profile=UserInspectProfile.model_validate(user),
        counts=UserInspectCounts(
            analyses=analyses,
            enlaces=enlaces,
            escaneos=escaneos,
            reportes=reportes,
            reportes_abiertos=reportes_abiertos,
            encuestas=encuestas,
            logins=logins,
            eventos_periodo=eventos_periodo,
            extension_checks=extension_checks,
        ),
        ultima_actividad=ultima_actividad,
        herramienta_top=herramienta_top,
        features=features,
        daily=daily,
        riesgos=riesgos,
        dominios=dominios,
        analisis_recientes=analisis_recientes,
        logins_recientes=logins_recientes,
        reportes_recientes=reportes_recientes,
        actividad_reciente=actividad_reciente,
    )
