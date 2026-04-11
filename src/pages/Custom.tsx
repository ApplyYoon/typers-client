import React, { useState } from 'react';
import './Custom.css';

type CursorType = 'basic' | 'left-up' | 'left-down' | 'center' | 'right-up';

interface CursorOption {
  id: CursorType;
  label: string;
  lines: string[];
}

const CURSOR_OPTIONS: CursorOption[] = [
  {
    id: 'basic',
    label: '기본',
    lines: ['{ }', '[ ]', '| |'],
  },
  {
    id: 'left-up',
    label: '왼손\n위',
    lines: ['{ }', '[ ]', '/ \\'],
  },
  {
    id: 'left-down',
    label: '왼손\n아래',
    lines: ['{ }', '[ ]', '\\ /'],
  },
  {
    id: 'center',
    label: '가운데',
    lines: ['{ }', '[ ]', '---'],
  },
  {
    id: 'right-up',
    label: '오른손\n위',
    lines: ['{ }', '[ ]', '/ \\'],
  },
];

const Custom: React.FC = () => {
  const [selected, setSelected] = useState<CursorType>('basic');
  const [loginPrompt, setLoginPrompt] = useState(false);

  return (
    <div className="custom-page">
      {/* Wave header */}
      <div className="custom-header">
        <div className="custom-header-bg">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="custom-wave">
            <path
              d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1440,0 1440,60 L1440,120 L0,120 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <div className="custom-container">
        {/* Cursor selector */}
        <div className="cursor-section">
          <div className="cursor-options">
            <div className="cursor-bracket left-bracket">{'{'}</div>
            {CURSOR_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className={`cursor-option ${selected === opt.id ? 'selected' : ''}`}
                onClick={() => setSelected(opt.id)}
              >
                {opt.label.split('\n').map((line, i) => (
                  <span key={i} className="cursor-option-line">{line}</span>
                ))}
              </button>
            ))}
            <div className="cursor-bracket right-bracket">{'}'}</div>
          </div>
        </div>

        {/* Login prompt overlay */}
        <div className="custom-login-section">
          <div className="custom-preview-blur">
            <div className="custom-preview-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="preview-cell" />
              ))}
            </div>
          </div>
          <div className="custom-login-overlay">
            <p className="custom-login-text">로그인 후 확인 가능합니다.</p>
            <button className="custom-login-btn">로그인</button>
          </div>
        </div>

        {/* Monthly stats section */}
        <div className="custom-stats-section">
          <div className="custom-stats-header">
            <h3 className="custom-stats-title">나의 활동 - 2024년 8월 조사</h3>
          </div>
          <div className="custom-stats-content">
            <div className="custom-stats-bars">
              {[60, 75, 80, 90, 95, 88, 92, 98].map((v, i) => (
                <div key={i} className="custom-stat-bar-wrap">
                  <div
                    className="custom-stat-bar"
                    style={{ height: `${v}%` }}
                  />
                  <span className="custom-stat-label">{`24.${i + 1}`}</span>
                </div>
              ))}
            </div>
            <div className="custom-stats-mascot">
              <img src="/logo_nbg.png" alt="logo" className="stats-mascot-emoji" />
              <div className="stats-speech-bubble">
                <p>와, 열심 먹으려<br />Ppodoomii83!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Custom;
