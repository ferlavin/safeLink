from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HistorialLoginOut(BaseModel):
    id: int
    usuario_id: int | None
    fecha: datetime | None
    ip: str | None
    dispositivo: str | None

    model_config = ConfigDict(from_attributes=True)
