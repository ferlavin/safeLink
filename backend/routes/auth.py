from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from auth.security import create_access_token, verify_password
from database.session import get_db
from models.user import User, UserRole
from schemas.auth import LoginRequest, Token
from schemas.historial_login import HistorialLoginOut
from schemas.user import UserCreate, UserOut
from services import historial_login_service, user_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    data.role = UserRole.usuario
    user = user_service.create_user(db, data)
    token = create_access_token(str(user.id))
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrectos",
        )
    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta suspendida"
        )
    if not user.is_active_bool:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta desactivada"
        )
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    try:
        historial_login_service.log_login(db, user.id, request)
    except Exception:
        db.rollback()
    token = create_access_token(str(user.id))
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/login-history", response_model=list[HistorialLoginOut])
def login_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return historial_login_service.list_user_logins(db, current_user.id)
