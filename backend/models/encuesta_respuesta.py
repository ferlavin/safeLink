from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class EncuestaRespuesta(Base):
    __tablename__ = "encuesta_respuestas"
    __table_args__ = (
        UniqueConstraint("encuesta_id", "usuario_id", name="uq_encuesta_respuesta_usuario"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    encuesta_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("encuestas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    respuestas: Mapped[str] = mapped_column(Text, nullable=False)
    fecha: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
