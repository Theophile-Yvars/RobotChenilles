import React from 'react';
import '../styles/Header.css';

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="robot-icon">🤖</div>
          <div className="title-section">
            <h1>RobotChenilles</h1>
            <p className="subtitle">Contrôle à distance</p>
          </div>
        </div>
        
        <div className="header-info">
          <div className="status-indicators">
            <div className="indicator">
              <span className="indicator-label">Live</span>
              <div className="live-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;