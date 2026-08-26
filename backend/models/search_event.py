from datetime import datetime

from sqlalchemy import DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class SearchEvent(Base):
    """Tabla legacy. Ya no se escribe en análisis nuevos.

    Existía para geolocalizar la IP de quien escaneó en un mapa público.
    El mapa de la comunidad no usa estas IPs. Se conserva el modelo para
    anonimizar filas viejas al borrar una cuenta. No agregar writes nuevos.
    """
    __tablename__ = "search_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    email: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    level: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ip: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
