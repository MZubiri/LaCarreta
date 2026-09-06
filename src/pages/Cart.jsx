import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { generateWhatsAppLink, formatCOP } from '../utils/whatsapp';
import { api } from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Cart = () => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useContext(CartContext);
  const { language } = useContext(LanguageContext);
  const { whatsApp, deliveryNotes } = useSiteSettings();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    date: '',
    time: 'Jornada Mañana (8:00 AM - 1:00 PM)',
    message: '',
    notes: ''
  });

  const [orderSent, setOrderSent] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const prepareOrderPayload = () => ({
    customerName: formData.name,
    customerPhone: formData.phone,
    customerEmail: formData.email,
    deliveryAddress: formData.address,
    deliveryDate: formData.date,
    deliveryTime: formData.time,
    cardMessage: formData.message,
    specialNotes: formData.notes,
    items: items.map(item => ({
      productId: item.id || 0,
      productName: language === 'en' ? (item.name_en || item.nameEn || item.name_es) : (item.name_es || item.nameEs),
      quantity: item.quantity,
      unitPrice: item.price
    }))
  });

  const handleWhatsAppOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.date) {
      alert('Por favor completa los campos obligatorios (* Nombre, Teléfono, Dirección en Caldas/Antioquia y Fecha).');
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
      const waUrl = generateWhatsAppLink(items, { ...formData, orderCode }, language, whatsApp);
      window.open(waUrl, '_blank');
      setOrderSent(true);
      clearCart();
    }
  };

  const handleEmailOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.address || !formData.date) {
      alert('Por favor completa los campos obligatorios incluyendo tu correo electrónico.');
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
      alert(err.message || 'Error al procesar el pedido. Intenta por WhatsApp.');
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
      <div className="cart-page container text-center" style={{ padding: '6rem 1rem' }}>
        <div style={{ maxWidth: '550px', margin: '0 auto', padding: '3rem 2rem', border: '1px solid #E8E6E1', backgroundColor: '#F9F8F6' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🌸</span>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>¡Gracias por tu pedido!</h2>
          {createdOrderCode && (
            <div style={{
              display: 'inline-block',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              marginBottom: '1.25rem'
            }}>
              Código de Pedido: {createdOrderCode}
            </div>
          )}
          <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
            {emailStatus === 'success'
              ? 'Hemos recibido los detalles de tu pedido por correo electrónico. Nuestro equipo en Caldas, Antioquia se comunicará contigo de inmediato para coordinar la entrega.'
              : 'Se ha abierto WhatsApp con los detalles de tu pedido. Envía el mensaje para que coordinemos la entrega a domicilio en Caldas o el Valle de Aburrá.'}
          </p>
          <Link to="/catalogo" onClick={clearCart} className="btn-primary" style={{ display: 'inline-block', maxWidth: '240px' }}>
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="cart-page container">
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="section-tag">Finaliza tu Pedido</span>
        <h1 style={{ fontSize: '3rem' }}>{t('cart.title')}</h1>
      </header>

      <div className="cart-grid">
        {/* Cart Items Column */}
        <div className="cart-items-col">
          <h3 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
            Arreglos Seleccionados
          </h3>

          <div className="cart-items-list">
            {items.map((item) => {
              const name = language === 'en' ? item.name_en : item.name_es;
              return (
                <div key={item.id} className="cart-item-row">
                  <img src={item.image} alt={name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{name}</h4>
                    <span className="cart-item-price">{formatCOP(item.price)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn">-</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">+</button>
                  </div>

                  <div style={{ fontWeight: 600, color: 'var(--color-gold)', marginLeft: 'auto' }}>
                    {formatCOP(item.price * item.quantity)}
                  </div>

                  <button onClick={() => removeItem(item.id)} className="drawer-item-remove" style={{ marginLeft: '1rem' }}>
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Total a Pagar:</span>
              <span className="total-amount">{formatCOP(total)}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '0.75rem' }}>
              💡 Sin cobro automático con tarjeta. Confirmas y pagas tu pedido directamente con nosotros (Nequi, Daviplata, Bancolombia o Efectivo).
            </p>
          </div>
        </div>

        {/* Delivery Form Column */}
        <div className="contact-form-panel">
          <span className="section-tag">{t('cart.form.title')}</span>
          <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Datos de Entrega</h3>

          <form className="luxury-form">
            <div className="form-group">
              <label htmlFor="name">{t('cart.form.name')} *</label>
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
                <label htmlFor="email">{t('cart.form.email')}</label>
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

            <div className="form-group">
              <label htmlFor="address">{t('cart.form.address')} *</label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Municipio (Caldas, Sabaneta, etc.), barrio, calle y apto"
                className="luxury-input"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="date">{t('cart.form.date')} *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="luxury-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">{t('cart.form.time')}</label>
                <select id="time" name="time" value={formData.time} onChange={handleChange} className="luxury-input">
                  <option value="Jornada Mañana (8:00 AM - 1:00 PM)">Jornada Mañana (8:00 AM - 1:00 PM)</option>
                  <option value="Jornada Tarde (1:00 PM - 6:00 PM)">Jornada Tarde (1:00 PM - 6:00 PM)</option>
                  <option value="Lo antes posible">Lo antes posible</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">{t('cart.form.message')}</label>
              <textarea
                id="message"
                name="message"
                rows="3"
                value={formData.message}
                onChange={handleChange}
                placeholder="Dedicatoria escrita a mano para la tarjeta (opcional)..."
                className="luxury-input"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="notes">{t('cart.form.notes')}</label>
              <textarea
                id="notes"
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Instrucciones para el repartidor o detalles especiales..."
                className="luxury-input"
              ></textarea>
            </div>

            {/* Ordering Buttons */}
            <div className="checkout-buttons">
              <button onClick={handleWhatsAppOrder} type="button" className="btn-checkout-wa">
                📱 {t('cart.orderVia')} WhatsApp
              </button>

              <button 
                onClick={handleEmailOrder} 
                type="button" 
                className="btn-checkout-email"
                disabled={emailStatus === 'sending'}
              >
                ✉️ {emailStatus === 'sending' ? 'Enviando...' : `${t('cart.orderVia')} Correo Electrónico`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
