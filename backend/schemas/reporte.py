from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReporteCreate(BaseModel):
    enlace_id: int
    motivo: str = Field(..., min_length=3, max_length=1000)


class ReporteUpdate(BaseModel):
    estado: str = Field(..., min_length=3, max_length=20)


class ReporteOut(BaseModel):
    id: int
    usuario_id: int | None
    enlace_id: int | None
    motivo: str | None
    estado: str | None
    fecha_reporte: datetime | None

    model_config = ConfigDict(from_attributes=True)
