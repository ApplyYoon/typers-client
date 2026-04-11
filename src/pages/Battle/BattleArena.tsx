import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getRandomText, type Lang } from '../../data/texts';
import { keystrokesForChar } from '../../utils/keystrokes';

interface Props {
  lang: Lang;
  onFinish: (score: number, accuracy: number) => void;
}

const TOTAL       = 65;
const KO_END      = 25; // timeLeft=25 → 한국어 40초 완료
const TRANS_END   = 20; // timeLeft=20 → 전환 5초 완료

type Phase = 'korean' | 'transition' | 'english';

function getPhase(timeLeft: number, lang: Lang): Phase {
  if (lang !== 'mixed') return lang === 'ko' ? 'korean' : 'english';
  if (timeLeft > KO_END)   return 'korean';
  if (timeLeft > TRANS_END) return 'transition';
  return 'english';
}

const BattleArena: React.FC<Props> = ({ lang, onFinish }) => {
  const [countdown, setCountdown]   = useState(3);
  const [started, setStarted]       = useState(false);
  const [timeLeft, setTimeLeft]     = useState(TOTAL);
  const [text, setText]             = useState(() => getRandomText(lang === 'mixed' ? 'ko' : lang));
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalTyped,   setTotalTyped]   = useState(0);
  const [liveCpm, setLiveCpm]       = useState(0);
  const [frame, setFrame]           = useState<1 | 2>(1);

  const inputRef     = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);
  const finishedRef  = useRef(false);
  const phaseRef     = useRef<Phase>(getPhase(TOTAL, lang));
  const textRef      = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  // ── 초기 카운트다운 ──────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setStarted(true);
      startTimeRef.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── 1분 타이머 ───────────────────────────────
  useEffect(() => {
    if (!started || finishedRef.current) return;
    if (timeLeft <= 0) { doFinish(); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft]);

  // ── 페이즈 전환 감지 ─────────────────────────
  useEffect(() => {
    if (!started) return;
    const phase = getPhase(timeLeft, lang);

    if (phase === 'transition' && phaseRef.current === 'korean') {
      // 한국어 → 전환: 입력창 비우기
      phaseRef.current = 'transition';
      setInputValue('');
      if (inputRef.current) inputRef.current.value = '';
    }

    if (phase === 'english' && phaseRef.current === 'transition') {
      // 전환 → 영어: isComposing 리셋 (한글 조합 중 전환 시 stuck 방지)
      phaseRef.current = 'english';
      setIsComposing(false);
      const next = getRandomText('en');
      setText(next);
      setInputValue('');
      if (inputRef.current) { inputRef.current.value = ''; inputRef.current.focus(); }
    }
  }, [timeLeft, started, lang]);

  // ── 실시간 CPM ───────────────────────────────
  useEffect(() => {
    if (!startTimeRef.current) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    if (elapsed < 0.01) return;
    setLiveCpm(Math.round(totalCorrect / elapsed));
  }, [totalCorrect]);

  // ── 종료 ─────────────────────────────────────
  const doFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60 || 1 / 60;
    setTotalCorrect((correct) => {
      setTotalTyped((typed) => {
        const cpm      = Math.round(correct / elapsed);
        const accuracy = typed > 0 ? Math.round((correct / typed) * 100) : 0;
        setTimeout(() => onFinish(cpm, accuracy), 0);
        return typed;
      });
      return correct;
    });
  }, [onFinish]);

  // ── 입력 처리 ────────────────────────────────
  // prevVal에 오타가 있으면 앞으로 진행 불가 (backspace만 허용)
  const hasError = (val: string, target: string) =>
    val.split('').some((c, i) => c !== target[i]);

  const countAndStore = (newVal: string, fromIdx: number, target: string) => {
    let correct = 0;
    let typed = 0;
    for (let i = fromIdx; i < newVal.length; i++) {
      const ks = keystrokesForChar(newVal[i]);
      typed += ks;
      if (newVal[i] === target[i]) correct += ks;
    }
    setTotalTyped((n) => n + typed);
    setTotalCorrect((n) => n + correct);
  };

  const commit = useCallback((newVal: string, prevVal: string) => {
    const currentText = textRef.current;

    if (newVal.length > prevVal.length) {
      // 오타가 있는 상태에서 앞으로 진행 시도 → 차단
      if (hasError(prevVal, currentText)) {
        if (inputRef.current) inputRef.current.value = prevVal;
        return;
      }
      countAndStore(newVal, prevVal.length, currentText);
    }

    if (newVal === currentText) {
      const nextLang = phaseRef.current === 'english' ? 'en' : 'ko';
      setText(getRandomText(nextLang));
      setInputValue('');
      if (inputRef.current) inputRef.current.value = '';
    } else {
      setInputValue(newVal);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!started || isComposing) return;
    commit(e.target.value, inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!started) return;
    // 실제 문자 입력 키에만 반응 (수식어·방향키·기능키 제외)
    if (e.key.length === 1 || e.key === 'Process') {
      setFrame((f) => (f === 1 ? 2 : 1));
    }
  };

  const handleCompositionStart = () => setIsComposing(true);

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    const newVal = (e.target as HTMLInputElement).value;
    const currentText = textRef.current;

    if (newVal.length > inputValue.length) {
      // 오타가 있는 상태에서 조합 완료 시도 → 차단
      if (hasError(inputValue, currentText)) {
        if (inputRef.current) inputRef.current.value = inputValue;
        return;
      }
      countAndStore(newVal, inputValue.length, currentText);
    }

    if (newVal === currentText) {
      const nextLang = phaseRef.current === 'english' ? 'en' : 'ko';
      setText(getRandomText(nextLang));
      setInputValue('');
      if (inputRef.current) inputRef.current.value = '';
    } else {
      setInputValue(newVal);
    }
  };

  // ── 렌더 헬퍼 ────────────────────────────────
  const charDisplay = text.split('').map((char, i) => {
    if (i < inputValue.length) return inputValue[i] === char ? 'correct' : 'wrong';
    if (i === inputValue.length) return 'cursor';
    return 'pending';
  });

  const phase       = getPhase(timeLeft, lang);
  const timerPct    = (timeLeft / TOTAL) * 100;
  const charLevel   = liveCpm >= 400 ? 3 : liveCpm >= 200 ? 2 : 1;
  const charSrc     = `/typing/character_typing_${charLevel}-${frame}.png`;
  const timerColor  = timeLeft > KO_END ? '#7c3aed' : timeLeft > TRANS_END ? '#f59e0b' : '#10b981';
  const accuracy    = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;
  const transCount  = timeLeft - TRANS_END; // 5,4,3,2,1

  // ── 초기 카운트다운 화면 ──────────────────────
  if (!started) {
    return (
      <div className="arena-countdown-overlay">
        <div className="arena-logo">🍇</div>
        <div className="countdown-number">{countdown === 0 ? 'GO!' : countdown}</div>
        <p className="countdown-sub">
          {lang === 'mixed'
            ? '혼합 모드 · 한국어 40초 → 영어 20초'
            : lang === 'ko' ? '한타 모드 · 1분' : '영타 모드 · 1분'}
        </p>
      </div>
    );
  }

  // ── 전환 카운트다운 오버레이 ──────────────────
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

      {/* 현재 페이즈 뱃지 */}
      {lang === 'mixed' && (
        <div className={`phase-badge ${phase}`}>
          {phase === 'korean' ? '🇰🇷 한국어' : '🇺🇸 영어'}
          {phase === 'korean' && <span className="phase-remain"> · {timeLeft - KO_END}초 후 영어 전환</span>}
        </div>
      )}

      {/* 캐릭터 */}
      <div className="arena-character">
        <img src={charSrc} alt="character" className="arena-character-img" />
      </div>

      {/* 목표 문장 */}
      <div className="arena-text">
        {text.split('').map((char, i) => (
          <span key={i} className={`char-${charDisplay[i]}`}>{char}</span>
        ))}
      </div>

      {/* 입력창 */}
      <input
        ref={inputRef}
        className="arena-input"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={phase === 'korean' ? '여기에 타이핑하세요' : 'Type here...'}
      />
    </div>
  );
};

export default BattleArena;
