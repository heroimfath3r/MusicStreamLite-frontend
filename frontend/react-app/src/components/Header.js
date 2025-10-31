import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="apple-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🎵</span>
          <span className="logo-text">MusicStream</span>
        </div>
        <nav className="nav-links">
          <a href="/" className="nav-link active">Inicio</a>
          <a href="/search" className="nav-link">Buscar</a>
          <a href="/library" className="nav-link">Tu Biblioteca</a>
        </nav>
      </div>
      
      <div className="header-right">
        <div className={`search-container ${isSearchFocused ? 'focused' : ''}`}>
          <input 
            type="text" 
            placeholder="Buscar en MusicStream..."
            className="search-input"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <button className="search-btn">🔍</button>
        </div>
        <div className="user-actions">
          <button className="notification-btn">🔔</button>
          <button className="user-avatar">👤</button>
        </div>
      </div>
    </header>
  );
};

export default Header;