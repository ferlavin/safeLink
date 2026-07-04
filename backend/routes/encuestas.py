from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth.deps import get_current_user, require_admin
from database.session import get_db
from models.user import User
from schemas.encuesta import (
    EncuestaActivaOut,
    EncuestaCreate,
    EncuestaDetailOut,
    EncuestaOut,
    EncuestaUpdate,
    RespuestaOut,
    RespuestaSubmit,
)
from services import encuesta_service, usage_service

router = APIRouter(prefix="/encuestas", tags=["encuestas"])


class ActivaToggle(BaseModel):
    activa: bool


@router.get("/activas", response_model=list[EncuestaActivaOut])
def list_active(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return encuesta_service.list_active_encuestas(db, current_user.id)


@router.get("", response_model=list[EncuestaOut], dependencies=[Depends(require_admin)])
def list_all(db: Session = Depends(get_db)):
    return encuesta_service.list_all_encuestas(db)


@router.post(
    "",
    response_model=EncuestaDetailOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create(
    data: EncuestaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return encuesta_service.create_encuesta(db, current_user.id, data)


@router.get("/{encuesta_id}", response_model=EncuestaDetailOut)
def get_detail(
    encuesta_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_admin = current_user.role == "admin"
    return encuesta_service.get_encuesta_detail(db, encuesta_id, current_user, is_admin)


@router.put(
    "/{encuesta_id}",
    response_model=EncuestaDetailOut,
    dependencies=[Depends(require_admin)],
)
def update(
    encuesta_id: int,
    data: EncuestaUpdate,
    db: Session = Depends(get_db),
):
    return encuesta_service.update_encuesta(db, encuesta_id, data)


@router.patch(
    "/{encuesta_id}/activa",
    response_model=EncuestaOut,
    dependencies=[Depends(require_admin)],
)
def toggle_active(
    encuesta_id: int,
    data: ActivaToggle,
    db: Session = Depends(get_db),
):
    return encuesta_service.set_encuesta_activa(db, encuesta_id, data.activa)


@router.post(
    "/{encuesta_id}/respuestas",
    response_model=RespuestaOut,
    status_code=status.HTTP_201_CREATED,
)
def submit(
    encuesta_id: int,
    data: RespuestaSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = encuesta_service.submit_respuesta(db, encuesta_id, current_user.id, data)
    usage_service.log_event(db, "encuesta_respondida", current_user.id)
    return result
