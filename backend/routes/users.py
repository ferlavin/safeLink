from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.deps import require_admin
from database.session import get_db
from models.user import User
from schemas.user import AdminUserCreate, UserCreate, UserOut, UserUpdate
from services import user_service

router = APIRouter(
    prefix="/users", tags=["users"], dependencies=[Depends(require_admin)]
)


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return user_service.list_users(db)


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(data: AdminUserCreate, db: Session = Depends(get_db)):
    return user_service.create_admin_user(db, data)


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    return user_service.update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user_service.delete_user(db, user_id)


@router.post("/{user_id}/suspend", response_model=UserOut)
def suspend_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return user_service.suspend_user(db, user_id, admin)


@router.post("/{user_id}/reactivate", response_model=UserOut)
def reactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return user_service.reactivate_user(db, user_id, admin)


@router.post("/{user_id}/ban", response_model=UserOut)
def ban_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return user_service.ban_user(db, user_id, admin)


@router.post("/{user_id}/unban", response_model=UserOut)
def unban_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return user_service.unban_user(db, user_id, admin)
