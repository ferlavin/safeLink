from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user, require_admin
from database.session import get_db
from models.user import User
from schemas.stats import (
    AdminDashboardResponse,
    StatsFeaturesResponse,
    StatsOverview,
    TrackEventRequest,
)
from schemas.encuesta import EncuestaStatsDetail, EncuestasStatsSummary
from services import encuesta_service, usage_service

router = APIRouter(tags=["stats"])


@router.post("/stats/track", status_code=status.HTTP_204_NO_CONTENT)
def track_page_view(
    data: TrackEventRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.evento not in usage_service.TRACKABLE_PAGE_EVENTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evento no permitido",
        )
    usage_service.log_event(db, data.evento, current_user.id)


admin_router = APIRouter(
    prefix="/admin/stats",
    tags=["admin-stats"],
    dependencies=[Depends(require_admin)],
)


@admin_router.get("/overview", response_model=StatsOverview)
def stats_overview(days: int = 30, db: Session = Depends(get_db)):
    return usage_service.get_overview(db, days)


@admin_router.get("/features", response_model=StatsFeaturesResponse)
def stats_features(days: int = 30, db: Session = Depends(get_db)):
    return usage_service.get_features(db, days)


@admin_router.get("/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard(days: int = 30, db: Session = Depends(get_db)):
    return usage_service.get_admin_dashboard(db, days)


@admin_router.get("/encuestas", response_model=EncuestasStatsSummary)
def encuestas_stats_summary(days: int = 30, db: Session = Depends(get_db)):
    return encuesta_service.get_encuestas_stats_summary(db, days)


@admin_router.get("/encuestas/{encuesta_id}", response_model=EncuestaStatsDetail)
def encuesta_stats_detail(
    encuesta_id: int, days: int = 30, db: Session = Depends(get_db)
):
    return encuesta_service.get_encuesta_stats_detail(db, encuesta_id, days)
