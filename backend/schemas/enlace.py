from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EnlaceOut(BaseModel):
    id: int
    usuario_id: int | None
    url: str
    estado: str | None
    nivel_riesgo: str | None
    fecha_analisis: datetime | None

    model_config = ConfigDict(from_attributes=True)
