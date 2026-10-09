import React, { useEffect } from 'react';

export const ValidationModal = ({
  isOpen,
  onClose,
  title = 'Datos incompletos para tu pedido',
  message = 'Para coordinar la entrega de tu arreglo floral sin contratiempos, por favor completa los siguientes campos obligatorios:',
  missingFields = [],
  onFixField
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFix = (fieldId) => {
    if (onFixField) {
      onFixField(fieldId);
    } else {
      onClose();
    }
  };

  return (
    <div className="validation-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="validation-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="validation-modal-header">
          <div className="validation-modal-icon-badge">
            <span style={{ fontSize: '1.4rem' }}>📋</span>
          </div>
          <div style={{ flex: 1 }}>
            <span className="validation-modal-kicker">Atención Requerida</span>
            <h3 className="validation-modal-title">{title}</h3>
          </div>
          <button 
            type="button" 
            className="validation-modal-close" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div className="validation-modal-body">
          <p className="validation-modal-message">{message}</p>

          {missingFields && missingFields.length > 0 && (
            <div className="validation-fields-list">
              {missingFields.map((field, idx) => (
                <button
                  key={field.id || idx}
                  type="button"
                  className="validation-field-item"
                  onClick={() => handleFix(field.id)}
                  title={`Ir a ${field.label}`}
                >
                  <span className="validation-field-bullet">!</span>
                  <span className="validation-field-label">{field.label}</span>
                  <span className="validation-field-action">Completar →</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="validation-modal-footer">
          <button
            type="button"
            className="btn-primary validation-btn-primary"
            onClick={() => handleFix(missingFields[0]?.id)}
          >
            Completar Datos Ahora
          </button>
          <button
            type="button"
            className="validation-btn-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
