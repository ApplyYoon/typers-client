import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Typing.css';

const SAMPLE_TEXTS = [
  '빠른 갈색 여우가 게으른 개를 뛰어넘었습니다.',
  '타이핑 연습을 통해 빠르고 정확하게 입력하는 습관을 만들어보세요.',
  '포도봉 포도알이 포도밭에서 포도를 따고 있습니다.',
  '하늘을 나는 새처럼 자유롭게 타이핑을 즐겨봅시다.',
  '오늘도 열심히 타이핑 연습을 하여 실력을 키워봅시다.',
];

const Typing: React.FC = () => {
  const [currentText] = useState(() => SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const calcStats = useCallback((typed: string) => {
    if (!startTime) return;
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const words = typed.length / 5;
    setWpm(Math.round(words / elapsed));

    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === currentText[i]) correct++;
    }
    setAccuracy(typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100);
  }, [startTime, currentText]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());

    setInput(val);
    calcStats(val);

    if (val === currentText) {
      setFinished(true);
    }
  };

  const reset = () => {
    setInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setFinished(false);
    inputRef.current?.focus();
  };

  return (
    <div className="typing-page">
      <div className="typing-container">
        <div className="typing-card">
          <h2 className="typing-title">타이핑 연습</h2>

          {/* Stats bar */}
          <div className="typing-stats">
            <div className="stat-item">
              <span className="stat-label">WPM</span>
              <span className="stat-value purple">{wpm}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">정확도</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
          </div>

          {/* Text display */}
          <div className="typing-text-wrap">
            {currentText.split('').map((char, i) => {
              let cls = 'char-pending';
              if (i < input.length) {
                cls = input[i] === char ? 'char-correct' : 'char-wrong';
              } else if (i === input.length) {
                cls = 'char-cursor';
              }
              return (
                <span key={i} className={cls}>
                  {char}
                </span>
              );
            })}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            className="typing-input"
            value={input}
            onChange={handleInput}
            disabled={finished}
            placeholder="여기에 타이핑하세요..."
            autoComplete="off"
            spellCheck={false}
          />

          {finished && (
            <div className="typing-result">
              <p className="result-text">완료! 🎉</p>
              <p className="result-stats">{wpm} WPM · 정확도 {accuracy}%</p>
              <button className="result-btn" onClick={reset}>다시 시작</button>
            </div>
          )}
        </div>

        <div className="typing-mascot-area">
          <span className="typing-mascot">🍇</span>
          <p className="typing-mascot-msg">화이팅!</p>
        </div>
      </div>
    </div>
  );
};

export default Typing;
