import React, { useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { generateWhatsAppLink, formatCOP } from '../utils/whatsapp';
import { api } from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ValidationModal } from '../components/ValidationModal';

export const DELIVERY_ZONES = [
  { id: 'medellin_sur', name: 'Medellín Sur (El Poblado, Guayabal)', fee: 18000, description: 'Zona Sur de Medellín' },
  { id: 'medellin_centro', name: 'Medellín (Laureles, Belén, Centro, Estadio)', fee: 22000, description: 'Zona Centro / Occidente de Medellín' },
  { id: 'medellin_norte', name: 'Medellín Norte / Robledo / Castilla', fee: 25000, description: 'Zona Norte de Medellín' },
  { id: 'envigado', name: 'Envigado', fee: 16000, description: 'Área Metropolitana' },
  { id: 'sabaneta', name: 'Sabaneta', fee: 12000, description: 'Área Metropolitana Sur' },
  { id: 'itagui', name: 'Itagüí', fee: 14000, description: 'Área Metropolitana' },
  { id: 'la_estrella', name: 'La Estrella', fee: 10000, description: 'Área Metropolitana Sur' },
  { id: 'caldas', name: 'Caldas', fee: 8000, description: 'Área Metropolitana Sur' },
  { id: 'recoger', name: 'Recoger en Florería (Punto de Entrega)', fee: 0, description: '¡Gratis! Sin costo de envío' }
];

export const CARD_STYLES = [
  { id: 'clasica', name: '🌸 Clásica Botánica', tag: 'Elegante y atemporal', bg: '#FFFBF5', border: '#D4AF37', text: '#2C1810', icon: '🌸' },
  { id: 'amor', name: '❤️ Amor & Romance', tag: 'Rosas & Pasión', bg: '#FFF0F3', border: '#C9184A', text: '#590D22', icon: '❤️' },
  { id: 'cumpleanos', name: '🎉 Cumpleaños & Fiesta', tag: 'Alegre y festiva', bg: '#FEF9C3', border: '#CA8A04', text: '#713F12', icon: '🎉' },
  { id: 'condolencias', name: '🕊️ Condolencias & Paz', tag: 'Sobria y respetuosa', bg: '#F8FAFC', border: '#94A3B8', text: '#1E293B', icon: '🕊️' },
  { id: 'aniversario', name: '✨ Aniversario & Logros', tag: 'Celebración especial', bg: '#F3E8FF', border: '#9333EA', text: '#581C87', icon: '✨' },
  { id: 'anonimo', name: '💌 Sorpresa Secreta', tag: 'Entrega confidencial', bg: '#FDF2F8', border: '#DB2777', text: '#831843', icon: '💌' }
];

export const Cart = () => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useContext(CartContext);
  const { language } = useContext(LanguageContext);
  const { whatsApp, deliveryNotes } = useSiteSettings();

  // Current Date Helper for Colombia
  const todayStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [deliveryZoneId, setDeliveryZoneId] = useState('medellin_sur');
  const [cardStyleId, setCardStyleId] = useState('clasica');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    date: todayStr,
    time: 'Jornada Mañana (8:00 AM - 1:00 PM)',
    cardSender: '',
    message: '',
    notes: ''
  });

  const [orderSent, setOrderSent] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  // Validation Modal state to replace browser alert
  const [validationModal, setValidationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    missingFields: [],
    firstFieldId: null
  });

  // Delivery zone selected
  const activeZone = useMemo(() => {
    return DELIVERY_ZONES.find(z => z.id === deliveryZoneId) || DELIVERY_ZONES[0];
  }, [deliveryZoneId]);

  // Card style selected
  const activeCardStyle = useMemo(() => {
    return CARD_STYLES.find(c => c.id === cardStyleId) || CARD_STYLES[0];
  }, [cardStyleId]);

  // Check cut-off rules for today
  const isSelectedToday = formData.date === todayStr;
  const currentHour = new Date().getHours();
  const isMorningCutoff = isSelectedToday && currentHour >= 13;
  const isEveningCutoff = isSelectedToday && currentHour >= 17;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-switch away from morning if user selects today in the afternoon
      if (name === 'date' && value === todayStr && currentHour >= 13 && next.time.includes('Mañana')) {
        next.time = 'Jornada Tarde (2:00 PM - 6:00 PM)';
      }
      return next;
    });
  };

  const validateOrderForm = (requireEmail = false) => {
    const missing = [];
    if (!formData.name.trim()) {
      missing.push({ id: 'name', label: 'Nombre completo (quién recibe)' });
    }
    if (!formData.phone.trim()) {
      missing.push({ id: 'phone', label: 'Teléfono / WhatsApp de contacto' });
    }
    if (requireEmail && !formData.email.trim()) {
      missing.push({ id: 'email', label: 'Correo electrónico (para enviarte la confirmación)' });
    }
    if (activeZone.id !== 'recoger' && !formData.address.trim()) {
      const zoneName = activeZone.name.split('(')[0].trim();
      missing.push({ id: 'address', label: `Dirección de entrega en ${zoneName}` });
    }
    if (!formData.date) {
      missing.push({ id: 'date', label: 'Fecha de entrega deseada' });
    }
    return missing;
  };

  const handleFixField = (fieldId) => {
    const targetId = fieldId || validationModal.firstFieldId;
    setValidationModal((prev) => ({ ...prev, isOpen: false }));
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('input-highlight-pulse');
          setTimeout(() => el.classList.remove('input-highlight-pulse'), 1800);
        }
      }, 150);
    }
  };

  const prepareOrderPayload = () => ({
    customerName: formData.name,
    customerPhone: formData.phone,
    customerEmail: formData.email,
    deliveryAddress: activeZone.id === 'recoger' ? 'Recoger en Florería (Punto de Entrega)' : formData.address,
    deliveryMunicipality: activeZone.name,
    deliveryFee: activeZone.fee,
    deliveryDate: formData.date,
    deliveryTime: formData.time,
    cardStyle: activeCardStyle.name,
    cardSender: formData.cardSender,
    cardMessage: formData.message,
    specialNotes: formData.notes,
    items: items.map(item => ({
      productId: item.id || 0,
      productName: language === 'en' 
        ? (item.name_en || item.nameEn || item.name_es || item.nameEs || item.name || 'Floral Arrangement') 
        : (item.name_es || item.nameEs || item.name_en || item.nameEn || item.name || 'Arreglo Floral'),
      quantity: item.quantity,
      unitPrice: Number(item.price) || 0
    }))
  });

  const handleWhatsAppOrder = async (e) => {
    e.preventDefault();
    const missing = validateOrderForm(false);
    if (missing.length > 0) {
      setValidationModal({
        isOpen: true,
        title: 'Faltan datos obligatorios para tu entrega',
        message: 'Para garantizar que tu arreglo floral llegue perfecto y a tiempo a su destinatario, por favor completa los siguientes campos:',
        missingFields: missing,
        firstFieldId: missing[0].id
      });
      return;
    }

    setSubmittingOrder(true);
    let orderCode = '';
    try {
      const orderRes = await api.createOrder(prepareOrderPayload());
      orderCode = orderRes?.orderCode || '';
      setCreatedOrderCode(orderCode);
    } catch (err) {
      console.warn("Could not save order to API before WhatsApp redirect", err);
    } finally {
      setSubmittingOrder(false);
      const waUrl = generateWhatsAppLink(
        items,
        {
          ...formData,
          orderCode,
          municipality: activeZone.name,
          deliveryFee: activeZone.fee,
          cardStyle: activeCardStyle.name
        },
        language,
        whatsApp
      );
      window.open(waUrl, '_blank');
      setOrderSent(true);
      clearCart();
    }
  };

  const handleEmailOrder = async (e) => {
    e.preventDefault();
    const missing = validateOrderForm(true);
    if (missing.length > 0) {
      setValidationModal({
        isOpen: true,
        title: 'Faltan datos para confirmar tu pedido',
        message: 'Para procesar tu orden y enviarte el comprobante de confirmación, por favor completa los siguientes campos obligatorios:',
        missingFields: missing,
        firstFieldId: missing[0].id
      });
      return;
    }

    setSubmittingOrder(true);
    setEmailStatus('sending');
    
    try {
      const orderRes = await api.createOrder(prepareOrderPayload());
      setCreatedOrderCode(orderRes?.orderCode || '');
      setEmailStatus('success');
      setOrderSent(true);
      clearCart();
    } catch (err) {
      setValidationModal({
        isOpen: true,
        title: 'Atención con tu pedido',
        message: err.message || 'Ocurrió un problema temporal al procesar por correo. Te invitamos a completar tu pedido directamente por WhatsApp haciendo clic en el botón verde.',
        missingFields: [],
        firstFieldId: null
      });
      setEmailStatus('');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (items.length === 0 && !orderSent) {
    return (
      <div className="cart-page container text-center" style={{ padding: '6rem 1rem' }}>
        <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🛒</span>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{t('cart.empty')}</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>{t('cart.emptyMsg')}</p>
        <Link to="/catalogo" className="btn-primary" style={{ display: 'inline-block', maxWidth: '260px' }}>
          {t('cart.exploreCta')}
        </Link>
      </div>
    );
  }

  if (orderSent) {
    return (
      <div className="cart-page container text-center" style={{ padding: '4rem 1rem' }}>
        <div style={{
          maxWidth: '580px',
          margin: '0 auto',
          padding: '3rem 2rem',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-alt)',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🌸</span>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--color-burgundy)' }}>¡Gracias por tu pedido!</h2>
          
          {createdOrderCode && (
            <div style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-pink)',
              color: 'var(--color-burgundy)',
              padding: '0.5rem 1.25rem',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '1rem',
              margin: '1rem 0 1.5rem 0'
            }}>
              Código de Pedido: {createdOrderCode}
            </div>
          )}

          <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
            {emailStatus === 'success'
              ? 'Hemos recibido los detalles de tu pedido por correo electrónico. Nuestro equipo se comunicará contigo de inmediato para coordinar la entrega.'
              : 'Se ha abierto WhatsApp con los detalles de tu pedido. Envía el mensaje para que coordinemos la entrega a domicilio en Medellín.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            {createdOrderCode && (
              <Link
                to={`/rastreo?codigo=${createdOrderCode}`}
                className="btn-primary"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  maxWidth: '300px',
                  backgroundColor: 'var(--color-burgundy)',
                  color: '#FFF',
                  padding: '0.8rem',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 600
                }}
              >
                🔍 Rastrear mi Pedido en Tiempo Real
              </Link>
            )}

            <Link
              to="/catalogo"
              onClick={clearCart}
              style={{
                display: 'inline-block',
                color: '#666',
                textDecoration: 'underline',
                fontSize: '0.9rem',
                marginTop: '0.5rem'
              }}
            >
              Volver al Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const deliveryFee = activeZone.fee;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="cart-page container">
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="section-tag">Finaliza tu Pedido</span>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>{t('cart.title')}</h1>
      </header>

      <div className="cart-grid">
        {/* Cart Items Column */}
        <div className="cart-items-col">
          <h3 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
            Arreglos Seleccionados
          </h3>

          <div className="cart-items-list">
            {items.map((item) => {
              const name = language === 'en'
                ? (item.name_en || item.nameEn || item.name_es || item.nameEs || item.name || 'Floral Arrangement')
                : (item.name_es || item.nameEs || item.name_en || item.nameEn || item.name || 'Arreglo Floral');
              const imageSrc = api.getImageUrl(item.image);
              const unitPrice = Number(item.price) || 0;
              const itemTotal = unitPrice * item.quantity;

              return (
                <div key={item.id} className="cart-item-row">
                  <img 
                    src={imageSrc} 
                    alt={name} 
                    className="cart-item-img" 
                    onError={(e) => { e.target.src = '/images/roses-bouquet.jpg'; }}
                  />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{name}</h4>
                    <span className="cart-item-price" style={{ color: '#666', fontSize: '0.85rem' }}>
                      Precio unitario: <strong style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{formatCOP(unitPrice)}</strong>
                    </span>
                  </div>

                  <div className="cart-item-qty-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn" aria-label="Disminuir">-</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn" aria-label="Aumentar">+</button>
                  </div>

                  <div className="cart-item-subtotal-col" style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
                      Subtotal
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.05rem' }}>
                      {formatCOP(itemTotal)}
                    </span>
                  </div>

                  <button onClick={() => removeItem(item.id)} className="cart-remove-btn" aria-label="Eliminar del pedido">
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Detailed Summary */}
          <div className="cart-summary" style={{ padding: '1.5rem', backgroundColor: '#FFF', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: '#555' }}>
              <span>Subtotal Arreglos:</span>
              <span style={{ fontWeight: 600 }}>{formatCOP(subtotal)}</span>
            </div>

            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: '#555' }}>
              <span>Domicilio ({activeZone.name.split('(')[0].trim()}):</span>
              <span style={{ fontWeight: 600, color: deliveryFee === 0 ? '#059669' : '#111' }}>
                {deliveryFee === 0 ? '¡Gratis!' : formatCOP(deliveryFee)}
              </span>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '0.75rem 0' }}></div>

            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700 }}>
              <span>Total a Pagar:</span>
              <span className="total-amount" style={{ color: 'var(--color-burgundy)' }}>{formatCOP(grandTotal)}</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '0.9rem', lineHeight: 1.5 }}>
              💡 <strong>Pago fácil y seguro:</strong> Sin cobro automático con tarjeta. Confirmas y pagas directamente vía <strong>Nequi, Daviplata, Bancolombia o Efectivo</strong> al coordinar la entrega.
            </p>
          </div>
        </div>

        {/* Delivery Form Column */}
        <div className="contact-form-panel">
          <span className="section-tag">{t('cart.form.title')}</span>
          <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Datos de Entrega & Tarjeta</h3>

          <form className="luxury-form">
            {/* Recipient Name */}
            <div className="form-group">
              <label htmlFor="name">{t('cart.form.name')} (Quién recibe) *</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Carlos Andrés Restrepo"
                className="luxury-input"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="phone">{t('cart.form.phone')} *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="300 123 4567"
                  className="luxury-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  {t('cart.form.email')} <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.85 }}>(Para confirmación)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  className="luxury-input"
                />
              </div>
            </div>

            {/* FEATURE 1: DYNAMIC DELIVERY ZONES & MUNICIPALITY */}
            <div className="form-group" style={{ backgroundColor: '#FDF8F8', border: '1px solid #F5D6D6', padding: '1rem', borderRadius: '6px' }}>
              <label htmlFor="deliveryZone" style={{ fontWeight: 600, color: 'var(--color-burgundy)', display: 'block', marginBottom: '0.35rem' }}>
                📍 Municipio o Zona de Entrega *
              </label>
              <select
                id="deliveryZone"
                value={deliveryZoneId}
                onChange={(e) => setDeliveryZoneId(e.target.value)}
                className="luxury-input"
                style={{ width: '100%', fontWeight: 500 }}
              >
                {DELIVERY_ZONES.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name} — {z.fee === 0 ? 'Gratis' : formatCOP(z.fee)}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.78rem', color: '#666', display: 'block', marginTop: '0.35rem' }}>
                {activeZone.description}
              </span>
            </div>

            {/* Address */}
            {activeZone.id !== 'recoger' && (
              <div className="form-group">
                <label htmlFor="address">{t('cart.form.address')} en {activeZone.name.split('(')[0]} *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Barrio, calle, carrera, número de casa o apto"
                  className="luxury-input"
                />
              </div>
            )}

            {/* FEATURE 2: REAL DATE & TIME RULES */}
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="date">Fecha de Entrega *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  min={todayStr}
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="luxury-input"
                />
                {isSelectedToday && (
                  <span style={{ fontSize: '0.75rem', color: '#059669', display: 'block', marginTop: '0.25rem', fontWeight: 600 }}>
                    ⚡ Entrega programada para hoy
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="time">Jornada de Entrega *</label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="luxury-input"
                >
                  <option value="Jornada Mañana (8:00 AM - 1:00 PM)" disabled={isMorningCutoff}>
                    Jornada Mañana (8:00 AM - 1:00 PM) {isMorningCutoff ? '— (Cerrada para hoy)' : ''}
                  </option>
                  <option value="Jornada Tarde (2:00 PM - 6:00 PM)">
                    Jornada Tarde (2:00 PM - 6:00 PM)
                  </option>
                  <option value="Hora Específica / Express (Coordinar por WhatsApp)">
                    Hora Específica / Express (+ Coordinación)
                  </option>
                </select>
              </div>
            </div>

            {/* Evening Cutoff Alert */}
            {isEveningCutoff && (
              <div style={{
                backgroundColor: '#FEF3C7',
                border: '1px solid #F59E0B',
                color: '#92400E',
                padding: '0.65rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                lineHeight: 1.4
              }}>
                ⏰ <strong>Horario de Cierre de Tarde:</strong> Son más de las 5:00 PM. Los pedidos para entrega hoy mismo están sujetos a disponibilidad o se programarán para mañana a primera hora.
              </div>
            )}

            {/* FEATURE 3: DEDICATION CARD STYLE SELECTOR & PREVIEW */}
            <div className="form-group" style={{ marginTop: '1.5rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.25rem' }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                💌 Estilo de la Tarjeta de Dedicatoria (Gratis)
              </label>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {CARD_STYLES.map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setCardStyleId(style.id)}
                    style={{
                      padding: '0.6rem 0.5rem',
                      borderRadius: '6px',
                      border: cardStyleId === style.id ? `2px solid ${style.border}` : '1px solid #E5E7EB',
                      backgroundColor: cardStyleId === style.id ? style.bg : '#FAFAFA',
                      color: style.text,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: cardStyleId === style.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.2rem' }}>{style.icon}</span>
                    <span>{style.name.split(' ')[1] || style.name}</span>
                  </button>
                ))}
              </div>

              {/* Sender Name */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="cardSender" style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                  De parte de: <span style={{ color: '#888' }}>(Opcional — déjalo vacío si es sorpresa anónima)</span>
                </label>
                <input
                  type="text"
                  id="cardSender"
                  name="cardSender"
                  value={formData.cardSender}
                  onChange={handleChange}
                  placeholder="Ej. Tu admirador secreto, Tu familia con amor, etc."
                  className="luxury-input"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="message" style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '0.25rem' }}>
                  Mensaje escrito en la tarjeta:
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Escribe aquí las palabras especiales que acompañarán tus flores..."
                  className="luxury-input"
                ></textarea>
              </div>

              {/* Live Card Preview Box */}
              {formData.message && (
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  backgroundColor: activeCardStyle.bg,
                  border: `2px dashed ${activeCardStyle.border}`,
                  color: activeCardStyle.text,
                  marginBottom: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, opacity: 0.8 }}>
                      {activeCardStyle.tag}
                    </span>
                    <span style={{ fontSize: '1.1rem' }}>{activeCardStyle.icon}</span>
                  </div>

                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.1rem',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    margin: '0.5rem 0'
                  }}>
                    "{formData.message}"
                  </p>

                  <div style={{ textAlign: 'right', marginTop: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }}>
                    {formData.cardSender ? `— Con cariño, ${formData.cardSender}` : '— (Entrega sin firma / Anónima)'}
                  </div>
                </div>
              )}
            </div>

            {/* Special delivery notes */}
            <div className="form-group">
              <label htmlFor="notes">{t('cart.form.notes')}</label>
              <textarea
                id="notes"
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Ej. Dejar en portería con doña Gloria, timbre no funciona, etc."
                className="luxury-input"
              ></textarea>
            </div>

            {/* Ordering Buttons */}
            <div className="checkout-buttons" style={{ marginTop: '1.5rem' }}>
              <button onClick={handleWhatsAppOrder} type="button" className="btn-checkout-wa" disabled={submittingOrder}>
                📱 {submittingOrder ? 'Procesando...' : `${t('cart.orderVia')} WhatsApp`}
              </button>

              <button 
                onClick={handleEmailOrder} 
                type="button" 
                className="btn-checkout-email"
                disabled={submittingOrder || emailStatus === 'sending'}
              >
                ✉️ {emailStatus === 'sending' ? 'Enviando...' : `${t('cart.orderVia')} Correo Electrónico`}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Elegant Validation & Alert Modal */}
      <ValidationModal
        isOpen={validationModal.isOpen}
        onClose={() => setValidationModal((prev) => ({ ...prev, isOpen: false }))}
        title={validationModal.title}
        message={validationModal.message}
        missingFields={validationModal.missingFields}
        onFixField={handleFixField}
      />
    </div>
  );
};
