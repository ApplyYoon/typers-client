import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

/* ── Typewriter hook ─────────────────────────────────────────
   `\n` in text will render as <br />.
   Sequence: delay → type char-by-char → cursor goes solid for
   600ms → cursor hides → onDone fires.
────────────────────────────────────────────────────────────── */
interface TWOptions {
  speed?: number;   // ms per character
  delay?: number;   // ms before starting
  onDone?: () => void;
}

function useTypewriter(text: string, active: boolean, opts: TWOptions = {}) {
  const { speed = 48, delay = 0, onDone } = opts;
  const [count, setCount]           = useState(0);
  const [cursorHidden, setCursorHidden] = useState(false);
  const cbRef = useRef(onDone);
  cbRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    setCount(0);
    setCursorHidden(false);

    let iv: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      iv = setInterval(() => {
        setCount(c => {
          const next = c + 1;
          if (next >= text.length) {
            clearInterval(iv);
            setTimeout(() => {
              setCursorHidden(true);
              cbRef.current?.();
            }, 600);
            return text.length;
          }
          return next;
        });
      }, speed);
    }, delay);

    return () => { clearTimeout(t); clearInterval(iv); };
  }, [active]);   // eslint-disable-line react-hooks/exhaustive-deps

  return {
    displayed: text.slice(0, count),
    isTyping: count < text.length,
    cursorHidden,
  };
}

/* ── Scroll-trigger hook ─────────────────────────────────── */
function useScrollTrigger(threshold = 0.2) {
  const ref       = useRef<HTMLDivElement>(null);
  const [on, set] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { set(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, on] as const;
}

/* ── TypewriterText component ────────────────────────────── */
interface TWProps {
  text: string;
  active: boolean;
  speed?: number;
  delay?: number;
  onDone?: () => void;
}

const TypewriterText: React.FC<TWProps> = ({ text, active, speed, delay, onDone }) => {
  const { displayed, isTyping, cursorHidden } = useTypewriter(text, active, { speed, delay, onDone });

  // Render \n as <br>
  const parts = displayed.split('\n');

  return (
    <>
      {parts.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))}
      {active && !cursorHidden && (
        <span className={`tw-cursor${!isTyping ? ' tw-cursor-end' : ''}`} />
      )}
    </>
  );
};

/* ── Static data ─────────────────────────────────────────── */
const FEATURES = [
  {
    num: '01',
    title: '커스텀 사전',
    desc: '개발 용어, 외국어, 논문 키워드 — 내가 필요한 단어로 직접 사전을 만들고 반복 연습하세요.',
  },
  {
    num: '02',
    title: '성장 대시보드',
    desc: 'CPM 추세, 요일별 히트맵, 정확도 변화를 시각화해 성장을 데이터로 실감하세요.',
  },
  {
    num: '03',
    title: '학교대항전',
    desc: '전국 학교를 선택하고 65초 한국어·영어 혼합 배틀로 학교의 명예를 건 경쟁을 펼치세요.',
  },
];

const STATS = [
  { value: '65초', label: '혼합 배틀 제한 시간' },
  { value: '200+', label: '등록된 대학교 수' },
  { value: '한+영', label: '지원 언어' },
  { value: '무료', label: '이용 요금' },
];

/* ── Landing page ────────────────────────────────────────── */
const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Hero: three sequential phases
  const [h1On, setH1On]       = useState(false);
  const [h2On, setH2On]       = useState(false);
  const [ctaShow, setCtaShow] = useState(false);

  // Feature section
  const [featRef, featIn]     = useScrollTrigger();
  const [featType, setFeatType]   = useState(false);
  const [featCards, setFeatCards] = useState(false);

  // Stats section
  const [statsRef, statsIn] = useScrollTrigger();

  // CTA dark section
  const [ctaSecRef, ctaSecIn] = useScrollTrigger();
  const [ctaType, setCtaType] = useState(false);
  const [ctaBtns, setCtaBtns] = useState(false);

  // Kick off hero on mount
  useEffect(() => {
    const t = setTimeout(() => setH1On(true), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { if (featIn)   setFeatType(true);  }, [featIn]);
  useEffect(() => { if (ctaSecIn) setCtaType(true);   }, [ctaSecIn]);

  return (
    <div className="landing">

      {/* ── Nav ── */}
      <header className="landing-nav">
        <span className="landing-nav-logo">Typers</span>
        <div className="landing-nav-actions">
          <button className="landing-nav-login" onClick={() => navigate('/login')}>로그인</button>
          <button className="landing-nav-cta"   onClick={() => navigate('/register')}>무료로 시작</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-inner">
          <h1 className="hero-h1">
            <TypewriterText
              text="타이핑 연습, 데이터로 시작하다"
              active={h1On}
              speed={48}
              onDone={() => setH2On(true)}
            />
          </h1>

          {/* h2 reserves height even before typing starts */}
          <h2 className="hero-h2">
            <TypewriterText
              text={"당신의 성장을\n눈으로 확인하세요"}
              active={h2On}
              speed={54}
              delay={120}
              onDone={() => setCtaShow(true)}
            />
          </h2>

          <div className={`hero-cta${ctaShow ? ' visible' : ''}`}>
            <button className="btn-landing-primary" onClick={() => navigate('/register')}>
              무료로 시작하기
            </button>
            <button className="btn-landing-ghost" onClick={() => navigate('/battle')}>
              학교대항전 체험
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <span className="scroll-hint-bar" />
          <span className="scroll-hint-label">scroll</span>
        </div>
      </section>

      {/* ── Feature section ── */}
      <section className="landing-features">
        <div className="features-inner" ref={featRef}>
          <p className="feature-quote">
            <TypewriterText
              text="당신의 꾸준함이 가장 아름다운 재능입니다."
              active={featType}
              speed={50}
              onDone={() => setFeatCards(true)}
            />
          </p>

          <div className={`feature-grid${featCards ? ' visible' : ''}`}>
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                className="feature-card"
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                <span className="feature-num">{f.num}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="landing-stats">
        <div
          ref={statsRef}
          className={`stats-grid${statsIn ? ' revealed' : ''}`}
        >
          {STATS.map((s, i) => (
            <div
              key={s.value}
              className="stat-item"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA (dark) ── */}
      <section className="landing-cta">
        <div ref={ctaSecRef}>
          <h2 className="landing-cta-title">
            <TypewriterText
              text="지금, 시작하세요"
              active={ctaType}
              speed={70}
              onDone={() => setCtaBtns(true)}
            />
          </h2>
          <p className={`landing-cta-sub${ctaBtns ? ' visible' : ''}`}>
            회원가입 없이도 학교대항전을 체험할 수 있습니다.
          </p>
          <div className={`landing-cta-btns${ctaBtns ? ' visible' : ''}`}>
            <button className="btn-landing-primary large" onClick={() => navigate('/register')}>회원가입</button>
            <button className="btn-landing-ghost  large" onClick={() => navigate('/battle')}>로그인 없이 체험</button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span className="landing-footer-logo">Typers</span>
        <span className="landing-footer-copy">© 2026 Typers. All rights reserved.</span>
      </footer>

    </div>
  );
};

export default Landing;
