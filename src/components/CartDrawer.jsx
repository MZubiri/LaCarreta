import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { formatCOP } from '../utils/whatsapp';
import { IconBag, IconArrowRight, IconBotanical } from './Icons';

export const CartDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, getTotal } = useContext(CartContext);
  const { language } = useContext(LanguageContext);

  if (!isOpen) return null;

  const total = getTotal();

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">{t('cart.title')}</h3>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="text-center" style={{ padding: '3.5rem 1rem' }}>
              <div className="empty-cart-icon-wrap" style={{ margin: '0 auto 1.25rem auto', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}>
                <IconBotanical size={28} />
              </div>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{t('cart.emptyMsg')}</p>
            </div>
          ) : (
            items.map((item) => {
              const name = language === 'en' ? item.name_en : item.name_es;
              return (
                <div key={item.id} className="drawer-item">
                  <img src={item.image} alt={name} className="drawer-item-img" />
                  <div className="drawer-item-info">
                    <h4 className="drawer-item-title">{name}</h4>
                    <span className="drawer-item-price">{formatCOP(item.price)}</span>

                    <div className="drawer-item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn" aria-label="Disminuir">-</button>
                      <span className="qty-val">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn" aria-label="Aumentar">+</button>

                      <button onClick={() => removeItem(item.id)} className="drawer-item-remove">
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-subtotal">
              <span>{t('cart.total')}:</span>
              <span>{formatCOP(total)}</span>
            </div>
            <Link to="/carrito" onClick={onClose} className="drawer-checkout-btn btn-with-icon" style={{ justifyContent: 'center' }}>
              <span>Proceder al Pedido</span>
              <IconArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
