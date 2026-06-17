from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class Enlace(Base):
    __tablename__ = "enlaces"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    usuario_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=True
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)
    estado: Mapped[str | None] = mapped_column(String(20), default="Pendiente")
    nivel_riesgo: Mapped[str | None] = mapped_column(String(20), nullable=True)
    fecha_analisis: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
