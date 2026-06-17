from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models.enlace import Enlace
from models.escaneo import Escaneo


def _nivel_to_estado(nivel: str) -> str:
    if nivel == "bajo":
        return "Seguro"
    if nivel == "medio":
        return "Precaucion"
    return "Peligroso"


def _nivel_to_riesgo(nivel: str) -> str:
    if nivel == "bajo":
        return "Bajo"
    if nivel == "medio":
        return "Medio"
    return "Alto"


def _nivel_to_resultado(nivel: str) -> str:
    return _nivel_to_estado(nivel)


def get_or_create_enlace(
    db: Session, user_id: int, url: str, nivel_riesgo: str
) -> Enlace:
    now = datetime.now(timezone.utc)
    row = (
        db.query(Enlace)
        .filter(Enlace.usuario_id == user_id, Enlace.url == url)
        .first()
    )
    if row:
        row.estado = _nivel_to_estado(nivel_riesgo)
        row.nivel_riesgo = _nivel_to_riesgo(nivel_riesgo)
        row.fecha_analisis = now
        db.commit()
        db.refresh(row)
        return row

    row = Enlace(
        usuario_id=user_id,
        url=url,
        estado=_nivel_to_estado(nivel_riesgo),
        nivel_riesgo=_nivel_to_riesgo(nivel_riesgo),
        fecha_analisis=now,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def create_escaneo(
    db: Session,
    user_id: int,
    enlace_id: int,
    nivel_riesgo: str,
    puntuacion_riesgo: int,
) -> Escaneo:
    row = Escaneo(
        usuario_id=user_id,
        enlace_id=enlace_id,
        resultado=_nivel_to_resultado(nivel_riesgo),
        porcentaje_riesgo=puntuacion_riesgo,
        fecha=datetime.now(timezone.utc),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def persist_scan(
    db: Session, user_id: int, url: str, nivel_riesgo: str, puntuacion_riesgo: int
) -> tuple[Enlace, Escaneo]:
    enlace = get_or_create_enlace(db, user_id, url, nivel_riesgo)
    escaneo = create_escaneo(
        db, user_id, enlace.id, nivel_riesgo, puntuacion_riesgo
    )
    return enlace, escaneo


def list_user_enlaces(db: Session, user_id: int, limit: int = 50) -> list[Enlace]:
    return (
        db.query(Enlace)
        .filter(Enlace.usuario_id == user_id)
        .order_by(Enlace.fecha_analisis.desc())
        .limit(limit)
        .all()
    )


def get_enlace(db: Session, enlace_id: int, user_id: int) -> Enlace | None:
    return (
        db.query(Enlace)
        .filter(Enlace.id == enlace_id, Enlace.usuario_id == user_id)
        .first()
    )


def list_escaneos_for_enlace(
    db: Session, enlace_id: int, user_id: int, limit: int = 50
) -> list[Escaneo]:
    enlace = get_enlace(db, enlace_id, user_id)
    if not enlace:
        return []
    return (
        db.query(Escaneo)
        .filter(Escaneo.enlace_id == enlace_id, Escaneo.usuario_id == user_id)
        .order_by(Escaneo.fecha.desc())
        .limit(limit)
        .all()
    )
