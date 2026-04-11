import React, { useState } from 'react';
import { SCHOOLS } from '../../data/schools';
import type { Lang } from '../../data/texts';

interface Props {
  onConfirm: (schoolId: string, username: string, lang: Lang) => void;
}

const SchoolSelect: React.FC<Props> = ({ onConfirm }) => {
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [username, setUsername] = useState('');
  const [lang, setLang] = useState<Lang>('ko');

  const canProceed = selectedSchool && username.trim().length > 0;

  return (
    <div className="school-select">
      <div className="school-select-inner">
        <div className="battle-logo">
          <span className="battle-logo-emoji">🍇</span>
          <h1 className="battle-logo-title">학교 대항전</h1>
          <p className="battle-logo-sub">1분 타이핑 배틀 · 학교의 명예를 걸고 싸워라</p>
        </div>

        {/* Lang toggle */}
        <div className="lang-toggle-wrap">
          <div className="lang-toggle">
            <button
              className={`lang-btn ${lang === 'ko' ? 'active' : ''}`}
              onClick={() => setLang('ko')}
            >
              🇰🇷 한타
            </button>
            <button
              className={`lang-btn ${lang === 'mixed' ? 'active' : ''}`}
              onClick={() => setLang('mixed')}
            >
              🔀 혼합
            </button>
            <button
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              🇺🇸 영타
            </button>
          </div>
        </div>

        {/* Username */}
        <div className="username-section">
          <input
            className="username-input"
            type="text"
            placeholder="닉네임을 입력하세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={12}
          />
        </div>

        {/* School grid */}
        <p className="school-section-label">학교를 선택하세요</p>
        <div className="school-grid">
          {SCHOOLS.map((school) => (
            <button
              key={school.id}
              className={`school-card ${selectedSchool === school.id ? 'selected' : ''}`}
              onClick={() => setSelectedSchool(school.id)}
              style={
                selectedSchool === school.id
                  ? { borderColor: school.color, background: school.color + '18' }
                  : {}
              }
            >
              <span className="school-emoji">{school.emoji}</span>
              <span className="school-short">{school.shortName}</span>
            </button>
          ))}
        </div>

        <button
          className="start-btn"
          disabled={!canProceed}
          onClick={() => canProceed && onConfirm(selectedSchool, username.trim(), lang)}
        >
          배틀 시작
        </button>
      </div>
    </div>
  );
};

export default SchoolSelect;
