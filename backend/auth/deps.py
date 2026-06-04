from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from sqlalchemy.orm import Session

from auth.security import decode_access_token
from database.session import get_db
from models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
optional_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales invalidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    subject = decode_access_token(token)
    if subject is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == int(subject)).first()
    if user is None or not user.is_active_bool or user.is_banned:
        raise credentials_exception
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    subject = decode_access_token(credentials.credentials)
    if subject is None:
        return None
    user = db.query(User).filter(User.id == int(subject)).first()
    if user is None or not user.is_active_bool or user.is_banned:
        return None
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador",
        )
    return current_user
