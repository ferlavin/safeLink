from collections import Counter
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.enlace import Enlace
from models.reporte import Reporte
from models.usage_event import UsageEvent
from models.user import User
from schemas.stats import (
    ActivityItem,
    AdminDashboardResponse,
    DailyStat,
    DomainStat,
    FeatureStat,
    StatsFeaturesResponse,
    StatsOverview,
)

EVENT_LABELS: dict[str, str] = {
    "analyze_url": "Análisis de URL",
    "analyze_pdf": "Revisión PDF",
    "analyze_web3": "Sentinela Web3",
    "analyze_dns": "Guardia DNS",
    "analyze_typosquatting": "Typosquatting",
    "analyze_nlp": "Clasificador NLP",
    "analyze_headers": "Security headers",
    "analyze_oauth": "OAuth phishing",
    "analyze_forms": "Formularios",
    "analyze_page": "Detección JS",
    "analyze_check": "Check extensión",
    "threat_map_view": "Reportes de la comunidad",
    "enlaces_view": "Mis enlaces",
    "extension_page_view": "Página extensión",
    "dashboard_view": "Dashboard",
    "mensajes_view": "Bandeja mensajes",
    "reporte_created": "Reportes creados",
    "encuesta_respondida": "Encuestas respondidas",
    "encuestas_view": "Página encuestas",
    "login": "Inicios de sesión",
    "register": "Registros",
}

TRACKABLE_PAGE_EVENTS = frozenset(
    {
        "threat_map_view",
        "enlaces_view",
        "extension_page_view",
        "dashboard_view",
        "mensajes_view",
        "encuestas_view",
    }
)


def _since(days: int) -> datetime:
    days = min(max(days, 1), 365)
    return datetime.now(timezone.utc) - timedelta(days=days)


def log_event(db: Session, evento: str, usuario_id: int | None = None) -> None:
    try:
        row = UsageEvent(
            usuario_id=usuario_id,
            evento=evento,
            fecha=datetime.now(timezone.utc),
        )
        db.add(row)
        db.commit()
    except Exception:
        db.rollback()


def get_overview(db: Session, days: int = 30) -> StatsOverview:
    since = _since(days)
    total_events = (
        db.query(func.count(UsageEvent.id))
        .filter(UsageEvent.fecha >= since)
        .scalar()
        or 0
    )
    active_users = (
        db.query(func.count(func.distinct(UsageEvent.usuario_id)))
        .filter(UsageEvent.fecha >= since, UsageEvent.usuario_id.isnot(None))
        .scalar()
        or 0
    )
    new_users = (
        db.query(func.count(User.id))
        .filter(User.created_at >= since)
        .scalar()
        or 0
    )
    open_reportes = (
        db.query(func.count(Reporte.id))
        .filter(Reporte.estado.in_(["Pendiente", "En revisión", "Respondido"]))
        .scalar()
        or 0
    )
    total_reportes = (
        db.query(func.count(Reporte.id))
        .filter(Reporte.fecha_reporte >= since)
        .scalar()
        or 0
    )
    return StatsOverview(
        days=days,
        total_events=total_events,
        active_users=active_users,
        new_users=new_users,
        open_reportes=open_reportes,
        total_reportes=total_reportes,
    )


def get_features(db: Session, days: int = 30) -> StatsFeaturesResponse:
    since = _since(days)
    rows = (
        db.query(UsageEvent.evento, func.count(UsageEvent.id))
        .filter(UsageEvent.fecha >= since)
        .group_by(UsageEvent.evento)
        .order_by(func.count(UsageEvent.id).desc())
        .all()
    )
    features = [
        FeatureStat(
            evento=evento,
            label=EVENT_LABELS.get(evento, evento.replace("_", " ").title()),
            count=count,
        )
        for evento, count in rows
    ]

    daily_rows = (
        db.query(func.date(UsageEvent.fecha), func.count(UsageEvent.id))
        .filter(UsageEvent.fecha >= since)
        .group_by(func.date(UsageEvent.fecha))
        .order_by(func.date(UsageEvent.fecha))
        .all()
    )
    daily = [
        DailyStat(date=str(day), count=count) for day, count in daily_rows if day
    ]

    return StatsFeaturesResponse(days=days, features=features, daily=daily)


def _domain_of(url: str | None) -> str | None:
    if not url:
        return None
    raw = url.strip()
    if "://" not in raw:
        raw = "//" + raw
    try:
        host = urlparse(raw).hostname
    except ValueError:
        return None
    if not host:
        return None
    return host[4:] if host.startswith("www.") else host


def get_most_analysed_domains(db: Session, limit: int = 6) -> list[DomainStat]:
    rows = db.query(Enlace.url).all()
    counter: Counter[str] = Counter()
    for (url,) in rows:
        domain = _domain_of(url)
        if domain:
            counter[domain] += 1
    return [DomainStat(domain=domain, count=count) for domain, count in counter.most_common(limit)]


def get_recent_activity(db: Session, limit: int = 8) -> list[ActivityItem]:
    rows = (
        db.query(UsageEvent, User)
        .outerjoin(User, UsageEvent.usuario_id == User.id)
        .order_by(UsageEvent.fecha.desc().nullslast())
        .limit(limit)
        .all()
    )
    items: list[ActivityItem] = []
    for event, user in rows:
        nombre = None
        if user:
            nombre = user.full_name or user.email
        items.append(
            ActivityItem(
                usuario=nombre or "Anónimo",
                evento=event.evento,
                label=EVENT_LABELS.get(
                    event.evento, event.evento.replace("_", " ").title()
                ),
                fecha=event.fecha,
            )
        )
    return items


def get_admin_dashboard(db: Session, days: int = 30) -> AdminDashboardResponse:
    overview = get_overview(db, days)
    total_users = db.query(func.count(User.id)).scalar() or 0
    features = get_features(db, days)
    return AdminDashboardResponse(
        days=overview.days,
        total_users=total_users,
        active_users=overview.active_users,
        new_users=overview.new_users,
        open_reportes=overview.open_reportes,
        total_events=overview.total_events,
        total_reportes=overview.total_reportes,
        domains=get_most_analysed_domains(db, limit=6),
        activity=get_recent_activity(db, limit=8),
        daily=features.daily,
    )
