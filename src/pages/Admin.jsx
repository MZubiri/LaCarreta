import React, { useState, useEffect } from 'react';
import { api, getToken, removeToken } from '../services/api';
import { formatCOP } from '../utils/whatsapp';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Admin = () => {
  const { settings, refreshSettings, updateSettings } = useSiteSettings();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!getToken() || localStorage.getItem('floreria_admin_logged') === 'true';
  });

  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'products', 'orders', 'categories', 'settings'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Filters for orders
  const [orderStatusFilter, setOrderStatusFilter] = useState('todos');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // Filters for products
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('todos');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productForm, setProductForm] = useState({
    name_es: '',
    name_en: '',
    description_es: '',
    description_en: '',
    price: 120000,
    category: 'ramos',
    image: '/images/roses-bouquet.jpg',
    featured: false,
    isActive: true,
    occasion_es: 'Amor, Aniversario',
    occasion_en: 'Love, Anniversary'
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    slug: '',
    nameEs: '',
    nameEn: '',
    icon: '🌸',
    sortOrder: 1,
    isActive: true
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    businessPhone: '+57 320 646 8689',
    whatsAppNumber: '573206468689',
    businessEmail: 'pedidos@florerialacarreta.com',
    address: 'Cra 49 # 131 Sur-69',
    city: 'Caldas, Antioquia, Colombia',
    instagramUrl: 'https://www.instagram.com/floristeria_la_carreta',
    facebookUrl: '',
    scheduleWeekdays: 'Lunes a Sábado: 8:00 AM - 6:00 PM',
    scheduleWeekends: 'Domingos y Festivos: Cerrado',
    googleMapsEmbedUrl: '',
    deliveryNotes: 'Entregas en Caldas, La Estrella, Sabaneta, Itagüí y Envigado.'
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Sync settings when context loads
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        businessPhone: settings.businessPhone || '+57 320 646 8689',
        whatsAppNumber: settings.whatsAppNumber || '573206468689',
        businessEmail: settings.businessEmail || 'pedidos@florerialacarreta.com',
        address: settings.address || 'Cra 49 # 131 Sur-69',
        city: settings.city || 'Caldas, Antioquia, Colombia',
        instagramUrl: settings.instagramUrl || 'https://www.instagram.com/floristeria_la_carreta',
        facebookUrl: settings.facebookUrl || '',
        scheduleWeekdays: settings.scheduleWeekdays || 'Lunes a Sábado: 8:00 AM - 6:00 PM',
        scheduleWeekends: settings.scheduleWeekends || 'Domingos y Festivos: Cerrado',
        googleMapsEmbedUrl: settings.googleMapsEmbedUrl || '',
        deliveryNotes: settings.deliveryNotes || 'Entregas en Caldas, La Estrella, Sabaneta, Itagüí y Envigado.'
      });
    }
  }, [settings]);

  const showNotification = (text, type = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 5000);
  };

  // Load All Admin Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodsData, ordersData, catsData, statsData] = await Promise.allSettled([
        api.getAllProductsAdmin(),
        api.getOrders(),
        api.getAllCategoriesAdmin(),
        api.getDashboardStats()
      ]);

      if (prodsData.status === 'fulfilled') setProducts(prodsData.value || []);
      if (ordersData.status === 'fulfilled') setOrders(ordersData.value || []);
      if (catsData.status === 'fulfilled') setCategories(catsData.value || []);
      if (statsData.status === 'fulfilled') setDashboardStats(statsData.value);
    } catch (e) {
      console.error("Error loading admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await api.login(loginForm.username, loginForm.password);
      setIsAuthenticated(true);
      showNotification('Bienvenido al Panel de Administración');
    } catch (err) {
      setLoginError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  // ================= PRODUCTS ACTIONS =================
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name_es: '',
      name_en: '',
      description_es: '',
      description_en: '',
      price: 120000,
      category: categories.length > 0 ? categories.find(c => c.slug !== 'todos')?.slug || 'ramos' : 'ramos',
      image: '/images/roses-bouquet.jpg',
      featured: false,
      isActive: true,
      occasion_es: 'Amor, Cumpleaños',
      occasion_en: 'Love, Birthday'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    const occEs = Array.isArray(prod.occasion_es)
      ? prod.occasion_es.join(', ')
      : (typeof prod.occasionEs === 'string' && prod.occasionEs.startsWith('[') ? JSON.parse(prod.occasionEs || '[]').join(', ') : (prod.occasionEs || ''));
    const occEn = Array.isArray(prod.occasion_en)
      ? prod.occasion_en.join(', ')
      : (typeof prod.occasionEn === 'string' && prod.occasionEn.startsWith('[') ? JSON.parse(prod.occasionEn || '[]').join(', ') : (prod.occasionEn || ''));

    setProductForm({
      name_es: prod.nameEs || prod.name_es || '',
      name_en: prod.nameEn || prod.name_en || '',
      description_es: prod.descriptionEs || prod.description_es || '',
      description_en: prod.descriptionEn || prod.description_en || '',
      price: prod.price || 0,
      category: prod.category || 'ramos',
      image: prod.image || '/images/roses-bouquet.jpg',
      featured: prod.featured ?? prod.isFeatured ?? false,
      isActive: prod.isActive ?? true,
      occasion_es: occEs,
      occasion_en: occEn
    });
    setIsProductModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) {
        setProductForm(prev => ({ ...prev, image: res.url }));
        showNotification('Imagen subida correctamente');
      }
    } catch (err) {
      alert(err.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const occasionsEsArr = productForm.occasion_es.split(',').map(s => s.trim()).filter(Boolean);
    const occasionsEnArr = productForm.occasion_en.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      nameEs: productForm.name_es,
      nameEn: productForm.name_en || productForm.name_es,
      descriptionEs: productForm.description_es,
      descriptionEn: productForm.description_en || productForm.description_es,
      price: parseFloat(productForm.price),
      category: productForm.category,
      image: productForm.image,
      featured: productForm.featured,
      isActive: productForm.isActive,
      occasionEs: JSON.stringify(occasionsEsArr),
      occasionEn: JSON.stringify(occasionsEnArr)
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showNotification('Arreglo floral actualizado con éxito');
      } else {
        await api.createProduct(payload);
        showNotification('Nuevo arreglo floral añadido al catálogo');
      }
      setIsProductModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error al guardar producto');
    }
  };

  const handleToggleProductActive = async (prod) => {
    try {
      await api.toggleProductActive(prod.id);
      showNotification(`Estado de "${prod.nameEs || prod.name_es}" actualizado`);
      fetchData();
    } catch (err) {
      // Fallback update
      await api.updateProduct(prod.id, { ...prod, isActive: !prod.isActive });
      fetchData();
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      try {
        await api.deleteProduct(id);
        showNotification('Arreglo floral eliminado');
        fetchData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  // ================= ORDERS ACTIONS =================
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showNotification(`Estado de pedido actualizado a ${newStatus}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error al actualizar pedido');
    }
  };

  const handleDeleteOrder = async (orderId, orderCode) => {
    if (window.confirm(`¿Eliminar el pedido ${orderCode}?`)) {
      try {
        await api.deleteOrder(orderId);
        showNotification('Pedido eliminado');
        fetchData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No hay pedidos registrados para exportar.');
      return;
    }

    const headers = [
      'Código',
      'Fecha',
      'Cliente',
      'Teléfono',
      'Email',
      'Dirección de Entrega',
      'Fecha Entrega',
      'Jornada',
      'Mensaje Tarjeta',
      'Total COP',
      'Estado'
    ];

    const rows = orders.map(o => [
      `"${o.orderCode || o.id}"`,
      `"${new Date(o.createdAt).toLocaleDateString('es-CO')}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.customerEmail || ''}"`,
      `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${o.deliveryDate || ''}"`,
      `"${o.deliveryTime || ''}"`,
      `"${(o.cardMessage || '').replace(/"/g, '""')}"`,
      o.totalAmount || o.total || 0,
      `"${o.status || 'Pendiente'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_lacarreta_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Reporte CSV descargado');
  };

  // ================= CATEGORIES ACTIONS =================
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      slug: '',
      nameEs: '',
      nameEn: '',
      icon: '🌸',
      sortOrder: categories.length + 1,
      isActive: true
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      slug: cat.slug || '',
      nameEs: cat.nameEs || '',
      nameEn: cat.nameEn || '',
      icon: cat.icon || '🌸',
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive ?? true
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryForm);
        showNotification('Categoría actualizada');
      } else {
        await api.createCategory(categoryForm);
        showNotification('Categoría creada');
      }
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error al guardar categoría');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`¿Eliminar categoría "${name}"?`)) {
      try {
        await api.deleteCategory(id);
        showNotification('Categoría eliminada');
        fetchData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  // ================= SETTINGS ACTIONS =================
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(settingsForm);
      await refreshSettings();
      showNotification('¡Ajustes del negocio guardados! Todos los datos se han actualizado en el sitio.');
    } catch (err) {
      alert(err.message || 'Error al guardar los ajustes');
    }
  };

  // ================= PASSWORD CHANGE =================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showNotification('Contraseña cambiada exitosamente.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.message || 'Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'todos' || (o.status || '').toLowerCase() === orderStatusFilter.toLowerCase();
    const term = orderSearchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      (o.orderCode || '').toLowerCase().includes(term) ||
      (o.customerName || '').toLowerCase().includes(term) ||
      (o.customerPhone || '').includes(term);
    return matchesStatus && matchesSearch;
  });

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const pCat = p.category || '';
    const matchesCategory = productCategoryFilter === 'todos' || pCat.toLowerCase() === productCategoryFilter.toLowerCase();
    const term = productSearchTerm.toLowerCase().trim();
    const name = (p.nameEs || p.name_es || '').toLowerCase();
    const matchesSearch = !term || name.includes(term);
    return matchesCategory && matchesSearch;
  });

  // Calculations for Dashboard
  const totalSalesCOP = orders
    .filter(o => o.status !== 'Cancelado')
    .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

  const activeOrdersCount = orders.filter(o =>
    o.status === 'Pendiente' || o.status === 'EnPreparacion' || o.status === 'EnCamino'
  ).length;

  // Unauthenticated Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-login-page container" style={{ padding: '6rem 1rem', maxWidth: '480px' }}>
        <div className="contact-form-panel text-center" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
          <span className="section-tag" style={{ color: 'var(--color-gold)' }}>Acceso Administrativo</span>
          <h2 style={{ fontSize: '2.25rem', margin: '0.5rem 0' }}>Florería La Carreta</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Panel de Autogestión Integral en ASP.NET Core + MySQL
          </p>

          {loginError && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.85rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="luxury-form" style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>Usuario Administrador</label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="admin"
                className="luxury-input"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>Contraseña</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                className="luxury-input"
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {loginLoading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page container" style={{ padding: '3rem 1rem 6rem 1rem', maxWidth: '1280px' }}>
      {/* Toast Notification */}
      {feedbackMsg.text && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: feedbackMsg.type === 'error' ? '#EF4444' : '#10B981',
          color: '#FFF',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span>{feedbackMsg.type === 'error' ? '❌' : '✅'}</span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="admin-header-bar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid #E8E6E1',
        paddingBottom: '1.5rem',
        gap: '1rem'
      }}>
        <div>
          <span className="section-tag" style={{ color: 'var(--color-gold)' }}>Panel de Autogestión</span>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Florería La Carreta</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Cra 49 # 131 Sur-69, Caldas, Antioquia • +57 320 646 8689
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={fetchData}
            style={{
              padding: '0.6rem 1rem',
              backgroundColor: '#F3F4F6',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            🔄 Actualizar Datos
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#1E293B',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="category-pills-bar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '2.5rem',
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: '0.75rem'
      }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pill-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          📊 Dashboard & Métricas
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pill-btn ${activeTab === 'products' ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          💐 Arreglos Florales ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pill-btn ${activeTab === 'orders' ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          📦 Pedidos Recibidos ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pill-btn ${activeTab === 'categories' ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          🏷️ Categorías ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pill-btn ${activeTab === 'settings' ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          ⚙️ Ajustes del Negocio
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div className="loading-spinner" style={{ margin: 'auto', marginBottom: '1rem' }}></div>
          <p>Cargando información del sistema...</p>
        </div>
      )}

      {/* ================= TAB 1: DASHBOARD ================= */}
      {!loading && activeTab === 'dashboard' && (
        <div>
          {/* Key Metrics Cards */}
          <div className="process-grid" style={{ marginBottom: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="process-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <span className="section-tag" style={{ color: '#059669' }}>Ventas Totales</span>
              <h3 style={{ fontSize: '1.85rem', color: 'var(--color-accent)', margin: '0.5rem 0' }}>
                {formatCOP(dashboardStats?.totalSales ?? totalSalesCOP)}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Acumulado pedidos completados</p>
            </div>

            <div className="process-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <span className="section-tag" style={{ color: 'var(--color-gold)' }}>Pedidos Activos</span>
              <h3 style={{ fontSize: '1.85rem', color: 'var(--color-gold)', margin: '0.5rem 0' }}>
                {activeOrdersCount}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Pendientes o en preparación</p>
            </div>

            <div className="process-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <span className="section-tag" style={{ color: '#2563EB' }}>Total Pedidos</span>
              <h3 style={{ fontSize: '1.85rem', margin: '0.5rem 0' }}>
                {orders.length}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Registrados en la plataforma</p>
            </div>

            <div className="process-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <span className="section-tag" style={{ color: '#7C3AED' }}>Catálogo Activo</span>
              <h3 style={{ fontSize: '1.85rem', margin: '0.5rem 0' }}>
                {products.filter(p => p.isActive ?? true).length}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>De {products.length} productos registrados</p>
            </div>
          </div>

          {/* Orders by Status breakdown pills */}
          <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1.25rem', marginBottom: '2.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Desglose por Estado de Pedido</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                🟡 Pendientes: <strong>{orders.filter(o => o.status === 'Pendiente').length}</strong>
              </div>
              <div style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                🔵 En Preparación: <strong>{orders.filter(o => o.status === 'EnPreparacion').length}</strong>
              </div>
              <div style={{ backgroundColor: '#E0E7FF', color: '#3730A3', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                🚚 En Camino: <strong>{orders.filter(o => o.status === 'EnCamino').length}</strong>
              </div>
              <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                🟢 Entregados: <strong>{orders.filter(o => o.status === 'Entregado').length}</strong>
              </div>
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                🔴 Cancelados: <strong>{orders.filter(o => o.status === 'Cancelado').length}</strong>
              </div>
            </div>
          </div>

          {/* Top Selling Products & Recent Orders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Top Products */}
            <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.25rem' }}>🏆 Arreglos Más Populares</h3>
              {(!dashboardStats?.topProducts || dashboardStats.topProducts.length === 0) ? (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Aún no hay suficientes ventas para calcular los más populares.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardStats.topProducts.map((tp, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{idx + 1}. {tp.productName}</span>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{tp.unitsSold} unidades vendidas</div>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{formatCOP(tp.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Mini Table */}
            <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>📦 Pedidos Recientes</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Ver todos →
                </button>
              </div>

              {orders.length === 0 ? (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No hay pedidos registrados.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{o.orderCode}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{o.customerName} • {o.deliveryDate}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{formatCOP(o.totalAmount || o.total || 0)}</div>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: o.status === 'Entregado' ? '#D1FAE5' : '#FEF3C7',
                          color: o.status === 'Entregado' ? '#065F46' : '#92400E'
                        }}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PRODUCTS MANAGEMENT ================= */}
      {!loading && activeTab === 'products' && (
        <div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem'
          }}>
            <div>
              <h3 className="section-title" style={{ fontSize: '1.75rem', margin: 0 }}>Catálogo de Arreglos Florales</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                Gestiona productos, precios, fotos y disponibilidad
              </p>
            </div>
            <button
              onClick={handleOpenNewProduct}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              + Añadir Arreglo Floral
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#F9FAFB',
            padding: '1rem',
            borderRadius: '8px',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                placeholder="🔍 Buscar arreglo por nombre..."
                className="luxury-input"
                style={{ width: '100%', padding: '0.6rem 1rem' }}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="luxury-input"
                style={{ width: '100%', padding: '0.6rem 1rem' }}
              >
                <option value="todos">Todas las Categorías</option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.nameEs}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div style={{ overflowX: 'auto', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem' }}>Foto</th>
                  <th style={{ padding: '1rem' }}>Nombre / Descripción</th>
                  <th style={{ padding: '1rem' }}>Categoría</th>
                  <th style={{ padding: '1rem' }}>Precio COP</th>
                  <th style={{ padding: '1rem' }}>Destacado</th>
                  <th style={{ padding: '1rem' }}>Estado</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                      No se encontraron arreglos florales con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const name = p.nameEs || p.name_es;
                    const desc = p.descriptionEs || p.description_es;
                    const isActive = p.isActive ?? true;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB', opacity: isActive ? 1 : 0.6 }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <img
                            src={api.getImageUrl(p.image)}
                            alt={name}
                            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB' }}
                            onError={(e) => { e.target.src = '/images/roses-bouquet.jpg'; }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem 1rem', maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {desc}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            fontSize: '0.8rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '20px',
                            backgroundColor: '#F3F4F6',
                            color: '#374151',
                            textTransform: 'capitalize'
                          }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                          {formatCOP(p.price)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {p.featured ? (
                            <span title="Destacado en Home" style={{ color: '#F59E0B', fontSize: '1.25rem' }}>⭐</span>
                          ) : (
                            <span style={{ color: '#D1D5DB' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <button
                            onClick={() => handleToggleProductActive(p)}
                            title="Click para cambiar visibilidad"
                            style={{
                              padding: '0.3rem 0.75rem',
                              borderRadius: '20px',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              backgroundColor: isActive ? '#D1FAE5' : '#F3F4F6',
                              color: isActive ? '#065F46' : '#6B7280'
                            }}
                          >
                            {isActive ? '● Activo' : '○ Oculto'}
                          </button>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              style={{
                                padding: '0.4rem 0.75rem',
                                backgroundColor: '#F3F4F6',
                                border: '1px solid #D1D5DB',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, name)}
                              style={{
                                padding: '0.4rem 0.6rem',
                                backgroundColor: '#FEE2E2',
                                color: '#991B1B',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ORDERS MANAGEMENT ================= */}
      {!loading && activeTab === 'orders' && (
        <div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem'
          }}>
            <div>
              <h3 className="section-title" style={{ fontSize: '1.75rem', margin: 0 }}>Gestión de Pedidos</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                Monitorea pedidos recibidos vía web y WhatsApp en tiempo real
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#059669',
                color: '#FFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              📥 Exportar a Excel (CSV)
            </button>
          </div>

          {/* Filters Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#F9FAFB',
            padding: '1rem',
            borderRadius: '8px',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                placeholder="🔍 Buscar por cliente, teléfono o código (ej. ORD-)..."
                className="luxury-input"
                style={{ width: '100%', padding: '0.6rem 1rem' }}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="luxury-input"
                style={{ width: '100%', padding: '0.6rem 1rem' }}
              >
                <option value="todos">Todos los Estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="EnPreparacion">En Preparación</option>
                <option value="EnCamino">En Camino</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Orders Cards List */}
          {filteredOrders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#666' }}>
              No se encontraron pedidos con los filtros seleccionados.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredOrders.map(order => {
                const total = order.totalAmount || order.total || 0;
                const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
                const waMessage = encodeURIComponent(
                  `Hola ${order.customerName}, te contactamos de Florería La Carreta sobre tu pedido ${order.orderCode}. ¡Tu pedido está actualmente: ${order.status}!`
                );
                const waLink = `https://wa.me/${cleanPhone}?text=${waMessage}`;

                return (
                  <div key={order.id} style={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem', marginBottom: '1rem', gap: '1rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B' }}>{order.orderCode || `ORD-${order.id}`}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748B', marginLeft: '0.75rem' }}>
                          📅 {new Date(order.createdAt).toLocaleString('es-CO')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Estado:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            border: '1px solid #D1D5DB',
                            backgroundColor:
                              order.status === 'Entregado' ? '#D1FAE5' :
                              order.status === 'EnCamino' ? '#E0E7FF' :
                              order.status === 'EnPreparacion' ? '#DBEAFE' :
                              order.status === 'Cancelado' ? '#FEE2E2' : '#FEF3C7',
                            color:
                              order.status === 'Entregado' ? '#065F46' :
                              order.status === 'EnCamino' ? '#3730A3' :
                              order.status === 'EnPreparacion' ? '#1E40AF' :
                              order.status === 'Cancelado' ? '#991B1B' : '#92400E'
                          }}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="EnPreparacion">En Preparación</option>
                          <option value="EnCamino">En Camino</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>

                        <button
                          onClick={() => handleDeleteOrder(order.id, order.orderCode)}
                          title="Eliminar Pedido"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase' }}>Cliente</h4>
                        <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                          📞 <a href={`tel:${order.customerPhone}`} style={{ color: '#2563EB' }}>{order.customerPhone}</a>
                          {cleanPhone && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                marginLeft: '0.5rem',
                                color: '#16A34A',
                                fontWeight: 600,
                                textDecoration: 'none'
                              }}
                            >
                              💬 WhatsApp
                            </a>
                          )}
                        </div>
                        {order.customerEmail && (
                          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>✉️ {order.customerEmail}</div>
                        )}
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase' }}>Entrega</h4>
                        <div style={{ fontSize: '0.9rem' }}>📍 {order.deliveryAddress}</div>
                        <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem' }}>
                          ⏰ {order.deliveryDate} {order.deliveryTime ? `• ${order.deliveryTime}` : ''}
                        </div>
                        {order.specialNotes && (
                          <div style={{ fontSize: '0.85rem', color: '#E11D48', marginTop: '0.25rem' }}>
                            Nota: {order.specialNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {order.cardMessage && (
                      <div style={{
                        backgroundColor: '#FFFBEB',
                        borderLeft: '4px solid #F59E0B',
                        padding: '0.75rem 1rem',
                        borderRadius: '0 4px 4px 0',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                      }}>
                        <strong>💌 Mensaje de la dedicatoria:</strong> <em>"{order.cardMessage}"</em>
                      </div>
                    )}

                    {/* Order Items Table */}
                    <div style={{ backgroundColor: '#F9FAFB', borderRadius: '6px', padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Productos Solicitados:</div>
                      {order.items && order.items.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                              <span>{item.quantity}x {item.productName}</span>
                              <span style={{ fontWeight: 500 }}>{formatCOP(item.totalPrice || (item.unitPrice * item.quantity))}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Detalle de productos guardado en descripción.</div>
                      )}
                      <div style={{
                        borderTop: '1px solid #E5E7EB',
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        color: 'var(--color-gold)'
                      }}>
                        <span>TOTAL:</span>
                        <span>{formatCOP(total)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: CATEGORIES MANAGEMENT ================= */}
      {!loading && activeTab === 'categories' && (
        <div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem'
          }}>
            <div>
              <h3 className="section-title" style={{ fontSize: '1.75rem', margin: 0 }}>Gestión de Categorías</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                Organiza las secciones del catálogo de flores
              </p>
            </div>
            <button
              onClick={handleOpenNewCategory}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              + Nueva Categoría
            </button>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem' }}>Icono</th>
                  <th style={{ padding: '1rem' }}>Nombre (Español)</th>
                  <th style={{ padding: '1rem' }}>Nombre (Inglés)</th>
                  <th style={{ padding: '1rem' }}>Slug / Identificador</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Orden</th>
                  <th style={{ padding: '1rem' }}>Estado</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id || cat.slug} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '1rem', fontSize: '1.5rem' }}>{cat.icon || '🌸'}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{cat.nameEs}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>{cat.nameEn}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#2563EB' }}>{cat.slug}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{cat.sortOrder ?? 0}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: cat.isActive ? '#D1FAE5' : '#F3F4F6',
                        color: cat.isActive ? '#065F46' : '#6B7280'
                      }}>
                        {cat.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            backgroundColor: '#F3F4F6',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          ✏️ Editar
                        </button>
                        {cat.slug !== 'todos' && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.nameEs)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: '#FEE2E2',
                              color: '#991B1B',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: BUSINESS SETTINGS ================= */}
      {!loading && activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
          {/* Business Info Form */}
          <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginTop: 0, marginBottom: '0.5rem' }}>🏢 Información del Negocio</h3>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Los cambios guardados aquí se actualizan instantáneamente en el Header, Footer, WhatsApp y página de Contacto.
            </p>

            <form onSubmit={handleSaveSettings} className="luxury-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Teléfono de Llamadas</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.businessPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, businessPhone: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Número WhatsApp (sin +)</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.whatsAppNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsAppNumber: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Correo Electrónico Comercial</label>
                <input
                  type="email"
                  required
                  value={settingsForm.businessEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, businessEmail: e.target.value })}
                  className="luxury-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Dirección Física</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Ciudad / Región</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.city}
                    onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Horario Lunes a Sábado</label>
                  <input
                    type="text"
                    value={settingsForm.scheduleWeekdays}
                    onChange={(e) => setSettingsForm({ ...settingsForm, scheduleWeekdays: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Horario Domingos / Festivos</label>
                  <input
                    type="text"
                    value={settingsForm.scheduleWeekends}
                    onChange={(e) => setSettingsForm({ ...settingsForm, scheduleWeekends: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Instagram URL</label>
                <input
                  type="url"
                  value={settingsForm.instagramUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  className="luxury-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Facebook URL (Opcional)</label>
                <input
                  type="url"
                  value={settingsForm.facebookUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                  className="luxury-input"
                  placeholder="https://facebook.com/..."
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Google Maps Embed URL</label>
                <input
                  type="text"
                  value={settingsForm.googleMapsEmbedUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsEmbedUrl: e.target.value })}
                  className="luxury-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Zonas de Cobertura y Entrega</label>
                <textarea
                  rows="2"
                  value={settingsForm.deliveryNotes}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deliveryNotes: e.target.value })}
                  className="luxury-input"
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.85rem', cursor: 'pointer' }}
              >
                💾 Guardar Configuración del Negocio
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div>
            <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.4rem', marginTop: 0, marginBottom: '0.5rem' }}>🔐 Seguridad de la Cuenta</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Cambia la contraseña de acceso al panel de administración.
              </p>

              <form onSubmit={handleChangePassword} className="luxury-form">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Contraseña Actual</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="luxury-input"
                    placeholder="••••••••"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="luxury-input"
                    placeholder="••••••••"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="luxury-input"
                    placeholder="••••••••"
                    style={{ width: '100%' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    backgroundColor: '#1E293B',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {passwordLoading ? 'Actualizando...' : '🔒 Actualizar Contraseña'}
                </button>
              </form>
            </div>

            {/* Quick Live Preview of Map */}
            {settingsForm.googleMapsEmbedUrl && (
              <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>🗺️ Vista Previa del Mapa</h4>
                <iframe
                  title="Google Maps Preview"
                  src={settingsForm.googleMapsEmbedUrl}
                  width="100%"
                  height="200"
                  style={{ border: 0, borderRadius: '6px' }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= PRODUCT MODAL ================= */}
      {isProductModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>
                {editingProduct ? '✏️ Editar Arreglo Floral' : '🌸 Nuevo Arreglo Floral'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="luxury-form">
              {/* Product Names ES / EN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Nombre (Español)</label>
                  <input
                    type="text"
                    required
                    value={productForm.name_es}
                    onChange={(e) => setProductForm({ ...productForm, name_es: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Nombre (Inglés)</label>
                  <input
                    type="text"
                    value={productForm.name_en}
                    onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Descriptions ES / EN */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Descripción (Español)</label>
                <textarea
                  rows="2"
                  required
                  value={productForm.description_es}
                  onChange={(e) => setProductForm({ ...productForm, description_es: e.target.value })}
                  className="luxury-input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Price & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Precio (COP $)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Categoría</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  >
                    {categories.filter(c => c.slug !== 'todos').map(cat => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.icon} {cat.nameEs}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload Box */}
              <div style={{
                border: '2px dashed #D1D5DB',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1.25rem',
                backgroundColor: '#F9FAFB'
              }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  📸 Foto del Arreglo Floral
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <img
                    src={api.getImageUrl(productForm.image)}
                    alt="Preview"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    onError={(e) => { e.target.src = '/images/roses-bouquet.jpg'; }}
                  />

                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      id="product-image-upload"
                      style={{ display: 'none' }}
                      onChange={handleImageFileUpload}
                    />
                    <label
                      htmlFor="product-image-upload"
                      style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#FFF',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: '#374151'
                      }}
                    >
                      {uploadingImage ? 'Subiendo imagen...' : '⬆️ Subir Nueva Foto'}
                    </label>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
                      Formatos soportados: JPG, PNG, WEBP (hasta 10MB)
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Ruta de la imagen:</span>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="luxury-input"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              {/* Occasions Tags */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Ocasiones recomendadas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={productForm.occasion_es}
                  onChange={(e) => setProductForm({ ...productForm, occasion_es: e.target.value })}
                  placeholder="Amor, Aniversario, Cumpleaños"
                  className="luxury-input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Checkboxes: Featured and Active */}
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', backgroundColor: '#F3F4F6', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  ⭐ Destacar en Página Principal
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  👁️ Visible en Catálogo (Activo)
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Arreglo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CATEGORY MODAL ================= */}
      {isCategoryModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>
                {editingCategory ? '✏️ Editar Categoría' : '🏷️ Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="luxury-form">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Nombre en Español</label>
                <input
                  type="text"
                  required
                  value={categoryForm.nameEs}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameEs: e.target.value })}
                  placeholder="Ramos Elegantes"
                  className="luxury-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Nombre en Inglés</label>
                <input
                  type="text"
                  value={categoryForm.nameEn}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                  placeholder="Elegant Bouquets"
                  className="luxury-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Icono / Emoji</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="💐"
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Orden de Aparición</label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Slug URL (identificador)</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="ramos-elegantes"
                  className="luxury-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  Categoría Activa (Visible en catálogo)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
                >
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
