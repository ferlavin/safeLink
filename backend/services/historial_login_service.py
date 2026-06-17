from datetime import datetime, timezone

from fastapi import Request
from sqlalchemy.orm import Session

from models.historial_login import HistorialLogin


from datetime import datetime, timezone

from fastapi import Request
from sqlalchemy.orm import Session

from models.historial_login import HistorialLogin

MAX_DISPOSITIVO_LEN = 500
MAX_IP_LEN = 45


def log_login(db: Session, user_id: int, request: Request | None = None) -> HistorialLogin | None:
    ip = None
    dispositivo = None
    if request:
        if request.client:
            ip = (request.client.host or "")[:MAX_IP_LEN] or None
        raw_ua = request.headers.get("user-agent") or ""
        dispositivo = raw_ua[:MAX_DISPOSITIVO_LEN] or None

    row = HistorialLogin(
        usuario_id=user_id,
        fecha=datetime.now(timezone.utc),
        ip=ip,
        dispositivo=dispositivo,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_user_logins(db: Session, user_id: int, limit: int = 50) -> list[HistorialLogin]:
    return (
        db.query(HistorialLogin)
        .filter(HistorialLogin.usuario_id == user_id)
        .order_by(HistorialLogin.fecha.desc())
        .limit(limit)
        .all()
    )
