"""
MMR 계산 서비스

공식: MMR = (RankScore × W1) + (AvgCPM / 100 × W2) + (PeakAvgCPM / 100 × W3)
  W1 = 0.5  —  승패 기반 RankScore (가장 중요)
  W2 = 0.2  —  최근 10경기 평균 CPM (현재 컨디션)
  W3 = 0.3  —  역대 상위 10회 CPM 평균 (최대 잠재력 + 부계 방지)

저장소 분리:
  - RDB  : rank_score (users 테이블)
  - Redis Sorted Set : peak_cpms:{user_id}  → ZADD score=cpm, member=timestamp
  - Redis Hash       : mmr:{user_id}         → 캐시된 최종 MMR 값

K-Factor (랭크 포인트 증감):
  - 승: +25, 패: -20  (의도적으로 비대칭 — 성장 유도)
  - 배치고사(처음 10판): K×2
"""
from __future__ import annotations

import time
import uuid
from typing import TYPE_CHECKING

from app.services.redis_client import get_redis

if TYPE_CHECKING:
    from redis.asyncio import Redis

# ── 가중치 ──────────────────────────────────────────────────────────
W1, W2, W3 = 0.5, 0.2, 0.3
WIN_DELTA   = 25   # 승리 시 rank_score 증가
LOSE_DELTA  = -20  # 패배 시 rank_score 감소
PEAK_SET_SIZE = 10  # Redis Sorted Set에 유지할 최대 Peak 수
RECENT_AVG_COUNT = 10  # AvgCPM 계산에 사용할 최근 경기 수


# ── MMR 계산 ─────────────────────────────────────────────────────────

def compute_mmr(rank_score: int, avg_cpm: float, peak_avg_cpm: float) -> float:
    """세 요소를 가중합산해 MMR을 반환한다."""
    return (rank_score * W1) + (avg_cpm / 100 * W2) + (peak_avg_cpm / 100 * W3)


# ── Redis 조작 ──────────────────────────────────────────────────────

REDIS_MMR_KEY      = "mmr:{uid}"
REDIS_PEAK_KEY     = "peak_cpms:{uid}"
REDIS_RECENT_KEY   = "recent_cpms:{uid}"   # List — LPUSH + LTRIM 으로 최신 10개 유지


async def get_cached_mmr(user_id: uuid.UUID) -> float:
    """Redis에 캐시된 MMR 값을 반환한다. 없으면 기본값 500.0."""
    r: Redis = get_redis()
    val = await r.hget("mmr_cache", str(user_id))
    return float(val) if val else 500.0


async def refresh_mmr_cache(
    user_id: uuid.UUID,
    rank_score: int,
) -> float:
    """
    Redis에서 AvgCPM, PeakAvgCPM을 읽어 MMR을 재계산하고 캐시를 갱신한다.
    갱신된 MMR 값을 반환한다.
    """
    r: Redis = get_redis()
    uid = str(user_id)

    # 최근 10경기 CPM 평균
    recent_raw = await r.lrange(f"recent_cpms:{uid}", 0, RECENT_AVG_COUNT - 1)
    avg_cpm = sum(float(v) for v in recent_raw) / len(recent_raw) if recent_raw else 0.0

    # 상위 10 Peak CPM 평균 — Sorted Set에서 최고점 순으로 가져옴
    peak_raw = await r.zrevrange(f"peak_cpms:{uid}", 0, PEAK_SET_SIZE - 1, withscores=True)
    peak_cpms = [score for _, score in peak_raw]
    peak_avg_cpm = sum(peak_cpms) / len(peak_cpms) if peak_cpms else 0.0

    mmr = compute_mmr(rank_score, avg_cpm, peak_avg_cpm)
    await r.hset("mmr_cache", uid, str(round(mmr, 2)))
    return mmr


async def record_battle_cpm(user_id: uuid.UUID, cpm: int) -> None:
    """
    배틀 CPM을 Redis에 기록한다.
    - recent_cpms List 에 LPUSH 후 LTRIM → 최신 10개만 유지
    - peak_cpms Sorted Set 에 ZADD → 크기가 PEAK_SET_SIZE 초과 시 최소값 ZREMRANGEBYRANK
    """
    r: Redis = get_redis()
    uid = str(user_id)

    # 최근 CPM 기록
    await r.lpush(f"recent_cpms:{uid}", cpm)
    await r.ltrim(f"recent_cpms:{uid}", 0, RECENT_AVG_COUNT - 1)

    # Peak CPM 기록: member = 타임스탬프 (동일 CPM 중복 방지)
    member = f"{cpm}:{time.time_ns()}"
    await r.zadd(f"peak_cpms:{uid}", {member: cpm})
    # PEAK_SET_SIZE 초과 시 가장 낮은 것 제거
    size = await r.zcard(f"peak_cpms:{uid}")
    if size > PEAK_SET_SIZE:
        await r.zremrangebyrank(f"peak_cpms:{uid}", 0, size - PEAK_SET_SIZE - 1)


async def apply_match_result(
    winner_id: uuid.UUID,
    loser_id: uuid.UUID,
    winner_rank_score: int,
    loser_rank_score: int,
) -> tuple[int, int]:
    """
    승패에 따라 rank_score 증감을 계산하고 MMR 캐시를 갱신한다.
    (new_winner_score, new_loser_score) 를 반환한다.
    """
    new_winner = max(0, winner_rank_score + WIN_DELTA)
    new_loser  = max(0, loser_rank_score  + LOSE_DELTA)

    await refresh_mmr_cache(winner_id, new_winner)
    await refresh_mmr_cache(loser_id,  new_loser)
    return new_winner, new_loser


# ── 매칭 큐용 유저 MMR 조회 ─────────────────────────────────────────

async def get_user_mmr_for_queue(user_id: uuid.UUID, rank_score: int) -> float:
    """
    매칭 큐에 넣을 MMR 값을 반환한다.
    캐시가 있으면 사용, 없으면 rank_score만으로 임시 계산.
    """
    cached = await get_cached_mmr(user_id)
    # 캐시 기본값(500)이면 rank_score 기반으로 estimate
    if cached == 500.0:
        return compute_mmr(rank_score, 0.0, 0.0)
    return cached
