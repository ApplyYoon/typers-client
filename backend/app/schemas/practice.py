from datetime import datetime
from pydantic import BaseModel


class SessionCreate(BaseModel):
    mode: str
    lang: str
    cpm: int
    accuracy: int
    duration: int
    sentences: int = 0
    error_log: dict[str, int] = {}


class SessionResponse(BaseModel):
    id: str
    mode: str
    lang: str
    cpm: int
    accuracy: int
    duration: int
    sentences: int
    error_log: dict[str, int]
    created_at: datetime

    model_config = {"from_attributes": True}


class DailyStats(BaseModel):
    date: str   # 'YYYY-MM-DD'
    avg_cpm: float
    avg_accuracy: float
    session_count: int


class StatsResponse(BaseModel):
    daily: list[DailyStats]
    best_cpm: int
    total_sessions: int


class RankEntry(BaseModel):
    rank: int
    username: str
    best_cpm: int
    session_count: int
