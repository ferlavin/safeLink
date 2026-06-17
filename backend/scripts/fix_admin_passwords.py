"""
Restaura contraseñas bcrypt validas para los 3 admins originales.

Uso desde backend/:
  python scripts/fix_admin_passwords.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from auth.security import hash_password
from database.session import SessionLocal
from models.user import User

PASSWORDS = {
    "fermin@safelink.com": "administrador1234",
    "lucas@safelink.com": "admin1234",
    "mauricio@safelink.com": "admin1234",
}


def main() -> None:
    db = SessionLocal()
    try:
        for email, password in PASSWORDS.items():
            user = db.query(User).filter(User.email == email).first()
            if not user:
                print(f"SKIP: {email} no encontrado")
                continue
            user.hashed_password = hash_password(password)
            print(f"OK: {email}")
        db.commit()
        print("\nListo. Contraseñas restauradas:")
        for email, password in PASSWORDS.items():
            print(f"  {email} -> {password}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
