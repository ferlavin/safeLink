from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReporteCreate(BaseModel):
    enlace_id: int
    motivo: str = Field(..., min_length=3, max_length=1000)


class ReporteUpdate(BaseModel):
    estado: str = Field(..., min_length=3, max_length=30)


class ReporteMensajeCreate(BaseModel):
    cuerpo: str = Field(..., min_length=1, max_length=2000)


class ReporteMensajeOut(BaseModel):
    id: int
    reporte_id: int
    autor_id: int | None
    autor_nombre: str | None = None
    es_admin: bool
    cuerpo: str
    fecha: datetime | None
    leido: bool

    model_config = ConfigDict(from_attributes=True)


class ReporteOut(BaseModel):
    id: int
    usuario_id: int | None
    enlace_id: int | None
    motivo: str | None
    estado: str | None
    fecha_reporte: datetime | None
    enlace_url: str | None = None
    unread_count: int = 0
    ultimo_mensaje: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ReporteDetailOut(ReporteOut):
    mensajes: list[ReporteMensajeOut] = []


class UnreadCountOut(BaseModel):
    count: int
