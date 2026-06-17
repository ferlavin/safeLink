from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class Escaneo(Base):
    __tablename__ = "escaneos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    usuario_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=True
    )
    enlace_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("enlaces.id"), nullable=True
    )
    resultado: Mapped[str | None] = mapped_column(String(20), nullable=True)
    porcentaje_riesgo: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fecha: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
