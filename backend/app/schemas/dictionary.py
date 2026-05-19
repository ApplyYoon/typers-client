import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class DictionaryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    words: list[str] = Field(max_length=500)  # 최대 500단어


class DictionaryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=64)
    words: list[str] | None = Field(default=None, max_length=500)


class DictionaryResponse(BaseModel):
    id: uuid.UUID
    name: str
    words: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
