from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user, require_admin
from database.session import get_db
from models.user import User
from schemas.reporte import ReporteCreate, ReporteOut, ReporteUpdate
from services import reporte_service

router = APIRouter(prefix="/reportes", tags=["reportes"])


@router.post("", response_model=ReporteOut, status_code=status.HTTP_201_CREATED)
def create_reporte(
    data: ReporteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return reporte_service.create_reporte(
        db, current_user.id, data.enlace_id, data.motivo
    )


@router.get("/mine", response_model=list[ReporteOut])
def list_my_reportes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return reporte_service.list_user_reportes(db, current_user.id)


@router.get("", response_model=list[ReporteOut], dependencies=[Depends(require_admin)])
def list_reportes(db: Session = Depends(get_db)):
    return reporte_service.list_all_reportes(db)


@router.put(
    "/{reporte_id}",
    response_model=ReporteOut,
    dependencies=[Depends(require_admin)],
)
def update_reporte(
    reporte_id: int,
    data: ReporteUpdate,
    db: Session = Depends(get_db),
):
    return reporte_service.update_reporte_estado(db, reporte_id, data.estado)
