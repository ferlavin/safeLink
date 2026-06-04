import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database.session import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    usuario = "usuario"


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

    @property
    def is_active_bool(self) -> bool:
        return self.is_active is not False
