import React from 'react';
import { SCHOOLS } from '../../data/schools';
import { getSchoolStats } from '../../utils/battleStorage';
import type { Lang } from '../../data/texts';

interface Props {
  schoolId: string;
  username: string;
  score: number;
  accuracy: number;
  lang: Lang;
  onRetry: () => void;
  onChangeSchool: () => void;
}

const BattleResult: React.FC<Props> = ({
  schoolId,
  username,
  score,
  accuracy,
  lang,
  onRetry,
  onChangeSchool,
}) => {
  const stats = getSchoolStats(lang);
  const mySchool = SCHOOLS.find((s) => s.id === schoolId);
  const myRank = stats.findIndex((s) => s.schoolId === schoolId) + 1;
  const scoreLabel = lang === 'ko' ? '타/분' : 'WPM';

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}위`;
  };

  const getScoreComment = (s: number) => {
    if (lang === 'ko') {
      if (s >= 700) return '신의 경지!';
      if (s >= 500) return '타이핑 고수!';
      if (s >= 350) return '준수한 실력!';
      if (s >= 200) return '계속 연습하면 늘 거예요!';
      return '포기하지 마세요!';
    } else {
      if (s >= 120) return 'Legendary!';
      if (s >= 90) return 'Expert Typist!';
      if (s >= 60) return 'Above Average!';
      if (s >= 40) return 'Keep Practicing!';
      return "Don't give up!";
    }
  };

  return (
    <div className="result-page">
      <div className="result-container">
        {/* My score card */}
        <div className="result-score-card">
          <div className="result-mascot">🍇</div>
          <h2 className="result-username">{username}</h2>
          <div
            className="result-school-badge"
            style={{ background: mySchool?.color ?? '#7c3aed' }}
          >
            {mySchool?.emoji} {mySchool?.shortName}
          </div>

          <div className="result-main-score">
            <span className="result-score-num">{score.toLocaleString()}</span>
            <span className="result-score-unit">{scoreLabel}</span>
          </div>
          <p className="result-comment">{getScoreComment(score)}</p>

          <div className="result-sub-stats">
            <div className="result-sub-stat">
              <span className="result-sub-label">정확도</span>
              <span className="result-sub-value">{accuracy}%</span>
            </div>
            <div className="result-sub-stat">
              <span className="result-sub-label">학교 순위</span>
              <span className="result-sub-value">
                {myRank > 0 ? getRankEmoji(myRank) : '-'}
              </span>
            </div>
            <div className="result-sub-stat">
              <span className="result-sub-label">모드</span>
              <span className="result-sub-value">{lang === 'ko' ? '한타' : '영타'}</span>
            </div>
          </div>
        </div>

        {/* School ranking */}
        <div className="school-ranking-card">
          <h3 className="school-ranking-title">
            🏫 학교 대항전 랭킹
            <span className="school-ranking-mode">{lang === 'ko' ? '한타' : '영타'}</span>
          </h3>

          <div className="school-ranking-list">
            {stats.slice(0, 8).map((stat, idx) => {
              const school = SCHOOLS.find((s) => s.id === stat.schoolId);
              const isMine = stat.schoolId === schoolId;
              return (
                <div
                  key={stat.schoolId}
                  className={`school-rank-row ${isMine ? 'mine' : ''}`}
                  style={isMine ? { borderColor: mySchool?.color } : {}}
                >
                  <span className="school-rank-pos">{getRankEmoji(idx + 1)}</span>
                  <div
                    className="school-rank-color"
                    style={{ background: school?.color ?? '#ccc' }}
                  />
                  <span className="school-rank-name">{school?.shortName ?? stat.schoolId}</span>
                  <div className="school-rank-bar-wrap">
                    <div
                      className="school-rank-bar"
                      style={{
                        width: `${Math.min((stat.avgScore / (stats[0]?.avgScore || 1)) * 100, 100)}%`,
                        background: school?.color ?? '#7c3aed',
                      }}
                    />
                  </div>
                  <span className="school-rank-score">
                    {stat.avgScore.toLocaleString()} <small>{scoreLabel}</small>
                  </span>
                  <span className="school-rank-count">{stat.count}명</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="result-retry-btn" onClick={onRetry}>
            다시 도전
          </button>
          <button className="result-change-btn" onClick={onChangeSchool}>
            학교 변경
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleResult;
