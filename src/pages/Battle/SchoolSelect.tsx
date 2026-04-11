import React, { useState } from 'react';
import { SCHOOLS } from '../../data/schools';
import { getSchoolStats } from '../../utils/battleStorage';

interface Props {
  onConfirm: (schoolId: string, username: string) => void;
}

const RANK_IMAGES: Record<number, string> = {
  1: '/rank_gold.png',
  2: '/rank_silver.png',
  3: '/rank_bronze.png',
};

const SchoolSelect: React.FC<Props> = ({ onConfirm }) => {
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [username, setUsername] = useState('');

  const canProceed = selectedSchool && username.trim().length > 0;
  const stats = getSchoolStats();

  return (
    <div className="school-select">
      <div className="school-select-layout">
        {/* ── 왼쪽: 배틀 참가 폼 ── */}
        <div className="school-select-form">
          <div className="battle-logo">
            <span className="battle-logo-emoji">🍇</span>
            <h1 className="battle-logo-title">학교 대항전</h1>
            <p className="battle-logo-sub">한국어 40초 · 영어 15초 · CPM 측정</p>
          </div>

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
            onClick={() => canProceed && onConfirm(selectedSchool, username.trim())}
          >
            배틀 시작
          </button>
        </div>

        {/* ── 오른쪽: 학교 랭킹 ── */}
        <div className="school-ranking-panel">
          <h2 className="ranking-panel-title">학교 랭킹</h2>

          {stats.length === 0 ? (
            <p className="ranking-panel-empty">아직 기록이 없습니다.</p>
          ) : (
            <div className="ranking-panel-list">
              {stats.map((stat, idx) => {
                const school = SCHOOLS.find((s) => s.id === stat.schoolId);
                const rank = idx + 1;
                const isMine = stat.schoolId === selectedSchool;
                return (
                  <div
                    key={stat.schoolId}
                    className={`ranking-panel-row ${isMine ? 'mine' : ''}`}
                    style={isMine ? { borderColor: school?.color } : {}}
                  >
                    <div className="ranking-panel-pos">
                      {rank <= 3
                        ? <img src={RANK_IMAGES[rank]} alt={`${rank}위`} className="ranking-panel-crown" />
                        : <span className="ranking-panel-rank-num">{rank}</span>
                      }
                    </div>
                    <div className="ranking-panel-color" style={{ background: school?.color ?? '#ccc' }} />
                    <span className="ranking-panel-name">{school?.shortName ?? stat.schoolId}</span>
                    <div className="ranking-panel-bar-wrap">
                      <div
                        className="ranking-panel-bar"
                        style={{
                          width: `${Math.min((stat.avgScore / (stats[0]?.avgScore || 1)) * 100, 100)}%`,
                          background: school?.color ?? '#7c3aed',
                        }}
                      />
                    </div>
                    <span className="ranking-panel-score">{stat.avgScore.toLocaleString()} <small>CPM</small></span>
                    <span className="ranking-panel-count">{stat.count}명</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolSelect;
