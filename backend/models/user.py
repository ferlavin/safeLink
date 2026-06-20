import enum
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    usuario = "usuario"


class ExperienceLevel(str, enum.Enum):
    principiante = "principiante"
    intermedio = "intermedio"
    avanzado = "avanzado"


class User(Base):
    """Mapeo a la tabla existente `usuarios` en PostgreSQL."""

    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column("nombre", String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column("password_hash", String(255), nullable=False)
    role: Mapped[str] = mapped_column("rol", String(20), nullable=False)
    is_active: Mapped[bool | None] = mapped_column("activo", Boolean, default=True)
    created_at: Mapped[datetime | None] = mapped_column(
        "fecha_registro", DateTime, nullable=True
    )
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_banned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    country: Mapped[str | None] = mapped_column("pais", String(100), nullable=True)
    birth_date: Mapped[date | None] = mapped_column("fecha_nacimiento", Date, nullable=True)
    experience_level: Mapped[str | None] = mapped_column(
        "nivel_experiencia", String(20), nullable=True
    )
    security_alerts: Mapped[bool] = mapped_column(
        "alertas_seguridad", Boolean, default=False, nullable=False
    )
    terms_accepted_at: Mapped[datetime | None] = mapped_column(
        "terminos_aceptados_en", DateTime, nullable=True
    )

    @property
    def is_active_bool(self) -> bool:
        return self.is_active is not False
