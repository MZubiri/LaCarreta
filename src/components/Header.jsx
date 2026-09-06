import React, { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Header = ({ onOpenCart }) => {
  const { t } = useTranslation();
  const { getItemCount } = useContext(CartContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { phone } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const itemCount = getItemCount();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  const handleCartClick = (e) => {
    if (onOpenCart) {
      e.preventDefault();
      onOpenCart();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo" onClick={closeMenu}>
          Florería La Carreta
          <span className="header-logo-sub">Flores & Arreglos Artesanales</span>
        </Link>

        <nav className="header-nav desktop-only">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/catalogo" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {t('nav.catalog')}
          </NavLink>
          <NavLink to="/nosotros" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {t('nav.about')}
          </NavLink>
          <NavLink to="/contacto" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {t('nav.contact')}
          </NavLink>
        </nav>

        <div className="header-actions">
          <button 
            className="lang-toggle-btn" 
            onClick={toggleLanguage}
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <span className={language === 'es' ? 'lang-active' : ''}>ES</span>
            <span className="lang-divider">/</span>
            <span className={language === 'en' ? 'lang-active' : ''}>EN</span>
          </button>

          <button onClick={handleCartClick} className="action-btn" aria-label={t('nav.cart')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>

          <button className="mobile-hamburger mobile-only" onClick={toggleMenu} aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <nav className="mobile-nav-links">
              <NavLink to="/" onClick={closeMenu}>{t('nav.home')}</NavLink>
              <NavLink to="/catalogo" onClick={closeMenu}>{t('nav.catalog')}</NavLink>
              <NavLink to="/nosotros" onClick={closeMenu}>{t('nav.about')}</NavLink>
              <NavLink to="/contacto" onClick={closeMenu}>{t('nav.contact')}</NavLink>
              <button 
                onClick={() => { closeMenu(); onOpenCart(); }} 
                style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
              >
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem' }}>
                  {t('nav.cart')} ({itemCount})
                </span>
              </button>
            </nav>
            <div className="mobile-menu-footer">
              <p>Florería La Carreta</p>
              <p className="mobile-phone">📱 {phone}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
