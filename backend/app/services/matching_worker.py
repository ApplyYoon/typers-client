"""
배틀 매칭 워커 — Active / Standby 패턴

┌─────────────────────────────────────────────────────────────────────┐
│  리더 선출 (Leader Election)                                         │
│  SET leader_lock {worker_id} NX PX 5000  (주기적 경쟁)              │
│  Standby는 __keyevent@0__:expired 이벤트로 leader_lock 만료를 감지  │
│  → 즉시 SET NX 재시도 → Active 승격                                 │
└─────────────────────────────────────────────────────────────────────┘

매칭 로직 (1초 Tick):
  1. ZRANGE matching_queue 0 -1 WITHSCORES  → (user_id, mmr_score) 목록
  2. 인접한 쌍에서 두 유저 모두 EXISTS user:status:{id}  (TTL 생존 확인)
  3. 둘 다 생존 + MMR 윈도우 내 → ZREM + PUBLISH match_result

유저 생존 확인 (Heartbeat):
  클라이언트가 5초마다 heartbeat를 보내면 서버가
  EXPIRE user:status:{id} 10  으로 TTL을 연장한다.
  10초 내 heartbeat가 없으면 key가 만료 → 큐에서 제거됨.

가변 매칭 윈도우 (Aging):
  대기시간 0~5s  → MMR ±50
  대기시간 5~15s → MMR ±200
  대기시간 15s+  → MMR ±1000 (사실상 무제한)
"""
from __future__ import annotations

import asyncio
import json
import logging
import random
import time
import uuid

import redis.asyncio as aioredis

from app.services.redis_client import get_redis

log = logging.getLogger(__name__)

LEADER_LOCK_KEY  = "leader_lock"
LEADER_LOCK_PX   = 5_000          # 5초 TTL
LEADER_RENEW_S   = 3              # 3초마다 갱신 시도
MATCH_TICK_S     = 1              # 매칭 틱 간격
MATCH_QUEUE_KEY  = "matching_queue"

WORKER_ID = str(uuid.uuid4())     # 이 프로세스의 고유 워커 ID

_running = False                   # 워커 루프 플래그


# ── 가변 매칭 윈도우 ────────────────────────────────────────────────

def _mmr_window(wait_sec: float) -> float:
    if wait_sec < 5:
        return 50.0
    if wait_sec < 15:
        return 200.0
    return 1000.0


# ── 매칭 Tick ───────────────────────────────────────────────────────

async def _matching_tick(r: aioredis.Redis) -> None:
    """
    매칭 큐를 순회해 가능한 쌍을 매칭시킨다.
    단일 패스(O(n²) worst-case)이며, 큐 크기가 수백 이하인 환경에서 적절하다.
    """
    # MMR 오름차순으로 모든 대기 유저 조회
    entries: list[tuple[str, float]] = await r.zrange(
        MATCH_QUEUE_KEY, 0, -1, withscores=True
    )
    if len(entries) < 2:
        return

    now = time.time()
    matched: set[str] = set()

    for i in range(len(entries)):
        uid_a, mmr_a = entries[i]
        if uid_a in matched:
            continue

        # 유저 A 생존 확인
        if not await r.exists(f"user:status:{uid_a}"):
            log.debug("remove ghost from queue: %s", uid_a)
            await r.zrem(MATCH_QUEUE_KEY, uid_a)
            continue

        # 유저 A 대기 시간
        joined_a = await r.get(f"user:joined:{uid_a}")
        wait_a = now - float(joined_a) if joined_a else 0.0
        window = _mmr_window(wait_a)

        for j in range(i + 1, len(entries)):
            uid_b, mmr_b = entries[j]
            if uid_b in matched:
                continue

            # MMR 윈도우 초과 시 더 이상 찾을 필요 없음 (정렬된 리스트)
            if (mmr_b - mmr_a) > window:
                break

            # 유저 B 생존 확인
            if not await r.exists(f"user:status:{uid_b}"):
                log.debug("remove ghost from queue: %s", uid_b)
                await r.zrem(MATCH_QUEUE_KEY, uid_b)
                continue

            # 매칭 성사!
            room_id = str(uuid.uuid4())
            await r.zrem(MATCH_QUEUE_KEY, uid_a, uid_b)

            payload = json.dumps({"a": uid_a, "b": uid_b, "room_id": room_id})
            await r.publish("match_result", payload)
            log.info("matched %s ↔ %s  room=%s  mmr_diff=%.1f",
                     uid_a, uid_b, room_id[:8], abs(mmr_a - mmr_b))

            matched.add(uid_a)
            matched.add(uid_b)
            break


# ── 리더 (Active Worker) 루프 ────────────────────────────────────────

async def _leader_loop() -> None:
    r = get_redis()
    log.info("[worker] became ACTIVE (id=%s)", WORKER_ID[:8])
    try:
        while _running:
            # 매칭 수행
            try:
                await _matching_tick(r)
            except Exception as exc:
                log.error("[worker] tick error: %s", exc)

            # 리더 락 갱신 (SET XX PX — 자신이 이미 보유한 경우만)
            renewed = await r.set(
                LEADER_LOCK_KEY, WORKER_ID,
                px=LEADER_LOCK_PX, xx=True
            )
            if not renewed:
                # 락을 잃었다면 Standby로 강등
                log.warning("[worker] lost leader lock, stepping down")
                break

            await asyncio.sleep(MATCH_TICK_S)
    finally:
        log.info("[worker] stepping down from ACTIVE")


# ── Standby Worker 루프 ──────────────────────────────────────────────

async def _standby_loop() -> None:
    """
    Keyspace Notification(__keyevent@0__:expired)을 구독해
    leader_lock 만료를 Event-Driven 방식으로 감지한다.
    Polling 방식보다 CPU 효율이 높고 반응 속도가 빠르다.
    """
    # Keyspace notification을 위해 별도 연결 사용 (SUBSCRIBE는 전용 연결 필요)
    from app.core.config import settings
    sub_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

    try:
        # Redis keyspace notification 활성화 (만료 이벤트)
        await sub_client.config_set("notify-keyspace-events", "Ex")

        pubsub = sub_client.pubsub()
        await pubsub.subscribe("__keyevent@0__:expired")

        log.info("[worker] STANDBY — listening for leader_lock expiry")

        async for msg in pubsub.listen():
            if not _running:
                break
            if msg["type"] != "message":
                continue
            if msg["data"] != LEADER_LOCK_KEY:
                continue

            # leader_lock 만료 감지 → SET NX 경쟁
            r = get_redis()
            acquired = await r.set(
                LEADER_LOCK_KEY, WORKER_ID,
                px=LEADER_LOCK_PX, nx=True
            )
            if acquired:
                # Active로 승격 → 리더 루프 실행
                await _leader_loop()
                # 루프 종료 후 다시 Standby 대기
                log.info("[worker] back to STANDBY")
    finally:
        await sub_client.aclose()


# ── 진입점 ───────────────────────────────────────────────────────────

async def start_matching_worker() -> None:
    """
    FastAPI lifespan에서 asyncio.create_task()로 호출한다.
    처음에는 leader_lock SET NX를 시도해 Active 또는 Standby로 시작.
    """
    global _running
    _running = True

    r = get_redis()
    acquired = await r.set(LEADER_LOCK_KEY, WORKER_ID, px=LEADER_LOCK_PX, nx=True)

    if acquired:
        # 이 인스턴스가 리더로 시작
        await _leader_loop()
        # 루프 종료 후 Standby로 fallback
    # Standby 모드로 진입 (리더 복구 대기)
    if _running:
        await _standby_loop()


async def stop_matching_worker() -> None:
    global _running
    _running = False


# ── 큐 진입/이탈 헬퍼 ────────────────────────────────────────────────

async def enqueue(user_id: str, mmr: float) -> None:
    r = get_redis()
    pipe = r.pipeline()
    pipe.zadd(MATCH_QUEUE_KEY, {user_id: mmr})
    pipe.setex(f"user:status:{user_id}", 10, "waiting")
    pipe.set(f"user:joined:{user_id}", str(time.time()))
    await pipe.execute()


async def dequeue(user_id: str) -> None:
    r = get_redis()
    pipe = r.pipeline()
    pipe.zrem(MATCH_QUEUE_KEY, user_id)
    pipe.delete(f"user:status:{user_id}")
    pipe.delete(f"user:joined:{user_id}")
    await pipe.execute()


async def heartbeat(user_id: str) -> None:
    """5초마다 클라이언트가 호출 → user:status TTL 10초 연장."""
    r = get_redis()
    await r.expire(f"user:status:{user_id}", 10)
