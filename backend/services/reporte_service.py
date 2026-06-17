from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.enlace import Enlace
from models.reporte import Reporte


def create_reporte(
    db: Session, user_id: int, enlace_id: int, motivo: str
) -> Reporte:
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
    db.commit()
    db.refresh(row)
    return row


def list_user_reportes(db: Session, user_id: int, limit: int = 50) -> list[Reporte]:
    return (
        db.query(Reporte)
        .filter(Reporte.usuario_id == user_id)
        .order_by(Reporte.fecha_reporte.desc())
        .limit(limit)
        .all()
    )


def list_all_reportes(db: Session, limit: int = 100) -> list[Reporte]:
    return (
        db.query(Reporte)
        .order_by(Reporte.fecha_reporte.desc())
        .limit(limit)
        .all()
    )


def update_reporte_estado(db: Session, reporte_id: int, estado: str) -> Reporte:
    row = db.query(Reporte).filter(Reporte.id == reporte_id).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado"
        )
    row.estado = estado
    db.commit()
    db.refresh(row)
    return row
