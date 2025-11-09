// src/components/LoadingFallback.jsx
import React from 'react';
import './LoadingFallback.css';

const LoadingFallback = () => {
  return (
    <div className="loading-fallback">
      <div className="loading-content">
        <div className="spinner-container">
          <div className="spinner"></div>
          <div className="spinner-glow"></div>
        </div>
        <h2 className="loading-text">Cargando...</h2>
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;