from pydantic import BaseModel, field_validator

from services.anti_phishing import AntiPhishingWordError, sanitize_anti_phishing_word


class AntiPhishingWordUpdate(BaseModel):
    word: str

    @field_validator("word")
    @classmethod
    def clean_word(cls, value: str) -> str:
        try:
            return sanitize_anti_phishing_word(value)
        except AntiPhishingWordError as exc:
            raise ValueError(str(exc)) from exc


class AntiPhishingWordOut(BaseModel):
    word: str | None = None


class AntiPhishingWordMessage(BaseModel):
    message: str
