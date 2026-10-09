import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatCOP } from '../utils/whatsapp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { IconMapPin, IconWhatsApp } from '../components/Icons';

export const getStatusInfo = (rawStatus = '') => {
  const s = (rawStatus || '').toLowerCase().trim();

  if (s.includes('cancelad') || s.includes('anulad')) {
    return {
      step: -1,
      key: 'Cancelado',
      label: 'Pedido Cancelado',
      badgeText: 'Cancelado',
      color: '#991B1B',
      bg: '#FEE2E2',
      border: '#FECACA',
      icon: '❌',
      message: 'Este pedido ha sido cancelado. Si tienes alguna duda o deseas reprogramarlo, contáctanos de inmediato por WhatsApp.'
    };
  }

  if (s.includes('entregad') || s.includes('completad') || s.includes('finalizad')) {
    return {
      step: 4,
      key: 'Entregado',
      label: 'Entregado con Éxito',
      badgeText: 'Entregado',
      color: '#065F46',
      bg: '#D1FAE5',
      border: '#A7F3D0',
      icon: '🎁',
      message: '¡Tus flores han llegado a su destino! Fueron entregadas con todo el cuidado al destinatario. ¡Gracias por confiar en Florería La Carreta!'
    };
  }

  if (s.includes('camin') || s.includes('ruta') || s.includes('viaj') || s.includes('despachad')) {
    return {
      step: 3,
      key: 'EnCamino',
      label: 'En Camino',
      badgeText: 'En Camino',
      color: '#3730A3',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      icon: '🛵',
      message: 'El mensajero floral ya va en ruta hacia la dirección indicada. ¡Pronto alegrará el día de esa persona especial!'
    };
  }

  if (
    s.includes('preparaci') ||
    s.includes('preparando') ||
    s.includes('proceso') ||
    s.includes('armando') ||
    s.includes('taller') ||
    s.includes('florer')
  ) {
    return {
      step: 2,
      key: 'EnPreparacion',
      label: 'En Preparación Floral',
      badgeText: 'En Preparación',
      color: '#1E40AF',
      bg: '#DBEAFE',
      border: '#BFDBFE',
      icon: '🌸',
      message: 'Nuestros floristas artesanos están seleccionando los tallos más frescos y diseñando tu arreglo en el taller.'
    };
  }

  // Default: Pendiente / Recibido
  return {
    step: 1,
    key: 'Pendiente',
    label: 'Pedido Recibido',
    badgeText: 'Recibido',
    color: '#92400E',
    bg: '#FEF3C7',
    border: '#FDE68A',
    icon: '📝',
    message: 'Hemos recibido tu pedido en el sistema. Estamos verificando los detalles para comenzar su preparación en el taller.'
  };
};

export const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('codigo') || searchParams.get('code') || '';

  const { getWhatsAppLink } = useSiteSettings();
  const [query, setQuery] = useState(initialCode);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const fetchTrack = useCallback(async (searchQuery, isSilentRefresh = false) => {
    if (!searchQuery || !searchQuery.trim()) return;
    if (isSilentRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError('');
      setSearched(true);
    }

    try {
      const results = await api.trackOrder(searchQuery.trim());
      setOrders(results || []);
      setError('');
    } catch (err) {
      if (!isSilentRefresh) {
        setError(err.message || 'No se encontró ningún pedido con ese código o teléfono.');
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (initialCode) {
      fetchTrack(initialCode);
    }
  }, [initialCode, fetchTrack]);

  // Real-time synchronization when orders are updated from Admin or local storage
  useEffect(() => {
    const handleOrdersUpdated = () => {
      const currentQuery = query.trim() || initialCode.trim();
      if (currentQuery) {
        fetchTrack(currentQuery, true);
      }
    };

    window.addEventListener('floreria_orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);

    return () => {
      window.removeEventListener('floreria_orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
    };
  }, [query, initialCode, fetchTrack]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTrack(query);
  };

  const steps = [
    { num: 1, title: 'Pedido Recibido', desc: 'Confirmado en nuestra florería', icon: '📝' },
    { num: 2, title: 'En Preparación', desc: 'Floristas armando el arreglo', icon: '🌸' },
    { num: 3, title: 'En Camino', desc: 'Mensajero en ruta a destino', icon: '🛵' },
    { num: 4, title: 'Entregado', desc: '¡Entregado con éxito!', icon: '🎁' }
  ];

  return (
    <div className="track-order-page container" style={{ padding: '3.5rem 1rem 5rem 1rem', maxWidth: '850px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="section-tag">Seguimiento en Vivo</span>
        <h1 style={{ fontSize: '2.75rem', fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', margin: '0.5rem 0' }}>
          Rastrea tu Pedido Floral
        </h1>
        <p style={{ color: '#666', maxWidth: '550px', margin: '0 auto', fontSize: '0.95rem' }}>
          Consulta el estado de preparación artesanal y entrega de tus flores en Medellín y el Valle de Aburrá.
        </p>
      </header>

      {/* Search Input Box */}
      <div className="track-search-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ingresa tu código de pedido (ej. FLC-2026-0001) o teléfono..."
            className="luxury-input"
            style={{ flex: 1, minWidth: '0', fontSize: '0.95rem', padding: '0.85rem 1rem' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0.85rem 1.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {loading ? 'Consultando...' : '🔍 Rastrear'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#FFF0F0',
          border: '1px solid #FECACA',
          color: '#991B1B',
          padding: '1.25rem',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.4rem' }}>🌸</span>
          <strong>{error}</strong>
          <p style={{ fontSize: '0.85rem', color: '#777', marginTop: '0.5rem' }}>
            Verifica que el código esté escrito correctamente o intenta buscando por el número de teléfono (del comprador o quien recibe).
          </p>
        </div>
      )}

      {/* Orders List / Results */}
      {orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            const currentStep = statusInfo.step;
            const isCancelled = currentStep === -1;

            // Recipient & customer resolution with backwards compatibility
            const recipientName = order.recipientName || order.customerName || 'Destinatario';
            const recipientPhone = order.recipientPhone || order.customerPhone || '';
            const customerName = order.customerName || 'Cliente';
            const customerPhone = order.customerPhone || '';

            return (
              <div
                key={order.id || order.orderCode}
                className="track-order-card"
              >
                {/* Header card with status pill and refresh button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid #F0DEDE',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Código de Pedido
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', color: 'var(--color-burgundy)', fontFamily: 'monospace' }}>
                      {order.orderCode || `PED-${order.id}`}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.9rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.border}`
                      }}>
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.label}</span>
                      </span>

                      <button
                        onClick={() => fetchTrack(order.orderCode || query, true)}
                        title="Actualizar estado"
                        disabled={refreshing}
                        style={{
                          background: 'none',
                          border: '1px solid #E5E7EB',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          color: '#6B7280',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {refreshing ? '⏳' : '🔄'}
                      </button>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: '#888' }}>
                      Registrado: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
                    </span>
                  </div>
                </div>

                {/* Status Explanation Banner */}
                <div style={{
                  backgroundColor: statusInfo.bg,
                  border: `1px solid ${statusInfo.border}`,
                  color: statusInfo.color,
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}>
                  <span style={{ fontSize: '1.4rem' }}>{statusInfo.icon}</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.15rem' }}>
                      Estado actual: {statusInfo.label}
                    </strong>
                    <span>{statusInfo.message}</span>
                  </div>
                </div>

                {/* Progress Stepper Bar with Connecting Rail (if not cancelled) */}
                {!isCancelled && (
                  <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                    {/* Background Progress Rail */}
                    <div style={{
                      position: 'absolute',
                      top: '23px',
                      left: '12.5%',
                      right: '12.5%',
                      height: '4px',
                      backgroundColor: '#E5E7EB',
                      zIndex: 1,
                      borderRadius: '2px'
                    }}>
                      {/* Active Progress Fill */}
                      <div style={{
                        height: '100%',
                        backgroundColor: 'var(--color-burgundy)',
                        borderRadius: '2px',
                        transition: 'width 0.4s ease',
                        width: `${Math.min(100, Math.max(0, ((currentStep - 1) / 3) * 100))}%`
                      }} />
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      position: 'relative',
                      gap: '0.5rem',
                      textAlign: 'center',
                      zIndex: 2
                    }}>
                      {steps.map((st) => {
                        const isDone = currentStep >= st.num;
                        const isCurrent = currentStep === st.num;

                        return (
                          <div key={st.num} style={{ position: 'relative' }}>
                            {/* Circle Node */}
                            <div style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? 'var(--color-burgundy)' : '#FFFFFF',
                              color: isDone ? '#FFF' : '#9CA3AF',
                              border: isCurrent
                                ? '3px solid var(--color-gold)'
                                : isDone
                                ? '2px solid var(--color-burgundy)'
                                : '2px solid #D1D5DB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 0.6rem auto',
                              fontSize: '1.2rem',
                              boxShadow: isCurrent ? '0 0 0 4px rgba(123, 20, 60, 0.2)' : '0 2px 4px rgba(0,0,0,0.04)',
                              transition: 'all 0.3s ease'
                            }}>
                              {st.icon}
                            </div>

                            {/* Label */}
                            <h4 style={{
                              fontSize: '0.85rem',
                              margin: '0 0 0.15rem 0',
                              color: isDone ? 'var(--color-burgundy)' : '#9CA3AF',
                              fontWeight: isCurrent ? 700 : 500
                            }}>
                              {st.title}
                            </h4>
                            <span style={{ fontSize: '0.72rem', color: '#888', display: 'block' }}>
                              {st.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Delivery & People Information Grid */}
                <div className="track-delivery-grid">
                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#777', margin: '0 0 0.3rem 0', letterSpacing: '0.05em' }}>
                      Destinatario (Recibe)
                    </h5>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>
                      {recipientName}
                    </p>
                    {recipientPhone && (
                      <p style={{ margin: '0.2rem 0 0 0', color: '#4B5563', fontSize: '0.85rem' }}>
                        📞 {recipientPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#777', margin: '0 0 0.3rem 0', letterSpacing: '0.05em' }}>
                      Comprador (Cliente)
                    </h5>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: '#1F2937' }}>
                      {customerName}
                    </p>
                    {customerPhone && (
                      <p style={{ margin: '0.2rem 0 0 0', color: '#4B5563', fontSize: '0.85rem' }}>
                        📱 {customerPhone}
                      </p>
                    )}
                    {order.customerEmail && (
                      <p style={{ margin: '0.1rem 0 0 0', color: '#6B7280', fontSize: '0.8rem' }}>
                        ✉️ {order.customerEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#777', margin: '0 0 0.3rem 0', letterSpacing: '0.05em' }}>
                      Lugar de Entrega
                    </h5>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>
                      {order.deliveryMunicipality || 'Medellín'}
                    </p>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#4B5563', fontSize: '0.85rem' }}>
                      🏠 {order.deliveryAddress || 'Recoger en Florería'}
                    </p>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#777', margin: '0 0 0.3rem 0', letterSpacing: '0.05em' }}>
                      Fecha y Horario
                    </h5>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>
                      🗓️ {order.deliveryDate || 'Fecha coordinada'}
                    </p>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#4B5563', fontSize: '0.85rem' }}>
                      ⏰ {order.deliveryTime || 'Jornada habitual'}
                    </p>
                  </div>
                </div>

                {/* Card Dedication Message (if any) */}
                {order.cardMessage && (
                  <div style={{
                    backgroundColor: '#FFFBF5',
                    border: '1px dashed #D4AF37',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    fontFamily: 'var(--font-serif)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem', color: '#B45309', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span>💌 Tarjeta: {order.cardStyle || 'Dedicatoria Especial'}</span>
                      {order.cardSender && <span>De parte de: {order.cardSender}</span>}
                    </div>
                    <p style={{ margin: '0.4rem 0', fontStyle: 'italic', fontSize: '1.05rem', color: '#2C1810', lineHeight: 1.5 }}>
                      "{order.cardMessage}"
                    </p>
                  </div>
                )}

                {/* Special Instructions / Notes */}
                {order.specialNotes && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    borderLeft: '3px solid #DC2626',
                    padding: '0.75rem 1rem',
                    borderRadius: '0 6px 6px 0',
                    marginBottom: '1.5rem',
                    fontSize: '0.85rem',
                    color: '#991B1B'
                  }}>
                    <strong>Indicaciones especiales:</strong> {order.specialNotes}
                  </div>
                )}

                {/* Items & Total Summary */}
                <div style={{ borderTop: '1px solid #F0DEDE', paddingTop: '1.25rem' }}>
                  <h5 style={{ fontSize: '0.85rem', margin: '0 0 0.75rem 0', color: '#444' }}>Arreglos en este pedido:</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>• {item.quantity}x {item.productName}</span>
                        <span style={{ fontWeight: 600 }}>{formatCOP(item.totalPrice || item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #E5E7EB',
                    fontSize: '1.15rem',
                    fontWeight: 700
                  }}>
                    <span>Total a Pagar:</span>
                    <span style={{ color: 'var(--color-burgundy)' }}>{formatCOP(order.totalAmount || order.total || 0)}</span>
                  </div>
                </div>

                {/* WhatsApp Help Button */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <a
                    href={getWhatsAppLink(`Hola Florería La Carreta, me gustaría consultar sobre mi pedido ${order.orderCode} a nombre de ${customerName}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hero-secondary btn-hero-whatsapp"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    <IconWhatsApp size={16} />
                    <span>Consultar por WhatsApp sobre este pedido</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful FAQ / Info Box */}
      {!searched && (
        <div style={{
          backgroundColor: '#FFF',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📍</span>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-burgundy)' }}>¿Dónde encuentro mi código de pedido?</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            Al finalizar tu compra te entregamos un código como <strong>FLC-2026-0001</strong> o <strong>ORD-...</strong>. También puedes rastrearlo ingresando el mismo número de teléfono que registraste al comprar o el del destinatario.
          </p>
          <Link to="/catalogo" className="btn-primary" style={{ display: 'inline-block', maxWidth: '220px' }}>
            Explorar Catálogo
          </Link>
        </div>
      )}
    </div>
  );
};
