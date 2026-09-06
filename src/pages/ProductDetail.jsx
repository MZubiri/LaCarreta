import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import productsFallback from '../data/products.json';
import { api } from '../services/api';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ProductCard } from '../components/ProductCard';
import { Toast } from '../components/Toast';
import { formatCOP } from '../utils/whatsapp';

export const ProductDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { addItem } = useContext(CartContext);
  const { language } = useContext(LanguageContext);
  const { getWhatsAppLink } = useSiteSettings();

  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [product, setProduct] = useState(() => 
    productsFallback.find((p) => p.id === parseInt(id, 10))
  );
  const [allProducts, setAllProducts] = useState(productsFallback);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [prodData, allData] = await Promise.all([
          api.getProduct(id),
          api.getProducts()
        ]);
        if (isMounted) {
          if (prodData) setProduct(prodData);
          if (allData && allData.length > 0) setAllProducts(allData);
        }
      } catch (err) {
        console.warn("Could not fetch product from API, using fallback", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  if (!product && !loading) {
    return (
      <div className="section container text-center" style={{ padding: '80px 20px' }}>
        <h2>Arreglo floral no encontrado</h2>
        <Link to="/catalogo" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', maxWidth: '240px' }}>
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const name = language === 'en' 
    ? (product?.name_en || product?.nameEn || product?.name_es || product?.nameEs) 
    : (product?.name_es || product?.nameEs || product?.name_en || product?.nameEn);

  const description = language === 'en' 
    ? (product?.description_en || product?.descriptionEn || product?.description_es || product?.descriptionEs) 
    : (product?.description_es || product?.descriptionEs || product?.description_en || product?.descriptionEn);

  // Occasions parsing
  let occasions = [];
  if (language === 'en') {
    if (Array.isArray(product?.occasion_en)) occasions = product.occasion_en;
    else if (typeof product?.occasionEn === 'string' && product.occasionEn.startsWith('[')) {
      try { occasions = JSON.parse(product.occasionEn); } catch {}
    }
  } else {
    if (Array.isArray(product?.occasion_es)) occasions = product.occasion_es;
    else if (typeof product?.occasionEs === 'string' && product.occasionEs.startsWith('[')) {
      try { occasions = JSON.parse(product.occasionEs); } catch {}
    }
  }

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setToastMessage(`"${name}" ${t('common.addedToCart')}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDirectWhatsApp = () => {
    if (!product) return;
    const text = `Hola Florería La Carreta en Caldas, me interesa pedir: *${name}* (Cantidad: ${quantity}) - Total: ${formatCOP(product.price * quantity)}. ¿Podrían informarme disponibilidad para entrega a domicilio?`;
    window.open(getWhatsAppLink(text), '_blank');
  };

  const relatedProducts = allProducts
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 3);

  const imageSrc = api.getImageUrl(product?.image);

  return (
    <div className="product-detail-page section container">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <nav className="breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.85rem', color: '#888' }}>
        <Link to="/">{t('nav.home')}</Link> / <Link to="/catalogo">{t('nav.catalog')}</Link> / <span>{name}</span>
      </nav>

      <div className="about-split-grid" style={{ alignItems: 'flex-start', margin: 0 }}>
        <div className="product-card-image-wrapper" style={{ aspectRatio: '4/5' }}>
          <img
            src={imageSrc}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/images/roses-bouquet.jpg'; }}
          />
        </div>

        <div className="modal-details" style={{ padding: 0 }}>
          <span className="product-card-category">{(product?.category || '').toUpperCase()}</span>
          <h1 className="modal-title" style={{ fontSize: '2.75rem' }}>{name}</h1>
          <div className="modal-price" style={{ fontSize: '1.5rem', margin: '0.75rem 0 1.5rem 0' }}>
            {formatCOP(product?.price || 0)}
          </div>

          <p className="modal-desc" style={{ fontSize: '0.95rem', marginBottom: '2rem' }}>{description}</p>

          {occasions && occasions.length > 0 && (
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Ideal para:
              </span>
              {occasions.map((occ, idx) => (
                <span key={idx} className="coverage-tag" style={{ color: '#1A1A1A', borderColor: '#E8E6E1' }}>
                  {occ}
                </span>
              ))}
            </div>
          )}

          <div className="modal-actions" style={{ marginBottom: '1.5rem' }}>
            <div className="quantity-control" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn">-</button>
              <span className="qty-val">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="qty-btn">+</button>
            </div>

            <button onClick={handleAddToCart} className="btn-primary" style={{ padding: '0 2rem' }}>
              + {t('catalog.addToCart')}
            </button>
          </div>

          <button onClick={handleDirectWhatsApp} className="btn-whatsapp-direct" style={{ width: '100%' }}>
            📱 Pedir Directo por WhatsApp
          </button>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '5rem', borderTop: '1px solid #E8E6E1', paddingTop: '3rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>
            También te podría interesar
          </h3>
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
