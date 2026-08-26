from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError
from sqlalchemy.orm import Session
from starlette.datastructures import UploadFile as StarletteUploadFile

from auth.deps import get_current_user, require_admin
from database.session import get_db
from models.user import User
from schemas.reporte import (
    ReporteCreate,
    ReporteDetailOut,
    ReporteMensajeCreate,
    ReporteMensajeOut,
    ReporteOut,
    ReporteUpdate,
    UnreadCountOut,
)
from services import reporte_service, usage_service

router = APIRouter(prefix="/reportes", tags=["reportes"])


def _form_str(form, *keys: str) -> str | None:
    for key in keys:
        value = form.get(key)
        if value is None or isinstance(value, StarletteUploadFile):
            continue
        text = str(value).strip()
        if text:
            return text
    return None


async def _payload_from_request(request: Request) -> tuple[
    int,
    str,
    str | None,
    str | None,
    tuple[bytes, str | None, str | None] | None,
]:
    content_type = (request.headers.get("content-type") or "").lower()
    if "multipart/form-data" in content_type:
        form = await request.form()
        raw_id = _form_str(form, "enlace_id")
        if not raw_id or not raw_id.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="enlace_id es obligatorio",
            )
        motivo = _form_str(form, "motivo", "reason")
        if not motivo or len(motivo) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El motivo debe tener al menos 3 caracteres",
            )
        screenshot = None
        file = form.get("screenshot")
        if isinstance(file, StarletteUploadFile) and (file.filename or "").strip():
            content = await file.read()
            if content:
                screenshot = (content, file.filename, file.content_type)
        return (
            int(raw_id),
            motivo,
            _form_str(form, "origin_type"),
            _form_str(form, "origin_message"),
            screenshot,
        )

    try:
        payload = await request.json()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuerpo invalido",
        ) from exc
    try:
        data = ReporteCreate.model_validate(payload)
    except ValidationError as exc:
        err = exc.errors()[0] if exc.errors() else {}
        loc = err.get("loc", ("",))[-1]
        if loc == "enlace_id":
            detail = "enlace_id es obligatorio"
        elif loc == "motivo":
            detail = "El motivo debe tener al menos 3 caracteres"
        else:
            detail = "Datos invalidos"
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail
        ) from exc
    return data.enlace_id, data.motivo, data.origin_type, data.origin_message, None


@router.post("", response_model=ReporteOut, status_code=status.HTTP_201_CREATED)
async def create_reporte(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enlace_id, motivo, origin_type, origin_message, screenshot = (
        await _payload_from_request(request)
    )
    reporte = reporte_service.create_reporte(
        db,
        current_user.id,
        enlace_id,
        motivo,
        origin_type=origin_type,
        origin_message=origin_message,
        screenshot=screenshot,
    )
    usage_service.log_event(db, "reporte_created", current_user.id)
    return reporte


@router.get("/mine", response_model=list[ReporteOut])
def list_my_reportes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return reporte_service.list_user_reportes(db, current_user.id)


@router.get("/unread-count", response_model=UnreadCountOut)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_admin = current_user.role == "admin"
    return UnreadCountOut(count=reporte_service.unread_count(db, current_user, is_admin))


@router.get("", response_model=list[ReporteOut], dependencies=[Depends(require_admin)])
def list_reportes(db: Session = Depends(get_db)):
    return reporte_service.list_all_reportes(db)


@router.get("/{reporte_id}", response_model=ReporteDetailOut)
def get_reporte(
    reporte_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_admin = current_user.role == "admin"
    return reporte_service.get_reporte_detail(db, reporte_id, current_user, is_admin)


@router.post("/{reporte_id}/mensajes", response_model=ReporteMensajeOut)
def post_mensaje(
    reporte_id: int,
    data: ReporteMensajeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_admin = current_user.role == "admin"
    return reporte_service.add_mensaje(
        db, reporte_id, current_user, data.cuerpo, is_admin
    )


@router.post("/{reporte_id}/leer", status_code=status.HTTP_204_NO_CONTENT)
def mark_leido(
    reporte_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_admin = current_user.role == "admin"
    reporte_service.mark_reporte_leido(db, reporte_id, current_user, is_admin)


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
