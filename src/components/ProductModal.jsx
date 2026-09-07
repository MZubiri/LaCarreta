import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { formatCOP } from '../utils/whatsapp';
import { api } from '../services/api';
import { IconWhatsApp, IconBag } from './Icons';

export const ProductModal = ({ product, onClose, onAddToCart }) => {
  const { t } = useTranslation();
  const { addItem } = useContext(CartContext);
  const { language } = useContext(LanguageContext);
  const { getWhatsAppLink } = useSiteSettings();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const name = language === 'en' 
    ? (product.name_en || product.nameEn || product.name_es || product.nameEs) 
    : (product.name_es || product.nameEs || product.name_en || product.nameEn);

  const description = language === 'en' 
    ? (product.description_en || product.descriptionEn || product.description_es || product.descriptionEs) 
    : (product.description_es || product.descriptionEs || product.description_en || product.descriptionEn);

  const handleAdd = () => {
    addItem(product, quantity);
    if (onAddToCart) onAddToCart(name);
    onClose();
  };

  const handleWhatsApp = () => {
    const text = `Hola Florería La Carreta, quisiera consultar por el arreglo: *${name}* (${formatCOP(product.price)}).`;
    window.open(getWhatsAppLink(text), '_blank');
  };

  const imageSrc = api.getImageUrl(product.image);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="modal-image-wrap">
          <img
            src={imageSrc}
            alt={name}
            onError={(e) => { e.target.src = '/images/roses-bouquet.jpg'; }}
          />
        </div>

        <div className="modal-details">
          <span className="product-card-category">{(product.category || '').toUpperCase()}</span>
          <h2 className="modal-title">{name}</h2>
          <div className="modal-price">{formatCOP(product.price)}</div>
          <p className="modal-desc">{description}</p>

          <div className="modal-actions">
            <div className="quantity-control" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn" aria-label="Disminuir cantidad">-</button>
              <span className="qty-val">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="qty-btn" aria-label="Aumentar cantidad">+</button>
            </div>

            <button onClick={handleAdd} className="btn-primary btn-with-icon">
              <IconBag size={16} />
              <span>{t('catalog.addToCart')}</span>
            </button>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <button onClick={handleWhatsApp} className="btn-whatsapp-direct btn-with-icon" style={{ width: '100%', justifyContent: 'center' }}>
              <IconWhatsApp size={18} />
              <span>Consultar por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
