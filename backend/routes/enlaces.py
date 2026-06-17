from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from database.session import get_db
from models.user import User
from schemas.enlace import EnlaceOut
from schemas.escaneo import EscaneoOut
from services import enlace_service

router = APIRouter(prefix="/enlaces", tags=["enlaces"])


@router.get("", response_model=list[EnlaceOut])
def list_enlaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return enlace_service.list_user_enlaces(db, current_user.id)


@router.get("/{enlace_id}/escaneos", response_model=list[EscaneoOut])
def list_escaneos(
    enlace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enlace = enlace_service.get_enlace(db, enlace_id, current_user.id)
    if not enlace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Enlace no encontrado"
        )
    return enlace_service.list_escaneos_for_enlace(
        db, enlace_id, current_user.id
    )
