import productsLocal from '../data/products.json';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token Management
export const getToken = () => localStorage.getItem('floreria_token');
export const setToken = (token) => localStorage.setItem('floreria_token', token);
export const removeToken = () => {
  localStorage.removeItem('floreria_token');
  localStorage.removeItem('floreria_admin_logged');
};

const getHeaders = (isMultipart = false) => {
  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Fallback products and orders for resilient offline development
const LOCAL_PRODUCTS_KEY = 'floreria_admin_products';
const LOCAL_ORDERS_KEY = 'floreria_admin_orders';
const LOCAL_SETTINGS_KEY = 'floreria_site_settings';
const LOCAL_CATEGORIES_KEY = 'floreria_categories';

const defaultSettings = {
  businessPhone: "+573206468689",
  whatsAppNumber: "573206468689",
  businessEmail: "pedidos@florerialacarreta.com",
  address: "Cra 49 # 131 Sur-69",
  city: "Caldas, Antioquia, Colombia",
  instagramUrl: "https://www.instagram.com/floristeria_la_carreta",
  facebookUrl: "",
  scheduleWeekdays: "Lunes a Sábado: 8:00 AM - 6:00 PM",
  scheduleWeekends: "Domingos y Festivos: Cerrado",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.0583547070116!2d-75.6378!3d6.0911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e468307db4ef757%3A0x6b1c4e78a6ea23f0!2sCra.%2049%20%23131%20Sur-69%2C%20Caldas%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1709000000000!5m2!1ses!2sco",
  deliveryNotes: "Entregas a domicilio en todo Medellín y municipios del área metropolitana.",
  heroImageUrl: "/images/hero-floral.jpg",
  heroTitle: "Arreglos florales hechos con pasión artesanal",
  heroTag: "Colección Floral Antioquia",
  telegramBotToken: "",
  telegramChatId: "",
  webhookUrl: ""
};

const defaultCategories = [
  { id: 1, slug: 'todos', nameEs: 'Todos', nameEn: 'All', icon: '🌸', sortOrder: 0, isActive: true },
  { id: 2, slug: 'ramos', nameEs: 'Ramos Florales', nameEn: 'Bouquets', icon: '💐', sortOrder: 1, isActive: true },
  { id: 3, slug: 'arreglos', nameEs: 'Centros y Arreglos', nameEn: 'Arrangements', icon: '🏺', sortOrder: 2, isActive: true },
  { id: 4, slug: 'plantas', nameEs: 'Plantas Vivas', nameEn: 'Live Plants', icon: '🌿', sortOrder: 3, isActive: true },
  { id: 5, slug: 'premium', nameEs: 'Especiales y Cajas', nameEn: 'Specials & Boxes', icon: '✨', sortOrder: 4, isActive: true },
  { id: 6, slug: 'condolencias', nameEs: 'Condolencias', nameEn: 'Sympathy', icon: '🕊️', sortOrder: 5, isActive: true }
];

export const api = {
  // BASE URL EXPOSURE (for uploaded images)
  getBaseUrl() {
    return API_BASE_URL.replace(/\/api$/, '');
  },

  // Resolve image URL helper
  getImageUrl(imagePath) {
    if (!imagePath) return '/images/roses-bouquet.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/uploads/')) {
      const base = API_BASE_URL.replace(/\/api$/, '');
      return `${base}${imagePath}`;
    }
    return imagePath;
  },

  // ================= PRODUCTS =================
  async getProducts(category = null) {
    try {
      const url = category && category !== 'todos'
        ? `${API_BASE_URL}/products?category=${encodeURIComponent(category)}`
        : `${API_BASE_URL}/products`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn("API offline or error fetching products, using local fallback", e);
    }
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    const local = saved ? JSON.parse(saved) : productsLocal;
    if (category && category !== 'todos') {
      return local.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    return local;
  },

  async getFeaturedProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products/featured`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn("API offline, using local featured products", e);
    }
    const prods = await this.getProducts();
    return prods.filter(p => p.featured);
  },

  async getAllProductsAdmin() {
    try {
      const res = await fetch(`${API_BASE_URL}/products/admin`, {
        headers: getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, falling back to all local products", e);
    }
    return this.getProducts();
  },

  async getProduct(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`API offline, fetching product ${id} locally`, e);
    }
    const prods = await this.getProducts();
    return prods.find(p => p.id === Number(id)) || null;
  },

  async createProduct(productData) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(productData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, creating product locally", e);
    }
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    const prods = saved ? JSON.parse(saved) : [...productsLocal];
    const newId = prods.length > 0 ? Math.max(...prods.map(p => p.id || 0)) + 1 : 1;
    const newProd = { ...productData, id: newId };
    prods.unshift(newProd);
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(prods));
    return newProd;
  },

  async updateProduct(id, productData) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...productData, id })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, updating product locally", e);
    }
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    const prods = saved ? JSON.parse(saved) : [...productsLocal];
    const index = prods.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      prods[index] = { ...prods[index], ...productData, id: Number(id) };
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(prods));
      return prods[index];
    }
    return productData;
  },

  async toggleProductActive(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}/toggle-active`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, toggling product locally", e);
    }
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    const prods = saved ? JSON.parse(saved) : [...productsLocal];
    const index = prods.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      prods[index].isActive = !(prods[index].isActive ?? true);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(prods));
      return prods[index];
    }
    return { id, isActive: false };
  },

  async deleteProduct(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("API offline, deleting product locally", e);
    }
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    const prods = saved ? JSON.parse(saved) : [...productsLocal];
    const filtered = prods.filter(p => p.id !== Number(id));
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(filtered));
    return true;
  },

  // ================= CATEGORIES =================
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn("API offline, using local categories", e);
    }
    const saved = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : defaultCategories;
  },

  async getAllCategoriesAdmin() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/all`, {
        headers: getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, using local categories admin", e);
    }
    return this.getCategories();
  },

  async createCategory(categoryData) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(categoryData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, creating category locally", e);
    }
    const saved = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    const cats = saved ? JSON.parse(saved) : [...defaultCategories];
    const newId = cats.length > 0 ? Math.max(...cats.map(c => c.id || 0)) + 1 : 1;
    const newCat = { ...categoryData, id: newId };
    cats.push(newCat);
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(cats));
    return newCat;
  },

  async updateCategory(id, categoryData) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...categoryData, id })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, updating category locally", e);
    }
    const saved = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    const cats = saved ? JSON.parse(saved) : [...defaultCategories];
    const idx = cats.findIndex(c => c.id === Number(id));
    if (idx !== -1) {
      cats[idx] = { ...cats[idx], ...categoryData, id: Number(id) };
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(cats));
      return cats[idx];
    }
    return categoryData;
  },

  async deleteCategory(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("API offline, deleting category locally", e);
    }
    const saved = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    const cats = saved ? JSON.parse(saved) : [...defaultCategories];
    const filtered = cats.filter(c => c.id !== Number(id));
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(filtered));
    return true;
  },

  // ================= ORDERS =================
  async getOrders(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'todos') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const url = `${API_BASE_URL}/orders${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, returning fallback orders", e);
    }
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  async getOrder(id) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Pedido no encontrado");
    return await res.json();
  },

  async trackOrder(query) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn("API offline, searching local orders for tracking", e);
    }
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    const orders = saved ? JSON.parse(saved) : [];
    const cleanQuery = query.toLowerCase().trim();
    const cleanPhone = query.replace(/\D/g, '');
    const found = orders.filter(o => 
      (o.orderCode && o.orderCode.toLowerCase().includes(cleanQuery)) ||
      (cleanPhone && o.customerPhone && o.customerPhone.includes(cleanPhone))
    );
    if (found.length === 0) {
      throw new Error("No encontramos ningún pedido con ese código o número de teléfono.");
    }
    return found;
  },

  async createOrder(orderData) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, saving order locally", e);
    }
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    const orders = saved ? JSON.parse(saved) : [];
    const orderCode = `FLC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, '0')}`;
    const itemsTotal = (orderData.items || []).reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
    const deliveryFee = Number(orderData.deliveryFee || 0);
    const newOrder = {
      ...orderData,
      id: orders.length + 1,
      orderCode,
      status: 'Pendiente',
      deliveryMunicipality: orderData.deliveryMunicipality || 'Medellín',
      deliveryFee,
      cardStyle: orderData.cardStyle || 'Clásica Floral',
      cardSender: orderData.cardSender || '',
      totalAmount: itemsTotal + deliveryFee,
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    return newOrder;
  },

  async updateOrderStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("API offline, updating order status locally", e);
    }
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    const orders = saved ? JSON.parse(saved) : [];
    const idx = orders.findIndex(o => o.id === Number(id));
    if (idx !== -1) {
      orders[idx].status = status;
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    }
    return true;
  },

  async deleteOrder(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("API offline, deleting order locally", e);
    }
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    const orders = saved ? JSON.parse(saved) : [];
    const filtered = orders.filter(o => o.id !== Number(id));
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(filtered));
    return true;
  },

  // ================= SETTINGS =================
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn("API offline, using local settings", e);
    }
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  },

  async updateSettings(settingsData) {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settingsData)
      });
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
        return updated;
      }
    } catch (e) {
      console.warn("API offline, saving settings locally", e);
    }
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settingsData));
    return settingsData;
  },

  // ================= DASHBOARD =================
  async getDashboardStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, calculating local dashboard stats", e);
    }
    const savedOrders = localStorage.getItem(LOCAL_ORDERS_KEY);
    const orders = savedOrders ? JSON.parse(savedOrders) : [
      {
        id: 1,
        orderCode: 'FLC-2026-0001',
        customerName: 'Carolina Restrepo',
        customerPhone: '3201234567',
        deliveryAddress: 'Calle 130 Sur # 50-20, Caldas',
        totalAmount: 145000,
        status: 'Completado',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        orderCode: 'FLC-2026-0002',
        customerName: 'Juan Pablo Montoya',
        customerPhone: '3109876543',
        deliveryAddress: 'Cra 48 # 128 Sur-15, Caldas',
        totalAmount: 220000,
        status: 'En Proceso',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        orderCode: 'FLC-2026-0003',
        customerName: 'Marcela Uribe',
        customerPhone: '3005551234',
        deliveryAddress: 'Sabaneta, Parque Principal',
        totalAmount: 180000,
        status: 'Pendiente',
        createdAt: new Date().toISOString()
      }
    ];
    const savedProds = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    const prods = savedProds ? JSON.parse(savedProds) : productsLocal;
    const totalSales = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    return {
      totalSales,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'Pendiente').length,
      totalProducts: prods.length,
      recentOrders: orders.slice(0, 5),
      topProducts: prods.slice(0, 5).map(p => ({
        productId: p.id,
        productName: p.nameEs || p.name_es || p.name || 'Arreglo Floral',
        image: p.image || '/images/roses-bouquet.jpg',
        unitsSold: 8,
        revenue: (Number(p.price) || 120000) * 8
      }))
    };
  },

  // ================= UPLOAD =================
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("API offline, using local object URL for uploaded image preview", e);
    }
    // Return local object URL for preview
    return {
      url: URL.createObjectURL(file),
      fileName: file.name
    };
  },

  // ================= CONTACT =================
  async sendContact(contactData) {
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, simulating contact message success", e);
    }
    return { success: true, message: "Mensaje recibido correctamente (modo local)." };
  },

  // ================= AUTH =================
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Usuario o contraseña incorrectos" }));
        throw new Error(err.message || "Credenciales incorrectas");
      }

      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('floreria_admin_logged', 'true');
      }
      return data;
    } catch (err) {
      if (err.message && err.message.includes('Credenciales incorrectas')) {
        throw err;
      }
      // If network fails (backend offline), allow demo login
      if (username === 'admin' && (password === 'AdminDemo2026' || password === 'admin')) {
        console.warn("API offline: logging in with local demo credentials");
        localStorage.setItem('floreria_admin_logged', 'true');
        setToken('demo-local-jwt-token-2026');
        return { token: 'demo-local-jwt-token-2026', username: 'admin' };
      }
      throw new Error(err.message || "Credenciales incorrectas o servidor no disponible");
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API offline, simulating password change", e);
    }
    return { message: "Contraseña actualizada exitosamente (modo demo local)." };
  },

  logout() {
    removeToken();
  }
};
