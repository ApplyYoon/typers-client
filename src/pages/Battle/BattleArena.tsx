import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getRandomText, type Lang } from '../../data/texts';
import {
  decomposeText,
  composePartialJamos,
  isKoreanJamo,
  KOREAN_KEY_TO_JAMO,
  CODE_TO_QWERTY,
} from '../../utils/jamoUtils';

interface Props {
  lang: Lang;
  onFinish: (score: number, accuracy: number) => void;
}

const TOTAL     = 65;
const KO_END    = 25;
const TRANS_END = 20;

type Phase = 'korean' | 'transition' | 'english';

function getPhase(timeLeft: number, lang: Lang): Phase {
  if (lang !== 'mixed') return lang === 'ko' ? 'korean' : 'english';
  if (timeLeft > KO_END)    return 'korean';
  if (timeLeft > TRANS_END) return 'transition';
  return 'english';
}

const BattleArena: React.FC<Props> = ({ lang, onFinish }) => {
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted]     = useState(false);
  const [timeLeft, setTimeLeft]   = useState(TOTAL);
  const [text, setText]           = useState(() => getRandomText(lang === 'mixed' ? 'ko' : lang));

  // 자모 단위 진행 상태
  const [jamoPos, setJamoPos]     = useState(0);
  const [hasError, setHasError]   = useState(false);
  const [wrongTyped, setWrongTyped] = useState(''); // 오타 시 실제 입력한 자모

  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalTyped,   setTotalTyped]   = useState(0);
  const [liveCpm, setLiveCpm]           = useState(0);
  const [frame, setFrame]               = useState<1 | 2>(1);

  const inputRef     = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);
  const finishedRef  = useRef(false);
  const phaseRef     = useRef<Phase>(getPhase(TOTAL, lang));

  // 텍스트가 바뀌면 자모 분해 + jamoPos 리셋
  const jamoInfo = useMemo(() => decomposeText(text), [text]);
  useEffect(() => {
    setJamoPos(0);
    setHasError(false);
    setWrongTyped('');
  }, [text]);

  // ── 카운트다운 ──────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setStarted(true);
      startTimeRef.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── 타이머 ──────────────────────────────────
  useEffect(() => {
    if (!started || finishedRef.current) return;
    if (timeLeft <= 0) { doFinish(); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft]);

  // ── 페이즈 전환 ─────────────────────────────
  useEffect(() => {
    if (!started) return;
    const phase = getPhase(timeLeft, lang);

    if (phase === 'transition' && phaseRef.current === 'korean') {
      phaseRef.current = 'transition';
      // text는 유지, 자모 상태만 리셋 (useEffect on text handles it if we setText)
      setJamoPos(0);
      setHasError(false);
    }

    if (phase === 'english' && phaseRef.current === 'transition') {
      phaseRef.current = 'english';
      setText(getRandomText('en'));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [timeLeft, started, lang]);

  // ── 실시간 CPM ──────────────────────────────
  useEffect(() => {
    if (!startTimeRef.current) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    if (elapsed < 0.01) return;
    setLiveCpm(Math.round(totalCorrect / elapsed));
  }, [totalCorrect]);

  // ── 종료 ────────────────────────────────────
  const doFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60 || 1 / 60;
    setTotalCorrect(correct => {
      setTotalTyped(typed => {
        const cpm      = Math.round(correct / elapsed);
        const accuracy = typed > 0 ? Math.round((correct / typed) * 100) : 0;
        setTimeout(() => onFinish(cpm, accuracy), 0);
        return typed;
      });
      return correct;
    });
  }, [onFinish]);

  // ── 키 입력 처리 ─────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!started) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length > 1 && e.key !== 'Backspace') return;

    e.preventDefault();

    // Backspace: 오타 상태만 해제
    if (e.key === 'Backspace') {
      if (hasError) { setHasError(false); setWrongTyped(''); }
      return;
    }

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
    } else {
      // 영어·공백: e.key 그대로
      typed = e.key;
    }

    setFrame(f => f === 1 ? 2 : 1);
    setTotalTyped(n => n + 1);

    if (typed === expected) {
      setHasError(false);
      setWrongTyped('');
      setTotalCorrect(n => n + 1);
      const nextPos = jamoPos + 1;

      if (nextPos >= jamoSequence.length) {
        const nextLang = phaseRef.current === 'english' ? 'en' : 'ko';
        setText(getRandomText(nextLang));
      } else {
        setJamoPos(nextPos);
      }
    } else {
      setHasError(true);
      setWrongTyped(typed);
    }
  }, [started, hasError, jamoInfo, jamoPos]);

  // ── 렌더 헬퍼 ───────────────────────────────
  const getSyllableDisplay = (i: number, targetChar: string): { cls: string; char: string } => {
    const range = jamoInfo.syllableRanges[i];

    // 완료된 음절 → 원래 글자 보라
    if (jamoPos >= range.end) return { cls: 'correct', char: targetChar };

    // 아직 안 온 음절 → 회색
    if (jamoPos < range.start) return { cls: 'pending', char: targetChar };

    // 현재 진행 중인 음절
    if (hasError) {
      // 틀린 자모 빨간색으로 표시
      return { cls: 'wrong', char: wrongTyped || targetChar };
    }

    if (jamoPos === range.start) {
      // 이 음절의 첫 자모를 아직 안 쳤음 → 커서
      return { cls: 'cursor', char: targetChar };
    }

    // 일부 자모를 올바르게 쳤음 → 부분 음절 합성해서 보라색으로
    const typedJamos = jamoInfo.jamoSequence.slice(range.start, jamoPos);
    return { cls: 'composing', char: composePartialJamos(typedJamos) };
  };

  const phase      = getPhase(timeLeft, lang);
  const timerPct   = (timeLeft / TOTAL) * 100;
  const charLevel  = liveCpm >= 400 ? 3 : liveCpm >= 200 ? 2 : 1;
  const charSrc    = `/typing/character_typing_${charLevel}-${frame}.png`;
  const timerColor = timeLeft > KO_END ? '#7c3aed' : timeLeft > TRANS_END ? '#f59e0b' : '#10b981';
  const accuracy   = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;
  const transCount = timeLeft - TRANS_END;

  // ── 카운트다운 화면 ──────────────────────────
  if (!started) {
    return (
      <div className="arena-countdown-overlay">
        <img src="/logo_nbg.png" alt="logo" className="arena-logo" />
        <div className="countdown-number">{countdown === 0 ? 'GO!' : countdown}</div>
        <p className="countdown-sub">
          {lang === 'mixed'
            ? '혼합 모드 · 한국어 40초 → 영어 20초'
            : lang === 'ko' ? '한타 모드 · 1분' : '영타 모드 · 1분'}
        </p>
      </div>
    );
  }

  // ── 전환 카운트다운 오버레이 ─────────────────
  if (phase === 'transition') {
    return (
      <div className="arena">
        <div className="arena-topbar">
          <div className="arena-stat">
            <span className="arena-stat-label">CPM</span>
            <span className="arena-stat-value" style={{ color: '#7c3aed' }}>{liveCpm}</span>
          </div>
          <div className="arena-timer-wrap">
            <svg className="arena-timer-svg" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={timerColor} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - timerPct / 100)}`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
              <text x="60" y="65" textAnchor="middle" fontSize="26" fontWeight="800" fill={timerColor}>
                {timeLeft}
              </text>
            </svg>
          </div>
          <div className="arena-stat">
            <span className="arena-stat-label">정확도</span>
            <span className="arena-stat-value">{accuracy}%</span>
          </div>
        </div>
        <div className="arena-transition">
          <p className="transition-label">🇺🇸 영어 전환까지</p>
          <div className="transition-count">{transCount}</div>
          <p className="transition-sub">잠시 후 영어 타이핑이 시작됩니다</p>
        </div>
      </div>
    );
  }

  // ── 메인 타이핑 화면 ─────────────────────────
  return (
    <div className="arena">
      <div className="arena-topbar">
        <div className="arena-stat">
          <span className="arena-stat-label">CPM</span>
          <span className="arena-stat-value" style={{ color: '#7c3aed' }}>{liveCpm}</span>
        </div>
        <div className="arena-timer-wrap">
          <svg className="arena-timer-svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={timerColor} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - timerPct / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
            <text x="60" y="65" textAnchor="middle" fontSize="26" fontWeight="800" fill={timerColor}>
              {timeLeft}
            </text>
          </svg>
        </div>
        <div className="arena-stat">
          <span className="arena-stat-label">정확도</span>
          <span className="arena-stat-value">{accuracy}%</span>
        </div>
      </div>

      {lang === 'mixed' && (
        <div className={`phase-badge ${phase}`}>
          {phase === 'korean' ? '🇰🇷 한국어' : '🇺🇸 영어'}
          {phase === 'korean' && <span className="phase-remain"> · {timeLeft - KO_END}초 후 영어 전환</span>}
        </div>
      )}

      <div className="arena-character">
        <img src={charSrc} alt="character" className="arena-character-img" />
      </div>

      {/* 목표 문장 — 음절 단위 색상 + 실제 입력 글자 표시
          arena-text-ko: 한국어 구간에서만 고정 폭 적용 (자모↔음절 폭 차이 방지) */}
      <div
        className={`arena-text${phase === 'korean' ? ' arena-text-ko' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        {text.split('').map((char, i) => {
          const { cls, char: displayChar } = getSyllableDisplay(i, char);
          const spaceCls = char === ' ' && phase === 'korean' ? ' char-space-ko' : '';
          return <span key={i} className={`char-${cls}${spaceCls}`}>{displayChar}</span>;
        })}
      </div>

      {/* 숨겨진 입력창 — keydown 캡처 전용 */}
      <input
        ref={inputRef}
        className="arena-input-hidden"
        onKeyDown={handleKeyDown}
        readOnly
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  );
};

export default BattleArena;
