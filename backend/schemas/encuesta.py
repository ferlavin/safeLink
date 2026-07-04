from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PreguntaCreate(BaseModel):
    texto: str = Field(..., min_length=3, max_length=500)
    tipo: Literal["texto", "opcion_multiple"] = "texto"
    opciones: list[str] | None = None

    @field_validator("opciones")
    @classmethod
    def validate_opciones(cls, value, info):
        tipo = info.data.get("tipo")
        if tipo == "opcion_multiple":
            if not value or len(value) < 2:
                raise ValueError("Se requieren al menos 2 opciones")
            cleaned = [o.strip() for o in value if o and o.strip()]
            if len(cleaned) < 2:
                raise ValueError("Se requieren al menos 2 opciones validas")
            return cleaned
        return None


class PreguntaOut(BaseModel):
    id: int
    texto: str
    tipo: str
    opciones: list[str] | None = None
    orden: int

    model_config = ConfigDict(from_attributes=True)


class EncuestaCreate(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=200)
    activa: bool = False
    preguntas: list[PreguntaCreate] = Field(..., min_length=1, max_length=20)


class EncuestaUpdate(BaseModel):
    titulo: str | None = Field(None, min_length=3, max_length=200)
    activa: bool | None = None
    preguntas: list[PreguntaCreate] | None = Field(None, min_length=1, max_length=20)


class EncuestaOut(BaseModel):
    id: int
    titulo: str
    activa: bool
    creado_por: int | None
    fecha_creacion: datetime | None
    preguntas_count: int = 0
    respuestas_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class EncuestaDetailOut(EncuestaOut):
    preguntas: list[PreguntaOut] = []


class EncuestaActivaOut(BaseModel):
    id: int
    titulo: str
    fecha_creacion: datetime | None
    preguntas_count: int
    ya_respondida: bool


class RespuestaItem(BaseModel):
    pregunta_id: int
    valor: str = Field(..., min_length=1, max_length=2000)


class RespuestaSubmit(BaseModel):
    respuestas: list[RespuestaItem] = Field(..., min_length=1)


class RespuestaOut(BaseModel):
    id: int
    encuesta_id: int
    usuario_id: int
    respuestas: list[RespuestaItem]
    fecha: datetime | None

    model_config = ConfigDict(from_attributes=True)


class OpcionStat(BaseModel):
    opcion: str
    count: int
    percent: float


class PreguntaStat(BaseModel):
    pregunta_id: int
    texto: str
    tipo: str
    total_respuestas: int
    opciones: list[OpcionStat] | None = None
    muestras_texto: list[str] | None = None


class EncuestaStatsSummaryItem(BaseModel):
    id: int
    titulo: str
    activa: bool
    preguntas_count: int
    respuestas_count: int
    respuestas_periodo: int


class EncuestasStatsSummary(BaseModel):
    days: int
    total_encuestas: int
    encuestas_activas: int
    total_respuestas: int
    respuestas_periodo: int
    encuestas: list[EncuestaStatsSummaryItem]


class EncuestaStatsDetail(BaseModel):
    id: int
    titulo: str
    activa: bool
    days: int
    respuestas_count: int
    preguntas: list[PreguntaStat]
