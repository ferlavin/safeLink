from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.enlace import Enlace
from models.reporte import Reporte
from models.reporte_mensaje import ReporteMensaje
from models.user import User
from schemas.reporte import ReporteDetailOut, ReporteMensajeOut, ReporteOut


def _get_enlace_url(db: Session, enlace_id: int | None) -> str | None:
    if not enlace_id:
        return None
    enlace = db.query(Enlace).filter(Enlace.id == enlace_id).first()
    return enlace.url if enlace else None


def _unread_count(db: Session, reporte_id: int, for_admin: bool) -> int:
    """Mensajes no leídos del otro lado de la conversación."""
    q = db.query(func.count(ReporteMensaje.id)).filter(
        ReporteMensaje.reporte_id == reporte_id,
        ReporteMensaje.leido.is_(False),
        ReporteMensaje.es_admin.is_(not for_admin),
    )
    return q.scalar() or 0


def _last_message_preview(db: Session, reporte_id: int) -> str | None:
    row = (
        db.query(ReporteMensaje)
        .filter(ReporteMensaje.reporte_id == reporte_id)
        .order_by(ReporteMensaje.fecha.desc())
        .first()
    )
    if not row:
        return None
    text = row.cuerpo.strip()
    return text[:120] + ("…" if len(text) > 120 else "")


def _serialize_reporte(db: Session, row: Reporte, for_admin: bool) -> ReporteOut:
    return ReporteOut(
        id=row.id,
        usuario_id=row.usuario_id,
        enlace_id=row.enlace_id,
        motivo=row.motivo,
        estado=row.estado,
        fecha_reporte=row.fecha_reporte,
        enlace_url=_get_enlace_url(db, row.enlace_id),
        unread_count=_unread_count(db, row.id, for_admin=for_admin),
        ultimo_mensaje=_last_message_preview(db, row.id),
    )


def _serialize_mensaje(db: Session, row: ReporteMensaje) -> ReporteMensajeOut:
    autor_nombre = None
    if row.autor_id:
        user = db.query(User).filter(User.id == row.autor_id).first()
        autor_nombre = user.full_name if user else None
    return ReporteMensajeOut(
        id=row.id,
        reporte_id=row.reporte_id,
        autor_id=row.autor_id,
        autor_nombre=autor_nombre,
        es_admin=row.es_admin,
        cuerpo=row.cuerpo,
        fecha=row.fecha,
        leido=row.leido,
    )


def _get_reporte_or_404(db: Session, reporte_id: int) -> Reporte:
    row = db.query(Reporte).filter(Reporte.id == reporte_id).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    return row


def _assert_can_access(row: Reporte, user: User, is_admin: bool) -> None:
    if is_admin:
        return
    if row.usuario_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")


def create_reporte(
    db: Session, user_id: int, enlace_id: int, motivo: str
) -> ReporteOut:
    enlace = db.query(Enlace).filter(Enlace.id == enlace_id).first()
    if not enlace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Enlace no encontrado"
        )

    row = Reporte(
        usuario_id=user_id,
        enlace_id=enlace_id,
        motivo=motivo,
        estado="Pendiente",
        fecha_reporte=datetime.now(timezone.utc),
    )
    db.add(row)
    db.flush()

    initial = ReporteMensaje(
        reporte_id=row.id,
        autor_id=user_id,
        es_admin=False,
        cuerpo=motivo.strip(),
        fecha=datetime.now(timezone.utc),
        leido=False,
    )
    db.add(initial)
    db.commit()
    db.refresh(row)
    return _serialize_reporte(db, row, for_admin=False)


def list_user_reportes(db: Session, user_id: int, limit: int = 50) -> list[ReporteOut]:
    rows = (
        db.query(Reporte)
        .filter(Reporte.usuario_id == user_id)
        .order_by(Reporte.fecha_reporte.desc())
        .limit(limit)
        .all()
    )
    return [_serialize_reporte(db, row, for_admin=False) for row in rows]


def list_all_reportes(db: Session, limit: int = 100) -> list[ReporteOut]:
    rows = (
        db.query(Reporte)
        .order_by(Reporte.fecha_reporte.desc())
        .limit(limit)
        .all()
    )
    return [_serialize_reporte(db, row, for_admin=True) for row in rows]


def get_reporte_detail(
    db: Session, reporte_id: int, user: User, is_admin: bool
) -> ReporteDetailOut:
    row = _get_reporte_or_404(db, reporte_id)
    _assert_can_access(row, user, is_admin)

    mensajes = (
        db.query(ReporteMensaje)
        .filter(ReporteMensaje.reporte_id == reporte_id)
        .order_by(ReporteMensaje.fecha.asc())
        .all()
    )

    base = _serialize_reporte(db, row, for_admin=is_admin)
    return ReporteDetailOut(
        **base.model_dump(),
        mensajes=[_serialize_mensaje(db, m) for m in mensajes],
    )


def add_mensaje(
    db: Session,
    reporte_id: int,
    user: User,
    cuerpo: str,
    is_admin: bool,
) -> ReporteMensajeOut:
    row = _get_reporte_or_404(db, reporte_id)
    _assert_can_access(row, user, is_admin)

    if row.estado in ("Resuelto", "Descartado"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este reporte está cerrado y no acepta nuevos mensajes",
        )

    msg = ReporteMensaje(
        reporte_id=reporte_id,
        autor_id=user.id,
        es_admin=is_admin,
        cuerpo=cuerpo.strip(),
        fecha=datetime.now(timezone.utc),
        leido=False,
    )
    db.add(msg)

    if is_admin:
        if row.estado in ("Pendiente", "En revisión"):
            row.estado = "Respondido"
    elif row.estado == "Pendiente":
        row.estado = "En revisión"

    db.commit()
    db.refresh(msg)
    return _serialize_mensaje(db, msg)


def mark_reporte_leido(
    db: Session, reporte_id: int, user: User, is_admin: bool
) -> None:
    row = _get_reporte_or_404(db, reporte_id)
    _assert_can_access(row, user, is_admin)

    (
        db.query(ReporteMensaje)
        .filter(
            ReporteMensaje.reporte_id == reporte_id,
            ReporteMensaje.leido.is_(False),
            ReporteMensaje.es_admin.is_(not is_admin),
        )
        .update({ReporteMensaje.leido: True}, synchronize_session=False)
    )
    db.commit()


def unread_count(db: Session, user: User, is_admin: bool) -> int:
    if is_admin:
        q = (
            db.query(func.count(ReporteMensaje.id))
            .join(Reporte, Reporte.id == ReporteMensaje.reporte_id)
            .filter(
                ReporteMensaje.leido.is_(False),
                ReporteMensaje.es_admin.is_(False),
            )
        )
    else:
        q = (
            db.query(func.count(ReporteMensaje.id))
            .join(Reporte, Reporte.id == ReporteMensaje.reporte_id)
            .filter(
                Reporte.usuario_id == user.id,
                ReporteMensaje.leido.is_(False),
                ReporteMensaje.es_admin.is_(True),
            )
        )
    return q.scalar() or 0


def update_reporte_estado(db: Session, reporte_id: int, estado: str) -> ReporteOut:
    row = _get_reporte_or_404(db, reporte_id)
    row.estado = estado
    db.commit()
    db.refresh(row)
    return _serialize_reporte(db, row, for_admin=True)
