from pydantic import BaseModel, Field


class UserPreferencesOut(BaseModel):
    tutorial_completado: bool = False
    modo_simple: bool = False
    idioma: str = "es"


class UserPreferencesUpdate(BaseModel):
    tutorial_completado: bool | None = None
    modo_simple: bool | None = None
    idioma: str | None = Field(default=None, pattern="^(es|en)$")
