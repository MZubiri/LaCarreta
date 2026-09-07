import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import productsFallback from '../data/products.json';
import { api } from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Toast } from '../components/Toast';
import {
  IconWhatsApp,
  IconDelivery,
  IconBotanical,
  IconArtisan,
  IconConcierge,
  IconMapPin,
  IconChevronLeft,
  IconChevronRight,
  IconArrowRight
} from '../components/Icons';

export const Home = ({ onOpenCart }) => {
  const { t } = useTranslation();
  const { getWhatsAppLink } = useSiteSettings();
  const [activeSlide, setActiveSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState(() => 
    productsFallback.filter(p => p.featured).slice(0, 4)
  );

  const heroSlides = [
    {
      id: 1,
      image: '/images/hero-floral.jpg',
      tag: 'Colección Floral Antioquia',
      title: 'Arreglos florales hechos con pasión artesanal',
      link: '/catalogo'
    },
    {
      id: 2,
      image: '/images/roses-bouquet.jpg',
      tag: 'Rosas Premium Selección',
      title: 'Elegancia atemporal para momentos inolvidables',
      link: '/catalogo?category=ramos'
    },
    {
      id: 3,
      image: '/images/centerpiece-pink.jpg',
      tag: 'Centros de Mesa Exclusivos',
      title: 'Diseños únicos que transforman tus espacios',
      link: '/catalogo?category=arreglos'
    }
  ];

  // Auto-advance hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Fetch featured products from API
  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const data = await api.getFeaturedProducts();
        if (isMounted && data && data.length > 0) {
          setFeaturedProducts(data.slice(0, 4));
        }
      } catch (err) {
        console.warn("Could not load featured products from API, using fallback", err);
      }
    };
    fetchFeatured();
    return () => { isMounted = false; };
  }, []);

  const handleShowToast = (productName) => {
    setToastMessage(`"${productName}" ${t('common.addedToCart')}`);
    if (onOpenCart) onOpenCart();
    setTimeout(() => setToastMessage(''), 3000);
  };

  const occasions = [
    { key: 'birthday', label: t('home.birthday'), img: '/images/occasion-birthday.jpg', category: 'ramos' },
    { key: 'love', label: t('home.love'), img: '/images/occasion-love.jpg', category: 'ramos' },
    { key: 'wedding', label: t('home.wedding'), img: '/images/occasion-wedding.jpg', category: 'arreglos' },
    { key: 'condolence', label: t('home.condolence'), img: '/images/condolence-wreath.jpg', category: 'condolencias' }
  ];

  const coverageMunicipalities = [
    'Caldas',
    'La Estrella',
    'Sabaneta',
    'Envigado',
    'Itagüí',
    'Medellín Sur'
  ];

  return (
    <div className="home-page">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleShowToast} />

      {/* Hero Carousel */}
      <section className="hero-carousel">
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`carousel-slide ${idx === activeSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            <div className="carousel-overlay"></div>
            <div className="carousel-content">
              <span className="carousel-tag">{slide.tag}</span>
              <h1 className="carousel-title">{slide.title}</h1>
              <div className="carousel-actions">
                <Link to={slide.link} className="btn-hero-primary">
                  {t('hero.cta')}
                </Link>
                <a
                  href={getWhatsAppLink('Hola Florería La Carreta, me gustaría consultar por sus arreglos florales.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hero-secondary btn-hero-whatsapp"
                >
                  <IconWhatsApp size={18} />
                  <span>Atención por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Slider Controls */}
        <div className="carousel-controls">
          <button 
            onClick={() => setActiveSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length)} 
            className="carousel-arrow"
            aria-label="Diapositiva anterior"
          >
            <IconChevronLeft size={20} />
          </button>
          <div className="carousel-indicators">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`indicator ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Ir a diapositiva ${idx + 1}`}
              />
            ))}
          </div>
          <button 
            onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)} 
            className="carousel-arrow"
            aria-label="Siguiente diapositiva"
          >
            <IconChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Trust Badges / Value Props */}
      <section className="section-tight bg-cream value-props-section">
        <div className="container">
          <div className="value-props-grid">
            <div className="value-prop-card">
              <div className="value-prop-icon-badge">
                <IconDelivery size={24} />
              </div>
              <h4 className="value-prop-title">{t('valueProps.delivery')}</h4>
              <p className="value-prop-desc">{t('valueProps.deliveryText')}</p>
            </div>
            <div className="value-prop-card">
              <div className="value-prop-icon-badge">
                <IconBotanical size={24} />
              </div>
              <h4 className="value-prop-title">{t('valueProps.freshness')}</h4>
              <p className="value-prop-desc">{t('valueProps.freshnessText')}</p>
            </div>
            <div className="value-prop-card">
              <div className="value-prop-icon-badge">
                <IconArtisan size={24} />
              </div>
              <h4 className="value-prop-title">{t('valueProps.artisan')}</h4>
              <p className="value-prop-desc">{t('valueProps.artisanText')}</p>
            </div>
            <div className="value-prop-card">
              <div className="value-prop-icon-badge">
                <IconConcierge size={24} />
              </div>
              <h4 className="value-prop-title">{t('valueProps.whatsapp')}</h4>
              <p className="value-prop-desc">{t('valueProps.whatsappText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section container">
        <div className="section-header">
          <span className="section-tag">{t('home.curated')}</span>
          <h2 className="section-title">{t('home.featuredTitle')}</h2>
          <p className="section-desc">{t('home.featuredSubtitle')}</p>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleShowToast}
              onQuickView={(prod) => setSelectedProduct(prod)}
            />
          ))}
        </div>

        <div className="text-center" style={{ marginTop: '3.5rem' }}>
          <Link to="/catalogo" className="btn-secondary btn-with-icon">
            <span>{t('home.viewAllCatalog')}</span>
            <IconArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Shop by Occasion */}
      <section className="section bg-cream occasions-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t('home.moments')}</span>
            <h2 className="section-title">{t('home.occasionTitle')}</h2>
            <p className="section-desc">{t('home.occasionSubtitle')}</p>
          </div>

          <div className="occasions-grid">
            {occasions.map((item) => (
              <Link
                key={item.key}
                to={`/catalogo?category=${item.category}`}
                className="occasion-card"
                style={{ backgroundImage: `url('${item.img}')` }}
              >
                <div className="occasion-overlay"></div>
                <div className="occasion-content">
                  <h3 className="occasion-title">{item.label}</h3>
                  <span className="occasion-cta">
                    <span>{t('home.exploreCategory')}</span>
                    <IconArrowRight size={15} className="occasion-cta-arrow" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship / Story Preview */}
      <section className="section container artisan-section">
        <div className="artisan-story-grid">
          <div className="story-image-wrap">
            <img 
              src="/images/artisan-florist.jpg" 
              alt="Florista artesanal de La Carreta en Caldas" 
              className="story-image" 
              loading="lazy" 
            />
            <div className="story-badge-floating">
              <span className="story-badge-year">Desde Caldas</span>
              <span className="story-badge-sub">Antioquia</span>
            </div>
          </div>
          <div className="story-content">
            <span className="section-tag">{t('home.ourEssence')}</span>
            <h2 className="story-title">{t('home.storyTitle')}</h2>
            <p className="story-desc">
              {t('home.storyText')}
            </p>
            <div className="story-quote">
              <div className="story-quote-mark">“</div>
              <p className="story-quote-text">{t('home.quote')}</p>
              <span className="story-quote-author">— La Familia La Carreta, Caldas</span>
            </div>
            <Link to="/nosotros" className="btn-primary btn-with-icon" style={{ marginTop: '2rem', display: 'inline-flex' }}>
              <span>{t('home.readMore')}</span>
              <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Delivery Coverage Banner */}
      <section className="delivery-banner-section">
        <div className="container">
          <div className="delivery-banner-card">
            <div className="delivery-banner-body">
              <div className="delivery-icon-box">
                <IconMapPin size={28} />
              </div>
              <div className="delivery-text-content">
                <span className="delivery-tag">Cobertura Garantizada</span>
                <h3 className="delivery-title">Envíos directos en Caldas y el Sur del Valle de Aburrá</h3>
                <p className="delivery-desc">
                  Entregamos arreglos florales frescos, confeccionados el mismo día, con transporte especializado y cuidado absoluto.
                </p>
                <div className="delivery-chips">
                  {coverageMunicipalities.map((municipality, i) => (
                    <span key={i} className="delivery-chip">
                      {municipality}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="delivery-action-wrap">
              <Link to="/contacto" className="btn-delivery-action btn-with-icon">
                <span>Consultar Cobertura</span>
                <IconArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
