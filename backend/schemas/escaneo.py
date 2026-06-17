from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EscaneoOut(BaseModel):
    id: int
    usuario_id: int | None
    enlace_id: int | None
    resultado: str | None
    porcentaje_riesgo: int | None
    fecha: datetime | None

    model_config = ConfigDict(from_attributes=True)
