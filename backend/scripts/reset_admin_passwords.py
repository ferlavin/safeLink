"""
Asigna contraseña real (bcrypt) a usuarios admin cuyo password_hash sea invalido
(p. ej. placeholder 'HASH').

Uso desde backend/:
  python scripts/reset_admin_passwords.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from auth.security import hash_password
from config import settings
from database.session import SessionLocal
from models.user import User


def main() -> None:
    password = settings.ADMIN_PASSWORD
    db = SessionLocal()
    try:
        admins = db.query(User).filter(User.role == "admin").all()
        if not admins:
            print("No hay usuarios admin.")
            return
        for user in admins:
            user.hashed_password = hash_password(password)
            print(f"OK: {user.email}")
        db.commit()
        print(f"\nListo. {len(admins)} admin(s) actualizados.")
        print(f"Contrasena temporal (desde ADMIN_PASSWORD en .env): {password}")
        print("Cambiala en produccion.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
