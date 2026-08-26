from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_JWT = frozenset({"", "change-me-in-production", "dev-only-not-for-production"})
_INSECURE_ADMIN_PASSWORDS = frozenset({"", "admin1234"})
_DEV_ENVS = frozenset({"development", "dev", "local"})
_LOCAL_ORIGINS = (
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
)


class Settings(BaseSettings):
    ENV: str = "development"

    # Default alineado a docker-compose (solo local). En prod, DATABASE_URL propio.
    DATABASE_URL: str = (
        "postgresql+psycopg2://safelink:safelink@localhost:5432/safelink"
    )

    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    FRONTEND_ORIGIN: str = "http://localhost:5173"

    ADMIN_EMAIL: str = "admin@safelink.app"
    ADMIN_PASSWORD: str = "admin1234"

    CHROME_EXTENSION_ID: str = ""

    GOOGLE_SAFE_BROWSING_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="after")
    def reject_insecure_defaults_in_production(self):
        env = (self.ENV or "development").strip().lower()
        if env in _DEV_ENVS:
            return self
        if self.JWT_SECRET.strip() in _INSECURE_JWT:
            raise ValueError(
                "JWT_SECRET debe definirse con un valor propio; "
                "el default no se permite fuera de development"
            )
        if self.ADMIN_PASSWORD.strip() in _INSECURE_ADMIN_PASSWORDS:
            raise ValueError(
                "ADMIN_PASSWORD no puede ser el default fuera de development"
            )
        return self

    @property
    def database_url(self) -> str:
        url = self.DATABASE_URL.strip()
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url

    @property
    def cors_origins(self) -> list[str]:
        origins: list[str] = []
        seen: set[str] = set()

        def add(origin: str) -> None:
            cleaned = origin.strip().rstrip("/")
            if cleaned and cleaned not in seen:
                seen.add(cleaned)
                origins.append(cleaned)

        for origin in self.FRONTEND_ORIGIN.split(","):
            add(origin)
        for origin in _LOCAL_ORIGINS:
            add(origin)
        # Origen de la extension (popup y service worker). Sin wildcard:
        # hay que listar el ID de chrome://extensions (varios, separados por coma).
        for raw in self.CHROME_EXTENSION_ID.split(","):
            ext_id = raw.strip()
            if ext_id:
                add(f"chrome-extension://{ext_id}")
        return origins


settings = Settings()
