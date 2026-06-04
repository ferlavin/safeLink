from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class UrlAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=4, max_length=2048)


class PageAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=4, max_length=2048)


class DomainAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048)


class ThreatMapPoint(BaseModel):
    lat: float
    lon: float
    country: str | None = None
    level: str
    weight: int = 1
    urls: list[str] = []
    ultimo_evento: str | None = None


class ThreatMapResponse(BaseModel):
    points: list[ThreatMapPoint]
    total_puntos: int
    amenazas_activas: int = 0
    ventana_horas: int = 24
    actualizado: str | None = None
    en_vivo: bool = True
    resumen_niveles: dict[str, int]
    total_analisis: int


class UrlAnalysisResult(BaseModel):
    id: int | None = None
    url: str
    puntuacion_riesgo: int
    nivel_riesgo: str
    explicacion: str | None = None
    detalle: dict[str, Any] | None = None
    fecha_analisis: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class UrlCheckResponse(BaseModel):
    """Respuesta ligera para la extension de Chrome."""

    url: str
    puntuacion_riesgo: int
    nivel_riesgo: str
    estado: str  # seguro | precaucion | peligro
    resumen: list[str]
    detalle: dict[str, Any] | None = None
    guardado_en_historial: bool = False


class UrlAnalysisHistoryItem(BaseModel):
    id: int
    url_analizada: str
    nivel_riesgo: str
    puntuacion_riesgo: int | None
    fecha_analisis: datetime | None

    model_config = ConfigDict(from_attributes=True)


class HistoryByRiskResponse(BaseModel):
    """Historial de URLs agrupado por nivel de riesgo (extension / app)."""

    bajo: list[UrlAnalysisHistoryItem]
    medio: list[UrlAnalysisHistoryItem]
    alto: list[UrlAnalysisHistoryItem]
