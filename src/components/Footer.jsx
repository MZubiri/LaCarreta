import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Footer = () => {
  const { t } = useTranslation();
  const { address, city, phone, whatsApp, instagram, facebook, scheduleWeekdays, scheduleWeekends, getWhatsAppLink } = useSiteSettings();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <h3 className="footer-title">Florería La Carreta</h3>
          <p className="footer-tagline">{t('footer.tagline')}</p>
          <p className="footer-address">📍 {address}, {city}</p>
          <p className="footer-phone">📱 WhatsApp: {phone}</p>
        </div>

        <div className="footer-col">
          <h4>{t('footer.quickLinks')}</h4>
          <ul className="footer-links">
            <li><Link to="/">{t('nav.home')}</Link></li>
            <li><Link to="/catalogo">{t('nav.catalog')}</Link></li>
            <li><Link to="/nosotros">{t('nav.about')}</Link></li>
            <li><Link to="/contacto">{t('nav.contact')}</Link></li>
            <li><Link to="/carrito">{t('nav.cart')}</Link></li>

          </ul>
        </div>

        <div className="footer-col">
          <h4>{t('footer.schedule')}</h4>
          <p className="footer-schedule-text">
            {scheduleWeekdays}<br />
            {scheduleWeekends}
          </p>
        </div>

        <div className="footer-col">
          <h4>{t('footer.followUs')}</h4>
          <div className="social-links">
            <a href={getWhatsAppLink('Hola, me gustaría información sobre sus arreglos florales')} target="_blank" rel="noopener noreferrer" className="social-icon">WhatsApp</a>
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="social-icon">Instagram</a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="social-icon">Facebook</a>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Florería La Carreta. {t('footer.rights')}</p>
        <div className="footer-legal-links" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          <Link to="/terminos" style={{ color: '#999', marginRight: '1.5rem' }}>Términos y Condiciones</Link>
          <Link to="/privacidad" style={{ color: '#999' }}>Política de Privacidad</Link>
        </div>
      </div>
    </footer>
  );
};
