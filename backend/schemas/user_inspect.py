from datetime import datetime

from pydantic import BaseModel, ConfigDict

from schemas.historial_login import HistorialLoginOut
from schemas.stats import DailyStat, DomainStat, FeatureStat
from schemas.user import UserOut


class UserInspectProfile(UserOut):
    last_login: datetime | None = None
    terms_accepted_at: datetime | None = None


class UserInspectCounts(BaseModel):
    analyses: int
    enlaces: int
    escaneos: int
    reportes: int
    reportes_abiertos: int
    encuestas: int
    logins: int
    eventos_periodo: int
    extension_checks: int


class RiskStat(BaseModel):
    nivel: str
    count: int


class InspectAnalysisItem(BaseModel):
    id: int
    url: str
    nivel_riesgo: str
    puntuacion_riesgo: int | None = None
    fecha_analisis: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class InspectReporteItem(BaseModel):
    id: int
    motivo: str | None = None
    estado: str | None = None
    fecha_reporte: datetime | None = None
    enlace_url: str | None = None


class InspectActivityItem(BaseModel):
    evento: str
    label: str
    fecha: datetime | None = None


class UserInspectResponse(BaseModel):
    days: int
    profile: UserInspectProfile
    counts: UserInspectCounts
    ultima_actividad: datetime | None = None
    herramienta_top: FeatureStat | None = None
    features: list[FeatureStat]
    daily: list[DailyStat]
    riesgos: list[RiskStat]
    dominios: list[DomainStat]
    analisis_recientes: list[InspectAnalysisItem]
    logins_recientes: list[HistorialLoginOut]
    reportes_recientes: list[InspectReporteItem]
    actividad_reciente: list[InspectActivityItem]
