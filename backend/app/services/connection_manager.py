"""
WebSocket 커넥션 레지스트리

단일 프로세스 내의 모든 활성 WebSocket 연결을 관리한다.
user_id(str) → WebSocket 매핑을 유지한다.

멀티 서버 환경:
  각 서버 인스턴스가 자신이 들고 있는 연결만 관리하며,
  Redis Pub/Sub 이벤트를 받으면 해당 user_id가 자신에게 있는지
  확인 후 메시지를 전달한다.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import WebSocket

log = logging.getLogger(__name__)

# user_id(str) → WebSocket
_connections: dict[str, WebSocket] = {}
# room_id → (user_a_id, user_b_id)
_rooms: dict[str, tuple[str, str]] = {}


def register(user_id: str, ws: WebSocket) -> None:
    _connections[user_id] = ws


def unregister(user_id: str) -> None:
    _connections.pop(user_id, None)


def is_connected(user_id: str) -> bool:
    return user_id in _connections


def add_room(room_id: str, a: str, b: str) -> None:
    _rooms[room_id] = (a, b)


def remove_room(room_id: str) -> None:
    _rooms.pop(room_id, None)


def get_room(room_id: str) -> tuple[str, str] | None:
    return _rooms.get(room_id)


async def send(user_id: str, payload: dict[str, Any]) -> bool:
    """user_id의 WebSocket으로 JSON 메시지를 전송한다. 연결이 없으면 False."""
    ws = _connections.get(user_id)
    if not ws:
        return False
    try:
        await ws.send_json(payload)
        return True
    except Exception as exc:
        log.warning("send to %s failed: %s", user_id, exc)
        unregister(user_id)
        return False


async def broadcast_room(room_id: str, payload: dict[str, Any], exclude: str | None = None) -> None:
    """방 안의 모든(또는 exclude 제외) 플레이어에게 메시지를 전송한다."""
    room = get_room(room_id)
    if not room:
        return
    tasks = [
        send(uid, payload)
        for uid in room
        if uid != exclude
    ]
    await asyncio.gather(*tasks)


def find_rooms_for_user(user_id: str) -> list[str]:
    """특정 유저가 참가 중인 room_id 목록을 반환한다."""
    return [rid for rid, (a, b) in _rooms.items() if user_id in (a, b)]
