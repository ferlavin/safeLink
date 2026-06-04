from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from auth.security import hash_password
from models.user import User, UserRole
from schemas.user import UserCreate, UserUpdate


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def list_users(db: Session) -> list[User]:
    return db.query(User).order_by(User.id).all()


def _default_nombre(data: UserCreate) -> str:
    return data.full_name or data.email.split("@")[0]


def create_user(db: Session, data: UserCreate) -> User:
    if get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya esta registrado",
        )
    now = datetime.now(timezone.utc)
    user = User(
        email=data.email,
        full_name=_default_nombre(data),
        hashed_password=hash_password(data.password),
        role=data.role.value,
        is_active=True,
        created_at=now,
        is_banned=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, data: UserUpdate) -> User:
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    if data.email and data.email != user.email:
        if get_user_by_email(db, data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya esta registrado",
            )
        user.email = data.email
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.password:
        user.hashed_password = hash_password(data.password)
    if data.role is not None:
        user.role = data.role.value
    if data.is_active is not None:
        user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> None:
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    db.delete(user)
    db.commit()
