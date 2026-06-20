from sqlalchemy import text

from database.session import engine

_SCHEMA_STATEMENTS = (
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS pais VARCHAR(100)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nivel_experiencia VARCHAR(20)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS alertas_seguridad BOOLEAN DEFAULT FALSE",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS terminos_aceptados_en TIMESTAMP",
)


def ensure_schema() -> None:
    with engine.begin() as conn:
        for statement in _SCHEMA_STATEMENTS:
            conn.execute(text(statement))
