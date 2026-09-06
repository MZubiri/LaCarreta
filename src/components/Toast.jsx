import React from 'react';

export const Toast = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="toast">
      <span className="toast-icon">🌸</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};
