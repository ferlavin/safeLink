from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from database.session import get_db
from models.user import User
from schemas.anti_phishing import (
    AntiPhishingWordMessage,
    AntiPhishingWordOut,
    AntiPhishingWordUpdate,
)
from services.anti_phishing import _OK_MESSAGE
from services import user_service

router = APIRouter(prefix="/users/me", tags=["account"])


@router.get("/anti-phishing-word", response_model=AntiPhishingWordOut)
def get_anti_phishing_word(current_user: User = Depends(get_current_user)):
    return AntiPhishingWordOut(word=current_user.anti_phishing_word)


@router.put(
    "/anti-phishing-word",
    response_model=AntiPhishingWordMessage,
    status_code=status.HTTP_200_OK,
)
def put_anti_phishing_word(
    data: AntiPhishingWordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service.set_anti_phishing_word(db, current_user, data.word)
    return AntiPhishingWordMessage(message=_OK_MESSAGE)
