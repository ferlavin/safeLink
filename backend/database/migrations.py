from sqlalchemy import text

from database.session import engine

_SCHEMA_STATEMENTS = (
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS pais VARCHAR(100)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nivel_experiencia VARCHAR(20)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS alertas_seguridad BOOLEAN DEFAULT FALSE",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS terminos_aceptados_en TIMESTAMP",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tutorial_completado BOOLEAN DEFAULT FALSE",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS modo_simple BOOLEAN DEFAULT FALSE",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS idioma VARCHAR(5) DEFAULT 'es'",
    """
    CREATE TABLE IF NOT EXISTS usage_events (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        evento VARCHAR(50) NOT NULL,
        metadata TEXT,
        fecha TIMESTAMP
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_usage_events_evento ON usage_events (evento)",
    "CREATE INDEX IF NOT EXISTS ix_usage_events_fecha ON usage_events (fecha)",
    "CREATE INDEX IF NOT EXISTS ix_usage_events_usuario_id ON usage_events (usuario_id)",
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
    CREATE TABLE IF NOT EXISTS encuestas (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        activa BOOLEAN NOT NULL DEFAULT FALSE,
        creado_por INTEGER REFERENCES usuarios(id),
        fecha_creacion TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS encuesta_preguntas (
        id SERIAL PRIMARY KEY,
        encuesta_id INTEGER NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
        texto TEXT NOT NULL,
        tipo VARCHAR(20) NOT NULL DEFAULT 'texto',
        opciones TEXT,
        orden INTEGER NOT NULL DEFAULT 0
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS encuesta_respuestas (
        id SERIAL PRIMARY KEY,
        encuesta_id INTEGER NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        respuestas TEXT NOT NULL,
        fecha TIMESTAMP,
        UNIQUE (encuesta_id, usuario_id)
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_encuesta_preguntas_encuesta_id ON encuesta_preguntas (encuesta_id)",
    "CREATE INDEX IF NOT EXISTS ix_encuesta_respuestas_encuesta_id ON encuesta_respuestas (encuesta_id)",
    "CREATE INDEX IF NOT EXISTS ix_encuesta_respuestas_usuario_id ON encuesta_respuestas (usuario_id)",
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
