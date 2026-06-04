from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class AnalisisUrl(Base):
    __tablename__ = "analisis_urls"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id"), nullable=False)
    url_analizada: Mapped[str] = mapped_column(Text, nullable=False)
    nivel_riesgo: Mapped[str] = mapped_column(String(20), nullable=False)
    explicacion: Mapped[str | None] = mapped_column(Text, nullable=True)
    fecha_analisis: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    puntuacion_riesgo: Mapped[int | None] = mapped_column(Integer, nullable=True)
