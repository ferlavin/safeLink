from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class ReporteMensaje(Base):
    __tablename__ = "reporte_mensajes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    reporte_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("reportes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    autor_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=True
    )
    es_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cuerpo: Mapped[str] = mapped_column(Text, nullable=False)
    fecha: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    leido: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
