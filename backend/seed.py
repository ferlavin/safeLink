from auth.security import hash_password
from config import settings
from database.session import SessionLocal
from models.user import User, UserRole


def seed_admin() -> None:
    """Crea el usuario administrador inicial si todavia no existe."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if existing:
            return
        admin = User(
            email=settings.ADMIN_EMAIL,
            full_name="Administrador",
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            role=UserRole.admin,
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()
