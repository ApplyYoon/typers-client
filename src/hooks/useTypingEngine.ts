/**
 * useTypingEngine
 *
 * 자모 단위 타이핑 엔진 훅. IME를 우회하고 keydown 이벤트를 직접 가로채
 * 한글/영어 공통으로 동작하는 타이핑 판정 로직을 캡슐화한다.
 *
 * 사용처: 학교대항전, 왼손/오른손 연습, 장문 연습 등
 *
 * 설계 원칙:
 *  - 타이머·페이즈 전환·텍스트 선택 등 '게임 흐름'은 소비자(consumer)가 담당
 *  - 훅은 오직 "현재 text에 대한 자모 진행 + 정확도 누적 + 화면 표시 계산"만 책임
 *  - active=false 이면 keydown 입력을 전부 무시 (카운트다운 / 결과 화면 등)
 *  - onComplete: 한 문장(text)을 끝까지 다 입력했을 때 소비자에게 알림
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  decomposeText,
  composePartialJamos,
  isKoreanJamo,
  KOREAN_KEY_TO_JAMO,
  CODE_TO_QWERTY,
} from '../utils/jamoUtils';

/* ── 타입 ──────────────────────────────────────────────────── */

export interface TypingScore {
  cpm: number;
  accuracy: number;
}

export interface UseTypingEngineReturn {
  /** hidden <input>에 ref를 달아 keydown 캡처 */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** <input onKeyDown={handleKeyDown}> */
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /**
   * text.split('').map((char, i) => getSyllableDisplay(i, char)) 형태로 사용.
   * cls: 'correct' | 'pending' | 'composing' | 'cursor' | 'wrong'
   * char: 화면에 실제 표시할 글자
   */
  getSyllableDisplay: (charIndex: number, targetChar: string) => { cls: string; char: string };
  /** 누적 정답 자모 수 */
  totalCorrect: number;
  /** 누적 입력 자모 수 (오타 포함) */
  totalTyped: number;
  /** 실시간 정확도 0–100 */
  accuracy: number;
  /**
   * 타이핑 애니메이션 프레임 토글(1|2).
   * 캐릭터 스프라이트 교체 등에 활용.
   */
  frame: 1 | 2;
  /**
   * text prop이 바뀌면 자동으로 내부 상태를 리셋하지만,
   * 같은 text로 처음부터 다시 시작하고 싶을 때 수동 호출.
   */
  reset: () => void;
  /**
   * 게임 종료 시 최종 점수 계산.
   * @param startTimeMs Date.now() 기준 게임 시작 시각
   */
  getScore: (startTimeMs: number) => TypingScore;
}

/* ── 훅 본체 ────────────────────────────────────────────────── */

interface Options {
  /** 현재 타이핑 대상 문장 */
  text: string;
  /** false이면 keydown 입력 전부 무시 */
  active: boolean;
  /** 현재 text를 끝까지 입력했을 때 호출 */
  onComplete: () => void;
}

export function useTypingEngine({ text, active, onComplete }: Options): UseTypingEngineReturn {
  // ── 자모 분해 (text가 바뀔 때만 재계산) ────────────────────
  const jamoInfo = useMemo(() => decomposeText(text), [text]);

  // ── 진행 상태 ────────────────────────────────────────────────
  const [jamoPos, setJamoPos]         = useState(0);
  const [hasError, setHasError]       = useState(false);
  const [wrongTyped, setWrongTyped]   = useState('');
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalTyped, setTotalTyped]   = useState(0);
  const [frame, setFrame]             = useState<1 | 2>(1);

  // doFinish / getScore에서 stale closure 없이 최신값 읽기 위한 ref 병렬 추적
  const totalCorrectRef = useRef(0);
  const totalTypedRef   = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // onComplete는 매 렌더마다 바뀔 수 있으므로 ref로 안정화
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // ── text 변경 시 자모 진행 상태 리셋 ────────────────────────
  useEffect(() => {
    setJamoPos(0);
    setHasError(false);
    setWrongTyped('');
  }, [text]);

  // ── 수동 리셋 ────────────────────────────────────────────────
  const reset = useCallback(() => {
    setJamoPos(0);
    setHasError(false);
    setWrongTyped('');
    setTotalCorrect(0);
    setTotalTyped(0);
    totalCorrectRef.current = 0;
    totalTypedRef.current   = 0;
    setFrame(1);
  }, []);

  // ── 최종 점수 계산 ────────────────────────────────────────────
  const getScore = useCallback((startTimeMs: number): TypingScore => {
    const elapsed  = (Date.now() - startTimeMs) / 1000 / 60 || 1 / 60;
    const correct  = totalCorrectRef.current;
    const typed    = totalTypedRef.current;
    const cpm      = Math.round(correct / elapsed);
    const accuracy = typed > 0 ? Math.round((correct / typed) * 100) : 0;
    return { cpm, accuracy };
  }, []);

  // ── keydown 핸들러 ────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!active) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length > 1 && e.key !== 'Backspace') return;

    e.preventDefault();

    // Backspace: 오타 상태만 해제
    if (e.key === 'Backspace') {
      if (hasError) { setHasError(false); setWrongTyped(''); }
      return;
    }

    // 오타 상태에서는 Backspace 외 모든 키 차단
    // (정답 키로 오타 스킵 방지)
    if (hasError) return;

    const { jamoSequence } = jamoInfo;
    const expected = jamoSequence[jamoPos];
    if (expected === undefined) return;

    // 입력된 자모 결정
    let typed: string;
    if (isKoreanJamo(expected)) {
      // 한국어: e.code → QWERTY 기본키 → 두벌식 자모
      const baseKey = CODE_TO_QWERTY[e.code];
      if (!baseKey) return;
      const physKey = e.shiftKey ? baseKey.toUpperCase() : baseKey;
      typed = KOREAN_KEY_TO_JAMO[physKey] ?? '';
      // 매핑 안 된 키(숫자·특수문자 등) → 정확도 오염 방지
      if (!typed) return;
    } else {
      // 영어·공백: e.key 그대로
      typed = e.key;
    }

    // 입력 카운트 (오타 포함)
    setFrame(f => (f === 1 ? 2 : 1));
    totalTypedRef.current += 1;
    setTotalTyped(n => n + 1);

    if (typed === expected) {
      // ── 정답 ────────────────────────────────────────────────
      setHasError(false);
      setWrongTyped('');
      totalCorrectRef.current += 1;
      setTotalCorrect(n => n + 1);

      const nextPos = jamoPos + 1;
      if (nextPos >= jamoSequence.length) {
        // 문장 완료 → 소비자에게 알림 (다음 text로 교체 등)
        onCompleteRef.current();
      } else {
        setJamoPos(nextPos);
      }
    } else {
      // ── 오타 ────────────────────────────────────────────────
      setHasError(true);
      setWrongTyped(typed);
    }
  }, [active, hasError, jamoInfo, jamoPos]);

  // ── 렌더 헬퍼 ────────────────────────────────────────────────
  const getSyllableDisplay = useCallback(
    (i: number, targetChar: string): { cls: string; char: string } => {
      const range = jamoInfo.syllableRanges[i];

      // 완료된 음절
      if (jamoPos >= range.end) return { cls: 'correct', char: targetChar };

      // 아직 안 온 음절
      if (jamoPos < range.start) return { cls: 'pending', char: targetChar };

      // 현재 진행 중인 음절
      if (hasError) {
        // 띄어쓰기 위치 오타: 입력한 글자 표시 금지
        if (targetChar === ' ') return { cls: 'wrong', char: ' ' };

        if (jamoPos > range.start) {
          // 일부 자모를 맞게 친 후 오타
          // ex) ㅁ+ㅜ → '무',  ㅁ+ㄴ → 합성 불가 → wrongTyped 단독 표시
          const correctJamos = jamoInfo.jamoSequence.slice(range.start, jamoPos);
          const before       = composePartialJamos(correctJamos);
          const composed     = composePartialJamos([...correctJamos, wrongTyped]);
          return { cls: 'wrong', char: composed !== before ? composed : wrongTyped };
        }
        // 첫 자모부터 오타
        return { cls: 'wrong', char: wrongTyped || targetChar };
      }

      if (jamoPos === range.start) {
        // 이 음절의 첫 자모를 아직 안 쳤음 → 커서 위치
        return { cls: 'cursor', char: targetChar };
      }

      // 일부 자모를 올바르게 쳤음 → 부분 음절 합성해서 표시
      const typedJamos = jamoInfo.jamoSequence.slice(range.start, jamoPos);
      return { cls: 'composing', char: composePartialJamos(typedJamos) };
    },
    [jamoInfo, jamoPos, hasError, wrongTyped],
  );

  // ── 실시간 정확도 ────────────────────────────────────────────
  const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;

  return {
    inputRef,
    handleKeyDown,
    getSyllableDisplay,
    totalCorrect,
    totalTyped,
    accuracy,
    frame,
    reset,
    getScore,
  };
}
