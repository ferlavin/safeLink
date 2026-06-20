from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from models.user import ExperienceLevel, UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    confirm_password: str
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    birth_date: date
    country: str = Field(min_length=2, max_length=100)
    experience_level: ExperienceLevel | None = None
    accept_terms: bool
    security_alerts: bool = False
    role: UserRole = UserRole.usuario

    @model_validator(mode="after")
    def validate_registration(self):
        if self.password != self.confirm_password:
            raise ValueError("Las contrasenas no coinciden")
        if not self.accept_terms:
            raise ValueError("Debes aceptar los terminos y la politica de privacidad")
        today = date.today()
        age = (
            today.year
            - self.birth_date.year
            - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        )
        if age < 13:
            raise ValueError("Debes tener al menos 13 anos para registrarte")
        if self.birth_date > today:
            raise ValueError("La fecha de nacimiento no puede ser futura")
        return self

    @property
    def full_name(self) -> str:
        return f"{self.first_name.strip()} {self.last_name.strip()}".strip()


class AdminUserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=6, max_length=128)
    role: UserRole = UserRole.usuario


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None
    country: str | None = None
    birth_date: date | None = None
    experience_level: ExperienceLevel | None = None
    security_alerts: bool | None = None


class UserOut(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime | None = None
    avatar_url: str | None = None
    country: str | None = None
    birth_date: date | None = None
    experience_level: ExperienceLevel | None = None
    security_alerts: bool = False

    model_config = ConfigDict(from_attributes=True)

    @field_validator("role", mode="before")
    @classmethod
    def coerce_role(cls, v):
        if isinstance(v, str):
            return UserRole(v)
        return v

    @field_validator("experience_level", mode="before")
    @classmethod
    def coerce_experience(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            return ExperienceLevel(v)
        return v

    @field_validator("is_active", mode="before")
    @classmethod
    def coerce_active(cls, v):
        if v is None:
            return True
        return bool(v)
