import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mode: Mapped[str] = mapped_column(String(32))   # consonant | vowel | left | right | word | short | long
    lang: Mapped[str] = mapped_column(String(8))    # ko | en
    cpm: Mapped[int] = mapped_column(Integer)
    accuracy: Mapped[int] = mapped_column(Integer)  # 0–100
    duration: Mapped[int] = mapped_column(Integer)  # seconds
    sentences: Mapped[int] = mapped_column(Integer, default=0)
    # 자모별 오타 횟수: {"ㄹ": 5, "ㅘ": 3}
    error_log: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    user: Mapped["User"] = relationship(back_populates="sessions")  # noqa: F821
