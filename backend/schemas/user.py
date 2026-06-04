from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.usuario


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserOut(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("role", mode="before")
    @classmethod
    def coerce_role(cls, v):
        if isinstance(v, str):
            return UserRole(v)
        return v

    @field_validator("is_active", mode="before")
    @classmethod
    def coerce_active(cls, v):
        if v is None:
            return True
        return bool(v)
