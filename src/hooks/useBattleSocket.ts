/**
 * useBattleSocket — 실시간 배틀 WebSocket 훅
 *
 * 역할:
 *  - WebSocket 연결 수명 관리 (연결 → 재연결 → 해제)
 *  - 5초마다 heartbeat 전송 (서버 쪽 user:status TTL 갱신)
 *  - 수신 메시지를 onMessage 콜백으로 전달
 *  - send() 함수 노출 — 컴포넌트에서 서버로 메시지 전송
 *
 * 설계 결정:
 *  - WebSocket URL은 현재 호스트 기반으로 자동 결정 (ws/wss)
 *  - 연결 끊김 시 3초 후 자동 재연결 (최대 5회)
 *  - cleanup: unmount 시 WebSocket.close(1000) 정상 종료
 */
import { useEffect, useRef, useCallback } from 'react';
import type { ClientMessage, ServerMessage } from '../api/battle';

const WS_URL = (() => {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host  = window.location.host;
  return `${proto}://${host}/api/ws/battle`;
})();

const HEARTBEAT_INTERVAL = 5_000;   // ms
const MAX_RETRIES        = 5;
const RETRY_DELAY        = 3_000;   // ms

interface Options {
  onMessage: (msg: ServerMessage) => void;
  enabled?: boolean;   // false이면 연결하지 않음
}

export function useBattleSocket({ onMessage, enabled = true }: Options) {
  const wsRef       = useRef<WebSocket | null>(null);
  const retriesRef  = useRef(0);
  const mountedRef  = useRef(true);
  const hbTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current || !enabled) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;

      // 5초마다 heartbeat 전송
      if (hbTimerRef.current) clearInterval(hbTimerRef.current);
      hbTimerRef.current = setInterval(() => {
        send({ type: 'heartbeat' });
      }, HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as ServerMessage;
        onMessage(msg);
      } catch {
        // 파싱 실패 무시
      }
    };

    ws.onclose = (ev) => {
      if (hbTimerRef.current) clearInterval(hbTimerRef.current);
      // 정상 종료(code 1000, 4001 인증 실패)는 재연결 안 함
      if (!mountedRef.current || ev.code === 1000 || ev.code === 4001) return;

      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        setTimeout(connect, RETRY_DELAY);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [enabled, onMessage, send]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) connect();

    return () => {
      mountedRef.current = false;
      if (hbTimerRef.current) clearInterval(hbTimerRef.current);
      wsRef.current?.close(1000);
    };
  }, [enabled, connect]);

  return { send };
}
