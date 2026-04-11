import React, { useState } from 'react';
import './Ranking.css';

interface RankUser {
  rank: number;
  username: string;
  avgWpm: number;
  avatar: string;
  isTop3: boolean;
}

const MOCK_RANKS: RankUser[] = [
  { rank: 1, username: '포도봉', avgWpm: 1100, avatar: '👑🍇', isTop3: true },
  { rank: 2, username: '알포도', avgWpm: 1050, avatar: '🍇', isTop3: true },
  { rank: 3, username: '포포', avgWpm: 980, avatar: '🌟', isTop3: true },
  { rank: 4, username: '포도좋아', avgWpm: 900, avatar: '🍇', isTop3: false },
  { rank: 5, username: '포도포', avgWpm: 890, avatar: '🍇', isTop3: false },
  { rank: 6, username: '타이핑왕', avgWpm: 870, avatar: '🍇', isTop3: false },
  { rank: 7, username: '빠른손', avgWpm: 850, avatar: '🍇', isTop3: false },
  { rank: 8, username: '포도나무', avgWpm: 820, avatar: '🍇', isTop3: false },
  { rank: 9, username: '스피드왕', avgWpm: 800, avatar: '🍇', isTop3: false },
  { rank: 10, username: '포도사랑', avgWpm: 790, avatar: '🍇', isTop3: false },
];

const AVATAR_COLORS = ['#7c3aed', '#a78bfa', '#fbbf24'];

const Ranking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');
  const top3 = MOCK_RANKS.filter((u) => u.isTop3);
  const rest = MOCK_RANKS.filter((u) => !u.isTop3);

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} (C)`;

  return (
    <div className="ranking-page">
      <div className="ranking-container">
        <div className="ranking-header">
          <p className="ranking-subtitle">9가 명의 유저가 중이요.</p>
          <p className="ranking-date">{dateStr}</p>
        </div>

        {/* Podium */}
        <div className="podium">
          {/* 2nd place */}
          <div className="podium-item podium-2nd">
            <div
              className="podium-avatar"
              style={{ background: AVATAR_COLORS[1] }}
            >
              <span className="podium-emoji">🍇</span>
            </div>
            <p className="podium-name">{top3[1]?.username}</p>
            <div className="podium-block podium-block-2nd">
              <span className="podium-rank-num">2</span>
            </div>
          </div>

          {/* 1st place */}
          <div className="podium-item podium-1st">
            <div className="podium-crown">👑</div>
            <div
              className="podium-avatar podium-avatar-large"
              style={{ background: AVATAR_COLORS[0] }}
            >
              <span className="podium-emoji">🍇</span>
            </div>
            <p className="podium-name">{top3[0]?.username}</p>
            <div className="podium-block podium-block-1st">
              <span className="podium-rank-num">1</span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="podium-item podium-3rd">
            <div
              className="podium-avatar"
              style={{ background: AVATAR_COLORS[2] }}
            >
              <span className="podium-emoji">😊</span>
            </div>
            <p className="podium-name">{top3[2]?.username}</p>
            <div className="podium-block podium-block-3rd">
              <span className="podium-rank-num">3</span>
            </div>
          </div>
        </div>

        {/* Rank list */}
        <div className="rank-list-section">
          <div className="rank-tabs">
            {(['daily', 'weekly', 'monthly', 'all'] as const).map((tab) => (
              <button
                key={tab}
                className={`rank-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'daily' ? '일간' : tab === 'weekly' ? '주간' : tab === 'monthly' ? '월간' : '전체'}
              </button>
            ))}
          </div>

          <div className="rank-list">
            {rest.map((user) => (
              <div key={user.rank} className="rank-row">
                <span className="rank-num">{user.rank}</span>
                <div className="rank-avatar-small">🍇</div>
                <span className="rank-username">{user.username}</span>
                <div className="rank-score">
                  <span className="rank-wpm-icon">💜</span>
                  <span className="rank-wpm">평균 타수 {user.avgWpm}</span>
                </div>
                {user.rank === 5 && (
                  <button className="rank-up-btn" title="순위 올라감">↑</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
