"""
BattleMatch — 완료된 배틀 결과 영구 저장

두 플레이어의 CPM/정확도와 MMR 변동량을 기록한다.
winner_id가 None이면 무승부(양쪽 CPM 동일하거나 중도 이탈).
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class BattleMatch(Base):
    __tablename__ = "battle_matches"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    player_a_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    player_b_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    winner_id:   Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    player_a_cpm:      Mapped[int]   = mapped_column(Integer,  default=0)
    player_b_cpm:      Mapped[int]   = mapped_column(Integer,  default=0)
    player_a_accuracy: Mapped[int]   = mapped_column(Integer,  default=0)
    player_b_accuracy: Mapped[int]   = mapped_column(Integer,  default=0)

    # MMR 변동 (양수 = 상승, 음수 = 하락) — 승자 기준
    mmr_delta: Mapped[int] = mapped_column(Integer, default=0)

    # 배틀 모드 ('quick' | 'custom')
    mode: Mapped[str] = mapped_column(String(16), default="quick")

    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
