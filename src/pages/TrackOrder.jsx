import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatCOP } from '../utils/whatsapp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { IconMapPin, IconWhatsApp } from '../components/Icons';

export const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('codigo') || searchParams.get('code') || '';
  
  const { getWhatsAppLink } = useSiteSettings();
  const [query, setQuery] = useState(initialCode);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const fetchTrack = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const results = await api.trackOrder(searchQuery.trim());
      setOrders(results || []);
    } catch (err) {
      setError(err.message || 'No se encontró ningún pedido con ese código o teléfono.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchTrack(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTrack(query);
  };

  const getStatusStep = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('entregado') || s.includes('completado')) return 4;
    if (s.includes('camino') || s.includes('ruta')) return 3;
    if (s.includes('preparaci') || s.includes('proceso') || s.includes('taller')) return 2;
    if (s.includes('cancelado')) return -1;
    return 1; // Pendiente / Recibido
  };

  const steps = [
    { num: 1, title: 'Pedido Recibido', desc: 'Confirmado en nuestro taller', icon: '📝' },
    { num: 2, title: 'En Preparación', desc: 'Floristas armando el arreglo', icon: '🌸' },
    { num: 3, title: 'En Camino', desc: 'Mensajero en ruta', icon: '🛵' },
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
          Consulta el estado de preparación y entrega de tus flores en Caldas y el Valle de Aburrá.
        </p>
      </header>

      {/* Search Input Box */}
      <div style={{
        backgroundColor: '#FFF',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '1.75rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        marginBottom: '2.5rem'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ingresa tu código de pedido (ej. FLC-2026-0001) o tu teléfono..."
            className="luxury-input"
            style={{ flex: 1, minWidth: '260px', fontSize: '0.95rem', padding: '0.85rem 1rem' }}
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
            Verifica que el código esté escrito correctamente o intenta buscando por el número de teléfono con el que realizaste el pedido.
          </p>
        </div>
      )}

      {/* Orders List / Results */}
      {orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map(order => {
            const currentStep = getStatusStep(order.status);
            const isCancelled = currentStep === -1;

            return (
              <div
                key={order.id || order.orderCode}
                style={{
                  backgroundColor: '#FFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '2rem',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.06)'
                }}
              >
                {/* Header card with status pill */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid #F0DEDE',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.75rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Código de Pedido
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', color: 'var(--color-burgundy)', fontFamily: 'monospace' }}>
                      {order.orderCode || `PED-${order.id}`}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.35rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      backgroundColor: isCancelled ? '#FEE2E2' : (currentStep === 4 ? '#D1FAE5' : '#FFF3F3'),
                      color: isCancelled ? '#991B1B' : (currentStep === 4 ? '#065F46' : 'var(--color-burgundy)')
                    }}>
                      {isCancelled ? '❌ Pedido Cancelado' : `● ${order.status || 'Pendiente'}`}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginTop: '0.3rem' }}>
                      Registrado: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CO') : 'Reciente'}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper Bar (if not cancelled) */}
                {!isCancelled && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      position: 'relative',
                      gap: '0.5rem',
                      textAlign: 'center'
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
                              backgroundColor: isDone ? 'var(--color-burgundy)' : '#F3F4F6',
                              color: isDone ? '#FFF' : '#9CA3AF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 0.6rem auto',
                              fontSize: '1.25rem',
                              border: isCurrent ? '3px solid var(--color-pink)' : 'none',
                              boxShadow: isCurrent ? '0 0 0 3px rgba(123, 20, 60, 0.2)' : 'none',
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

                {/* Delivery Information Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                  backgroundColor: 'var(--color-bg-alt)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#777', margin: '0 0 0.3rem 0' }}>
                      Destinatario & Teléfono
                    </h5>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{order.customerName}</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{order.customerPhone}</p>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#777', margin: '0 0 0.3rem 0' }}>
                      Municipio & Dirección
                    </h5>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                      {order.deliveryMunicipality || 'Caldas, Antioquia'}
                    </p>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{order.deliveryAddress}</p>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#777', margin: '0 0 0.3rem 0' }}>
                      Fecha y Jornada
                    </h5>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{order.deliveryDate}</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{order.deliveryTime}</p>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem', color: '#B45309' }}>
                      <span>💌 Tarjeta: {order.cardStyle || 'Dedicatoria Especial'}</span>
                      {order.cardSender && <span>De parte de: {order.cardSender}</span>}
                    </div>
                    <p style={{ margin: '0.4rem 0', fontStyle: 'italic', fontSize: '1.05rem', color: '#2C1810' }}>
                      "{order.cardMessage}"
                    </p>
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
                    <span style={{ color: 'var(--color-burgundy)' }}>{formatCOP(order.totalAmount)}</span>
                  </div>
                </div>

                {/* WhatsApp Help Button */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <a
                    href={getWhatsAppLink(`Hola Florería La Carreta, me gustaría consultar sobre mi pedido ${order.orderCode} a nombre de ${order.customerName}.`)}
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
            Al finalizar tu compra te entregamos un código como <strong>FLC-2026-0001</strong> o <strong>ORD-...</strong>. También puedes rastrearlo ingresando el mismo número de teléfono que registraste al comprar.
          </p>
          <Link to="/catalogo" className="btn-primary" style={{ display: 'inline-block', maxWidth: '220px' }}>
            Explorar Catálogo
          </Link>
        </div>
      )}
    </div>
  );
};
