from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = (
        "postgresql+psycopg2://postgres:TU_PASSWORD@localhost:5432/SafeLink"
    )

    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    FRONTEND_ORIGIN: str = "http://localhost:5173"

    ADMIN_EMAIL: str = "admin@safelink.app"
    ADMIN_PASSWORD: str = "admin1234"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGIN.split(",") if o.strip()]


settings = Settings()
