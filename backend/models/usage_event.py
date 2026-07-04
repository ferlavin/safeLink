from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class UsageEvent(Base):
    __tablename__ = "usage_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    usuario_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=True, index=True
    )
    evento: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    metadata_json: Mapped[str | None] = mapped_column("metadata", Text, nullable=True)
    fecha: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
