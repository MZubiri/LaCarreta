import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      {/* Editorial Header */}
      <section className="about-hero-section">
        <div className="container">
          <span className="section-tag" style={{ textAlign: 'center' }}>Tradición & Pasión Floral</span>
          <h1 className="about-hero-title">{t('about.title')}</h1>
          <p className="about-hero-subtitle">{t('about.subtitle')}</p>
        </div>
      </section>

      {/* Main Split Story */}
      <section className="section container" style={{ paddingTop: '2rem' }}>
        <div className="about-split-grid">
          <div className="about-img-frame">
            <img src="/images/hero-floral.jpg" alt="Taller de Florería La Carreta en Caldas" className="about-img-main" />
            <span className="about-img-caption">Nuestro taller floral en Caldas, Antioquia</span>
          </div>

          <div className="about-story-text">
            <span className="section-tag">Nuestra Filosofía</span>
            <h2>Flores con alma nacidas en el Valle de Aburrá</h2>
            <p className="lead-paragraph">
              Florería La Carreta nació con la misión de transformar los sentimientos en obras de arte vivas. En el pintoresco municipio de Caldas, Antioquia, creamos arreglos que celebran el amor, la memoria y la alegría de la vida.
            </p>
            <p>
              Seleccionamos cada flor matutina directamente de los mejores cultivos locales de la región antioqueña. Creemos firmemente que una flor natural tiene el poder único de transmitir lo que las palabras a menudo no logran expresar.
            </p>

            <blockquote className="editorial-quote">
              "Cada tallo es seleccionado a mano; cada diseño cuenta una historia única para quien lo recibe."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Craftsmanship / Process Steps */}
      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Nuestro Proceso</span>
            <h2 className="section-title">El Arte detrás de cada Arreglo</h2>
            <p className="section-subtitle">Garantizamos máxima frescura y puntualidad en cada entrega.</p>
          </div>

          <div className="process-grid">
            <div className="process-card">
              <span className="process-number">01</span>
              <h3>Selección Matutina</h3>
              <p>Escogemos los botones más frescos cada mañana directamente en los cultivos de la región.</p>
            </div>

            <div className="process-card">
              <span className="process-number">02</span>
              <h3>Diseño Artesanal</h3>
              <p>Floristas expertos ensamblan a mano cada ramo con armonía de colores, aromas y texturas.</p>
            </div>

            <div className="process-card">
              <span className="process-number">03</span>
              <h3>Tarjeta a Mano</h3>
              <p>Redactamos tu mensaje dedicatoria con caligrafía delicada en papel de fibra natural.</p>
            </div>

            <div className="process-card">
              <span className="process-number">04</span>
              <h3>Entrega Cuidadosa</h3>
              <p>Transporte especializado a temperatura óptima en Caldas, Sabaneta, Envigado y Medellín.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="section container">
        <div className="section-header">
          <span className="section-tag">Nuestros Compromisos</span>
          <h2 className="section-title">{t('about.values')}</h2>
        </div>

        <div className="values-grid-3">
          <div className="luxury-value-card">
            <span className="luxury-card-icon">🌸</span>
            <h3>{t('about.freshness')}</h3>
            <p>{t('about.freshnessText')}</p>
          </div>

          <div className="luxury-value-card">
            <span className="luxury-card-icon">💐</span>
            <h3>{t('about.dedication')}</h3>
            <p>{t('about.dedicationText')}</p>
          </div>

          <div className="luxury-value-card">
            <span className="luxury-card-icon">🚀</span>
            <h3>{t('about.punctuality')}</h3>
            <p>{t('about.punctualityText')}</p>
          </div>
        </div>
      </section>

      {/* Location / Coverage Callout */}
      <section className="coverage-section">
        <div className="container">
          <div className="coverage-box">
            <div className="coverage-content">
              <span className="section-tag">Cobertura de Entrega</span>
              <h2>Entregas a domicilio en Antioquia</h2>
              <p>
                Llegamos a **Caldas**, Sabaneta, Envigado, Itagüí, La Estrella y la zona metropolitana de Medellín. Realizamos entregas el mismo día para pedidos confirmados antes del mediodía.
              </p>
              <div className="coverage-tags">
                <span className="coverage-tag">📍 Caldas</span>
                <span className="coverage-tag">📍 Sabaneta</span>
                <span className="coverage-tag">📍 Envigado</span>
                <span className="coverage-tag">📍 Itagüí</span>
                <span className="coverage-tag">📍 Medellín</span>
              </div>
            </div>
            <div className="coverage-action">
              <Link to="/catalogo" className="btn-primary">Explorar Catálogo</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
