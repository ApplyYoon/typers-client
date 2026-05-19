"""
배틀 WebSocket 메시지 스키마

클라이언트 → 서버 (C→S):
  join_queue        : 매칭 큐 진입
  leave_queue       : 큐 이탈
  heartbeat         : 5초마다 생존 신호
  typing_progress   : 타이핑 진행도 업데이트 (배틀 중)
  finish            : 텍스트 완료 선언

서버 → 클라이언트 (S→C):
  queued            : 큐 진입 완료
  queue_position    : 큐 내 위치 / 예상 대기시간
  matched           : 매칭 성사 (상대 정보 포함)
  countdown         : 카운트다운 숫자
  game_start        : 게임 시작 (공유 텍스트 전달)
  opponent_progress : 상대방 진행도
  game_end          : 게임 종료 결과
  opponent_left     : 상대방 연결 끊김
  error             : 에러 메시지
"""
from __future__ import annotations
from pydantic import BaseModel


# ── 공용 ──────────────────────────────────────────────────────────────

class OpponentInfo(BaseModel):
    user_id:  str
    username: str
    mmr:      float
    level:    int


class GameResult(BaseModel):
    room_id:       str
    winner_id:     str | None      # None = 무승부
    your_cpm:      int
    opp_cpm:       int
    your_accuracy: int
    opp_accuracy:  int
    mmr_delta:     int             # 내 MMR 변화량 (+/-)
    new_rank_score: int


# ── C→S 메시지 ────────────────────────────────────────────────────────

class JoinQueueMsg(BaseModel):
    type: str = "join_queue"
    mode: str = "quick"           # "quick" | "custom"
    room_code: str | None = None  # custom 전용


class HeartbeatMsg(BaseModel):
    type: str = "heartbeat"


class TypingProgressMsg(BaseModel):
    type:          str = "typing_progress"
    room_id:       str
    correct_chars: int
    cpm:           int
    accuracy:      int


class FinishMsg(BaseModel):
    type:     str = "finish"
    room_id:  str
    cpm:      int
    accuracy: int


class LeaveQueueMsg(BaseModel):
    type: str = "leave_queue"
