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

    GOOGLE_SAFE_BROWSING_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        url = self.DATABASE_URL.strip()
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url

    @property
    def cors_origins(self) -> list[str]:
        origins = []
        for origin in self.FRONTEND_ORIGIN.split(","):
            cleaned = origin.strip().rstrip("/")
            if cleaned:
                origins.append(cleaned)
        return origins


settings = Settings()
