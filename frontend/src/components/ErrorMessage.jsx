import React from 'react';

export function ErrorMessage({ message, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-message">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
        {onClose && (
          <button className="error-close" onClick={onClose}>×</button>
        )}
      </div>
    </div>
  );
}

