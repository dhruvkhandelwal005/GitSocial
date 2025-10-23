import React, { useEffect } from 'react';

export default function Loader({ message = 'Loading...' }) {
  useEffect(() => {
    // Inject keyframes only once
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // dark overlay
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    color: '#f8fafc',
    fontFamily: 'Inter, sans-serif',
  };

  const loaderStyle = {
    width: '60px',
    height: '60px',
    border: '6px solid transparent',
    borderTop: '6px solid #6366f1', // gradient-like color
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 15px #6366f1', // subtle glow
    marginBottom: '15px',
  };

  const pulseStyle = {
    fontSize: '16px',
    animation: 'pulse 1.5s ease-in-out infinite',
    textAlign: 'center',
    color: '#e0e7ff',
  };

  return (
    <div style={overlayStyle}>
      <div style={loaderStyle}></div>
      <div style={pulseStyle}>{message}</div>
    </div>
  );
}
