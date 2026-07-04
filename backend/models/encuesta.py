from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class Encuesta(Base):
    __tablename__ = "encuestas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    activa: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    creado_por: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=True
    )
    fecha_creacion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
