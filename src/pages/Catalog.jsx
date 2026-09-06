import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import productsFallback from '../data/products.json';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Toast } from '../components/Toast';
import { formatCOP } from '../utils/whatsapp';

export const Catalog = ({ onOpenCart }) => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState(productsFallback);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const autocompleteRef = useRef(null);

  // Load products and categories from API
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodsData, catsData] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        if (isMounted) {
          if (prodsData && prodsData.length > 0) setProducts(prodsData);
          if (catsData && catsData.length > 0) setCategoriesList(catsData);
        }
      } catch (err) {
        console.warn("Could not load products from API, using fallback data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Built dynamic category pills
  const categories = useMemo(() => {
    if (categoriesList.length > 0) {
      return categoriesList.map(c => ({
        id: c.slug === 'todos' ? 'all' : c.slug,
        label: i18n.language === 'en' ? (c.nameEn || c.nameEs) : (c.nameEs || c.nameEn),
        icon: c.icon
      }));
    }
    return [
      { id: 'all', label: t('catalog.all') },
      { id: 'ramos', label: t('catalog.ramos') },
      { id: 'arreglos', label: t('catalog.arreglos') },
      { id: 'plantas', label: t('catalog.plantas') },
      { id: 'premium', label: t('catalog.premium') },
      { id: 'condolencias', label: t('catalog.condolencias') }
    ];
  }, [categoriesList, i18n.language, t]);

  // Close autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  // Autocomplete Suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return products
      .filter((p) => {
        const nameEs = (p.name_es || p.nameEs || '').toLowerCase();
        const nameEn = (p.name_en || p.nameEn || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return nameEs.includes(term) || nameEn.includes(term);
      })
      .slice(0, 4);
  }, [searchTerm, products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Filter out inactive products if isActive flag exists
        if (product.isActive === false) return false;

        const pCat = (product.category || '').toLowerCase();
        const matchesCategory = activeCategory === 'all' || pCat === activeCategory.toLowerCase();

        const nameEs = (product.name_es || product.nameEs || '').toLowerCase();
        const nameEn = (product.name_en || product.nameEn || '').toLowerCase();
        const descEs = (product.description_es || product.descriptionEs || '').toLowerCase();
        const term = searchTerm.toLowerCase();

        const matchesSearch = !term || nameEs.includes(term) || nameEn.includes(term) || descEs.includes(term);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') return a.price - b.price;
        if (sortOrder === 'desc') return b.price - a.price;
        return 0;
      });
  }, [products, activeCategory, searchTerm, sortOrder]);

  const handleShowToast = (productName) => {
    setToastMessage(`"${productName}" ${t('common.addedToCart')}`);
    if (onOpenCart) onOpenCart();
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="catalog-page">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleShowToast} />

      <header className="page-header" style={{ textAlign: 'center', padding: '4rem 1rem 2rem 1rem' }}>
        <span className="section-tag">Catálogo Exclusivo</span>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)' }}>{t('catalog.title')}</h1>
        <p style={{ color: '#666', fontSize: '0.95rem', maxWidth: '550px', margin: '0.5rem auto 0 auto' }}>
          {t('catalog.subtitle')}
        </p>
      </header>

      {/* Persistent Filter Bar */}
      <div className="catalog-toolbar">
        <div className="container toolbar-container">
          {/* Autocomplete Search Input */}
          <div className="search-autocomplete-wrap" ref={autocompleteRef}>
            <div className="search-input-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder={t('catalog.search')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowAutocomplete(true);
                }}
                onFocus={() => setShowAutocomplete(true)}
                className="search-input-field"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && suggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {suggestions.map((item) => {
                  const title = i18n.language === 'en' ? (item.name_en || item.nameEn) : (item.name_es || item.nameEs);
                  return (
                    <div
                      key={item.id}
                      className="autocomplete-item"
                      onClick={() => {
                        setSelectedProduct(item);
                        setShowAutocomplete(false);
                      }}
                    >
                      <img
                        src={api.getImageUrl(item.image)}
                        alt={title}
                        className="autocomplete-thumb"
                        onError={(e) => { e.target.src = '/images/roses-bouquet.jpg'; }}
                      />
                      <div className="autocomplete-info">
                        <span className="autocomplete-title">{title}</span>
                        <span className="autocomplete-price">{formatCOP(item.price)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="category-pills-bar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.icon ? `${cat.icon} ` : ''}{cat.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-dropdown"
          >
            <option value="default">Recomendados</option>
            <option value="asc">{t('catalog.lowToHigh')}</option>
            <option value="desc">{t('catalog.highToLow')}</option>
          </select>
        </div>
      </div>

      {/* Main Product Grid */}
      <div className="container" style={{ paddingBottom: '6rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#666' }}>
            <div className="loading-spinner" style={{ margin: 'auto', marginBottom: '1rem' }}></div>
            <p>Cargando arreglos florales frescos...</p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleShowToast}
                onQuickView={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center" style={{ padding: '5rem 1rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
            <h3>{t('catalog.noResults')}</h3>
            <p style={{ color: '#666', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Intenta con otros términos de búsqueda o selecciona otra categoría.
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
              className="btn-primary"
              style={{ display: 'inline-block', maxWidth: '240px' }}
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
