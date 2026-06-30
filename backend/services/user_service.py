from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from auth.security import hash_password
from models.user import User, UserRole
from schemas.user import AdminUserCreate, UserCreate, UserUpdate


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
        country=data.country,
        birth_date=data.birth_date,
        experience_level=data.experience_level.value if data.experience_level else None,
        security_alerts=data.security_alerts,
        terms_accepted_at=now if data.accept_terms else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_admin_user(db: Session, data: AdminUserCreate) -> User:
    if get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya esta registrado",
        )
    now = datetime.now(timezone.utc)
    user = User(
        email=data.email,
        full_name=data.full_name.strip(),
        hashed_password=hash_password(data.password),
        role=data.role.value,
        is_active=True,
        created_at=now,
        is_banned=False,
        security_alerts=False,
        terms_accepted_at=now,
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
    if data.country is not None:
        user.country = data.country
    if data.birth_date is not None:
        user.birth_date = data.birth_date
    if data.experience_level is not None:
        user.experience_level = data.experience_level.value
    if data.security_alerts is not None:
        user.security_alerts = data.security_alerts
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


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    return user


def _ensure_moderatable(target: User, actor: User) -> None:
    if target.id == actor.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No podes moderar tu propia cuenta",
        )
    if target.role == UserRole.admin.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No podes moderar a otro administrador",
        )


def suspend_user(db: Session, user_id: int, actor: User) -> User:
    user = _get_user_or_404(db, user_id)
    _ensure_moderatable(user, actor)
    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario esta baneado. Quita el ban antes de suspender.",
        )
    if not user.is_active_bool:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya esta suspendido",
        )
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def reactivate_user(db: Session, user_id: int, actor: User) -> User:
    user = _get_user_or_404(db, user_id)
    _ensure_moderatable(user, actor)
    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario esta baneado. Usa quitar ban para restaurar el acceso.",
        )
    if user.is_active_bool:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya esta activo",
        )
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


def ban_user(db: Session, user_id: int, actor: User) -> User:
    user = _get_user_or_404(db, user_id)
    _ensure_moderatable(user, actor)
    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya esta baneado",
        )
    user.is_banned = True
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def unban_user(db: Session, user_id: int, actor: User) -> User:
    user = _get_user_or_404(db, user_id)
    _ensure_moderatable(user, actor)
    if not user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no esta baneado",
        )
    user.is_banned = False
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
