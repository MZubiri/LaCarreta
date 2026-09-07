import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { formatCOP } from '../utils/whatsapp';
import { api } from '../services/api';
import { IconEye, IconBag } from './Icons';

export const ProductCard = ({ product, onAddToCart, onQuickView }) => {
  const { t } = useTranslation();
  const { addItem } = useContext(CartContext);
  const { language } = useContext(LanguageContext);

  const name = language === 'en' 
    ? (product.name_en || product.nameEn || product.name_es || product.nameEs) 
    : (product.name_es || product.nameEs || product.name_en || product.nameEn);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    if (onAddToCart) {
      onAddToCart(name);
    }
  };

  const handleQuick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const imageSrc = api.getImageUrl(product.image);

  return (
    <div className="product-card">
      <Link to={`/catalogo/${product.id}`} className="product-card-link">
        <div className="product-card-image-wrapper">
          <img
            src={imageSrc}
            alt={name}
            className="product-card-image"
            loading="lazy"
            onError={(e) => { e.target.src = '/images/roses-bouquet.jpg'; }}
          />
          {product.featured && <span className="featured-badge">Destacado</span>}
          
          <div className="product-card-overlay">
            <button onClick={handleQuick} className="btn-card-quick btn-with-icon">
              <IconEye size={15} />
              <span>Vista Rápida</span>
            </button>
          </div>
        </div>

        <div className="product-card-info">
          <span className="product-card-category">{product.category}</span>
          <h3 className="product-card-name">{name}</h3>
          <div className="product-card-footer">
            <span className="product-card-price">{formatCOP(product.price)}</span>
            <button onClick={handleAdd} className="btn-add-cart btn-with-icon" aria-label="Agregar al carrito">
              <IconBag size={14} />
              <span>{t('catalog.addToCart')}</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};
