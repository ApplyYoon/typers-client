import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const navItems = [
    { label: '🏫 학교대항전', path: '/battle' },
    { label: '타이핑', path: '/typing' },
    {
      label: '커스텀',
      path: '/custom',
      submenu: [
        { label: '나만의 커스텀', items: ['캐릭터 커스텀', '효과음 On/Off', '배경 커스텀'] },
        { label: '커스텀 제작', items: ['나만의 커서'] },
        { label: '랭킹', items: ['랭킹'] },
      ],
    },
    { label: '랭킹', path: '/ranking' },
    { label: '창작마당', path: '/create' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/grape-logo.png" alt="Typers" className="navbar-logo-img" />
          <span>Typers</span>
        </Link>

        <div className="navbar-links">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="navbar-item"
              onMouseEnter={() => item.submenu && setActiveMenu(item.label)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                to={item.path || '#'}
                className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
              {item.submenu && activeMenu === item.label && (
                <div className="navbar-dropdown">
                  {item.submenu.map((group) => (
                    <div key={group.label} className="dropdown-group">
                      <p className="dropdown-group-title">{group.label}</p>
                      {group.items.map((sub) => (
                        <a key={sub} href="#" className="dropdown-item">
                          {sub}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="navbar-right">
          <button className="navbar-icon-btn">
            <span>📢</span>
          </button>
          <Link to="/profile" className="navbar-user">
            <span className="navbar-avatar">🍇</span>
            <span className="navbar-username">1KO</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
