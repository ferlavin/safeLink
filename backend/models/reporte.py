from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class Reporte(Base):
    __tablename__ = "reportes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    usuario_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=True
    )
    enlace_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("enlaces.id"), nullable=True
    )
    motivo: Mapped[str | None] = mapped_column(Text, nullable=True)
    estado: Mapped[str | None] = mapped_column(String(20), default="Pendiente")
    fecha_reporte: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
