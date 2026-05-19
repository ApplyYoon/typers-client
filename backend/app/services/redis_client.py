"""
Redis 클라이언트 싱글턴

한 프로세스 내에서 단일 연결 풀을 공유한다.
FastAPI lifespan 이벤트에서 open/close를 호출해 수명을 관리한다.
"""
from __future__ import annotations

import redis.asyncio as aioredis
from app.core.config import settings

# 프로세스당 하나의 연결 풀
_redis: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    """현재 Redis 인스턴스를 반환한다. lifespan에서 open 후 사용."""
    if _redis is None:
        raise RuntimeError("Redis not initialized. Call open_redis() first.")
    return _redis


async def open_redis() -> None:
    """애플리케이션 시작 시 호출. 연결 풀을 생성하고 ping으로 연결을 검증한다."""
    global _redis
    _redis = aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        max_connections=20,
    )
    await _redis.ping()


async def close_redis() -> None:
    """애플리케이션 종료 시 호출. 연결 풀을 정리한다."""
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None
