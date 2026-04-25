import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getRandomText } from '../data/texts';
import { useTypingEngine } from '../hooks/useTypingEngine';
import './Typing.css';

const Typing: React.FC = () => {
  const [lang, setLang]               = useState<'ko' | 'en'>('ko');
  const [text, setText]               = useState(() => getRandomText('ko'));
  const [sentencesDone, setSentencesDone] = useState(0);
  const [liveCpm, setLiveCpm]         = useState(0);

  // 첫 키 입력 시점 (CPM 계산 기준)
  const sessionStartRef = useRef<number>(0);
  const hasStartedRef   = useRef(false);

  // lang stale closure 방지
  const langRef = useRef<'ko' | 'en'>('ko');
  useEffect(() => { langRef.current = lang; }, [lang]);

  // 문장 완료: 카운트 증가 + 다음 문장 로드
  // useTypingEngine은 text가 바뀌어도 totalCorrect/totalTyped를 리셋하지 않으므로
  // 세션 누적 정확도·CPM은 hook 반환값 그대로 사용 가능
  const handleComplete = useCallback(() => {
    setSentencesDone(n => n + 1);
    setText(getRandomText(langRef.current));
  }, []);

  const {
    inputRef,
    handleKeyDown: engineKeyDown,
    getSyllableDisplay,
    totalCorrect,
    totalTyped,
    accuracy,
    frame,
    reset,
  } = useTypingEngine({ text, active: true, onComplete: handleComplete });

  // 첫 입력 시 타이머 시작, 이후 엔진에 위임
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!hasStartedRef.current && e.key !== 'Backspace') {
        hasStartedRef.current = true;
        sessionStartRef.current = Date.now();
      }
      engineKeyDown(e);
    },
    [engineKeyDown],
  );

  // 실시간 세션 CPM (totalCorrect는 문장 간 누적값)
  useEffect(() => {
    if (!sessionStartRef.current) return;
    const elapsed = (Date.now() - sessionStartRef.current) / 1000 / 60;
    if (elapsed < 0.01) return;
    setLiveCpm(Math.round(totalCorrect / elapsed));
  }, [totalCorrect]);

  // 마운트 시 포커스
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // 언어 전환: 세션 초기화
  const handleLangChange = (newLang: 'ko' | 'en') => {
    if (newLang === lang) return;
    reset();
    setLang(newLang);
    setText(getRandomText(newLang));
    setSentencesDone(0);
    setLiveCpm(0);
    hasStartedRef.current = false;
    sessionStartRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const charLevel = liveCpm >= 400 ? 3 : liveCpm >= 200 ? 2 : 1;
  const charSrc   = `/typing/character_typing_${charLevel}-${frame}.png`;
  const isKorean  = lang === 'ko';

  return (
    <div className="typing-page">
      <div className="practice-arena">

        {/* ── 상단 바: CPM | 언어 선택 + 문장 번호 | 정확도 ── */}
        <div className="practice-topbar">
          <div className="practice-stat">
            <span className="practice-stat-label">CPM</span>
            <span className="practice-stat-value" style={{ color: '#7c3aed' }}>{liveCpm}</span>
          </div>

          <div className="practice-center">
            <div className="practice-lang-toggle">
              <button
                className={`practice-lang-btn${lang === 'ko' ? ' active' : ''}`}
                onClick={() => handleLangChange('ko')}
              >
                한국어
              </button>
              <button
                className={`practice-lang-btn${lang === 'en' ? ' active' : ''}`}
                onClick={() => handleLangChange('en')}
              >
                English
              </button>
            </div>
            <span className="practice-sentence-num">{sentencesDone + 1}번째 문장</span>
          </div>

          <div className="practice-stat">
            <span className="practice-stat-label">정확도</span>
            <span className="practice-stat-value">
              {totalTyped > 0 ? accuracy : 100}%
            </span>
          </div>
        </div>

        {/* ── 캐릭터 ── */}
        <div className="arena-character">
          <img src={charSrc} alt="character" className="arena-character-img" />
        </div>

        {/* ── 타이핑 대상 문장 ── */}
        <div
          className={`arena-text${isKorean ? ' arena-text-ko' : ''}`}
          onClick={() => inputRef.current?.focus()}
        >
          {text.split('').map((char, i) => {
            const { cls, char: displayChar } = getSyllableDisplay(i, char);
            const spaceCls = char === ' ' && isKorean ? ' char-space-ko' : '';
            return (
              <span key={i} className={`char-${cls}${spaceCls}`}>
                {displayChar}
              </span>
            );
          })}
        </div>

        {/* keydown 캡처용 hidden input */}
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

        <p className="practice-hint">클릭하거나 바로 타이핑을 시작하세요</p>
      </div>
    </div>
  );
};

export default Typing;
