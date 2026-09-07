import React from 'react';
import { IconCheck } from './Icons';

export const Toast = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="toast" role="alert">
      <span className="toast-icon-wrap">
        <IconCheck size={14} />
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Cerrar notificación">×</button>
    </div>
  );
};
