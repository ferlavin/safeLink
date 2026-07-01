from sqlalchemy import text

from database.session import engine

_SCHEMA_STATEMENTS = (
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS pais VARCHAR(100)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nivel_experiencia VARCHAR(20)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS alertas_seguridad BOOLEAN DEFAULT FALSE",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS terminos_aceptados_en TIMESTAMP",
    """
    CREATE TABLE IF NOT EXISTS reporte_mensajes (
        id SERIAL PRIMARY KEY,
        reporte_id INTEGER NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
        autor_id INTEGER REFERENCES usuarios(id),
        es_admin BOOLEAN NOT NULL DEFAULT FALSE,
        cuerpo TEXT NOT NULL,
        fecha TIMESTAMP,
        leido BOOLEAN NOT NULL DEFAULT FALSE
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_reporte_mensajes_reporte_id ON reporte_mensajes (reporte_id)",
    """
    INSERT INTO reporte_mensajes (reporte_id, autor_id, es_admin, cuerpo, fecha, leido)
    SELECT r.id, r.usuario_id, FALSE, r.motivo, r.fecha_reporte, TRUE
    FROM reportes r
    WHERE r.motivo IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM reporte_mensajes m WHERE m.reporte_id = r.id
      )
    """,
)


def ensure_schema() -> None:
    with engine.begin() as conn:
        for statement in _SCHEMA_STATEMENTS:
            conn.execute(text(statement))
