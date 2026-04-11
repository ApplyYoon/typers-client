import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register: React.FC = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/ranking');
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-reverse">
        {/* Left form */}
        <div className="auth-form-section">
          <h1 className="auth-title">계정 만들기</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <input
                type="text"
                placeholder="닉네임"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="auth-input"
              />
            </div>
            <div className="auth-input-group">
              <input
                type="email"
                placeholder="이메일"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="auth-input"
              />
            </div>
            <div className="auth-input-group">
              <input
                type="password"
                placeholder="비밀번호"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="auth-input"
              />
            </div>
            <div className="auth-input-group">
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="auth-input"
              />
            </div>
            <button type="submit" className="auth-btn">계정 만들기</button>
          </form>

          <p className="auth-divider">또는</p>

          <div className="social-btns">
            <button className="social-btn naver" title="네이버 로그인">N</button>
            <button className="social-btn kakao" title="카카오 로그인">K</button>
            <button className="social-btn google" title="구글 로그인">G</button>
          </div>

          <p className="auth-switch">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="auth-link">로그인</Link>
          </p>
        </div>

        {/* Right panel */}
        <div className="auth-panel">
          <div className="auth-panel-blob blob1" />
          <div className="auth-panel-blob blob2" />
          <div className="auth-panel-content">
            <div className="auth-mascot">🍇</div>
            <h2 className="auth-panel-title">Welcome to Typers</h2>
            <p className="auth-panel-sub">타이퍼즈에 함께해서 사이드 사합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
