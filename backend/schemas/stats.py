from pydantic import BaseModel, Field


class TrackEventRequest(BaseModel):
    evento: str = Field(..., min_length=3, max_length=50)


class FeatureStat(BaseModel):
    evento: str
    label: str
    count: int


class DailyStat(BaseModel):
    date: str
    count: int


class StatsOverview(BaseModel):
    days: int
    total_events: int
    active_users: int
    new_users: int
    open_reportes: int
    total_reportes: int


class StatsFeaturesResponse(BaseModel):
    days: int
    features: list[FeatureStat]
    daily: list[DailyStat]
