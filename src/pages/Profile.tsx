import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import './Profile.css';

const WPM_DATA = [
  { date: '4/11', wpm: 120 },
  { date: '4/12', wpm: 135 },
  { date: '4/13', wpm: 128 },
  { date: '4/14', wpm: 145 },
  { date: '4/15', wpm: 140 },
  { date: '4/16', wpm: 155 },
  { date: '4/17', wpm: 162 },
  { date: '4/18', wpm: 158 },
  { date: '4/19', wpm: 170 },
  { date: '4/20', wpm: 175 },
  { date: '4/21', wpm: 168 },
];

const ACC_DATA = [
  { date: '4/11', accuracy: 91 },
  { date: '4/12', accuracy: 93 },
  { date: '4/13', accuracy: 90 },
  { date: '4/14', accuracy: 94 },
  { date: '4/15', accuracy: 95 },
  { date: '4/16', accuracy: 93 },
  { date: '4/17', accuracy: 96 },
  { date: '4/18', accuracy: 97 },
  { date: '4/19', accuracy: 95 },
  { date: '4/20', accuracy: 98 },
  { date: '4/21', accuracy: 96 },
];

const MONTHLY_DATA = [
  { month: '24.1', wpm: 120, accuracy: 88 },
  { month: '24.2', wpm: 130, accuracy: 90 },
  { month: '24.3', wpm: 140, accuracy: 91 },
  { month: '24.4', wpm: 135, accuracy: 89 },
  { month: '24.5', wpm: 150, accuracy: 93 },
  { month: '24.6', wpm: 155, accuracy: 94 },
  { month: '24.7', wpm: 160, accuracy: 95 },
  { month: '24.8', wpm: 165, accuracy: 96 },
];

type ChartRange = '1주' | '1달' | '분기별' | '상반기' | '전체';

const Profile: React.FC = () => {
  const [wpmRange, setWpmRange] = useState<ChartRange>('1주');
  const [accRange, setAccRange] = useState<ChartRange>('1주');

  const ranges: ChartRange[] = ['1주', '1달', '분기별', '상반기', '전체'];

  const LEVEL_XP = 3400;
  const NEXT_XP = 5000;
  const xpPct = (LEVEL_XP / NEXT_XP) * 100;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header card */}
        <div className="profile-header-card">
          <div className="profile-mascot-wrap">
            <div className="profile-mascot-bg" />
            <img src="/logo_nbg.png" alt="logo" className="profile-mascot" />
          </div>
          <div className="profile-info">
            <h2 className="profile-username">Ppodoomii83</h2>
            <div className="profile-level-row">
              <span className="profile-level-label">다음 티어까지</span>
              <div className="profile-xp-bar">
                <div className="profile-xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
              <span className="profile-xp-text">{LEVEL_XP.toLocaleString()}</span>
              <span className="profile-xp-max">{NEXT_XP.toLocaleString()}</span>
            </div>
            <p className="profile-attendance">출석</p>
          </div>

          {/* Grape grid */}
          <div className="grape-grid">
            {Array.from({ length: 11 }).map((_, i) => (
              <img key={i} src="/logo_nbg.png" alt="logo" className="grape-item" />
            ))}
          </div>
        </div>

        {/* WPM Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">타수 그래프(WPM)</h3>
            <div className="chart-ranges">
              {ranges.map((r) => (
                <button
                  key={r}
                  className={`range-btn ${wpmRange === r ? 'active' : ''}`}
                  onClick={() => setWpmRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={WPM_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="#8758FF"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#8758FF' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">정확도 그래프</h3>
            <div className="chart-ranges">
              {ranges.map((r) => (
                <button
                  key={r}
                  className={`range-btn ${accRange === r ? 'active' : ''}`}
                  onClick={() => setAccRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ACC_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[80, 100]} unit="%" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(v: number | undefined) => v !== undefined ? [`${v}%`, '정확도'] : ['', '']}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#03CF5D"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#03CF5D' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly bar chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">나의 활동 - 2024년 8월 조사</h3>
          </div>
          <div className="monthly-chart-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="wpm" fill="#8758FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accuracy" fill="#03CF5D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="monthly-mascot">
              <img src="/logo_nbg.png" alt="logo" className="monthly-mascot-emoji" />
              <div className="monthly-speech-bubble">
                <p>와, 열심 먹으려<br />Ppodoomii83!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
