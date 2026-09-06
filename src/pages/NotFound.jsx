import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="not-found-page container text-center" style={{ padding: '8rem 1rem' }}>
      <span style={{ fontSize: '5rem', display: 'block', marginBottom: '1rem' }}>🌺</span>
      <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem', color: 'var(--color-accent, #8B6F47)' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Página no encontrada</h2>
      <p style={{ color: '#666', maxWidth: '450px', margin: '0 auto 2.5rem auto', lineHeight: 1.7 }}>
        Lo sentimos, la página que buscas no existe o ha sido movida. 
        ¿Qué tal si exploras nuestro catálogo de arreglos florales?
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', maxWidth: '220px' }}>
          Ir al Inicio
        </Link>
        <Link to="/catalogo" className="btn-checkout-email" style={{ display: 'inline-block', maxWidth: '220px' }}>
          Ver Catálogo
        </Link>
      </div>
    </div>
  );
};
