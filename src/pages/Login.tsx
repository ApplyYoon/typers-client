import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('typers_auth', 'true');
    navigate('/home');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left panel */}
        <div className="auth-panel">
          <div className="auth-panel-blob blob1" />
          <div className="auth-panel-blob blob2" />
          <div className="auth-panel-content">
            <img src="/logo_nbg.png" alt="logo" className="auth-mascot" />
            <h2 className="auth-panel-title">Welcome Back</h2>
            <p className="auth-panel-sub">돌아오신 걸 환영합니다.</p>
          </div>
        </div>

        {/* Right form */}
        <div className="auth-form-section">
          <h1 className="auth-title">로그인</h1>
          <form onSubmit={handleSubmit} className="auth-form">
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
                className="auth-input"
              />
            </div>
            <button type="submit" className="auth-btn">로그인</button>
          </form>

          <p className="auth-divider">또는</p>

          <div className="social-btns">
            <button className="social-btn naver" title="네이버 로그인">N</button>
            <button className="social-btn kakao" title="카카오 로그인">K</button>
            <button className="social-btn google" title="구글 로그인">G</button>
          </div>

          <p className="auth-switch">
            계정이 없으신가요?{' '}
            <Link to="/register" className="auth-link">계정 만들기</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
