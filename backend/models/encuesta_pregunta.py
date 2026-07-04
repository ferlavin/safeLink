from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class EncuestaPregunta(Base):
    __tablename__ = "encuesta_preguntas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    encuesta_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("encuestas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    texto: Mapped[str] = mapped_column(Text, nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False, default="texto")
    opciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
