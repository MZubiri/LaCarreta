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
  deliveryNotes: "Entregas en Caldas, La Estrella, Sabaneta, Itagüí y Envigado."
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
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error al crear producto: ${errorText}`);
    }
    return await res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...productData, id })
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error al actualizar producto: ${errorText}`);
    }
    return await res.json();
  },

  async toggleProductActive(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}/toggle-active`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al cambiar estado de producto");
    return await res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar producto");
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
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error("Error al crear categoría");
    return await res.json();
  },

  async updateCategory(id, categoryData) {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...categoryData, id })
    });
    if (!res.ok) throw new Error("Error al actualizar categoría");
    return await res.json();
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar categoría");
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

  async createOrder(orderData) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Error al registrar el pedido: ${err}`);
    }
    return await res.json();
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Error al actualizar estado del pedido");
    return true;
  },

  async deleteOrder(id) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar pedido");
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
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData)
    });
    if (!res.ok) throw new Error("Error al actualizar la configuración");
    const updated = await res.json();
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  // ================= DASHBOARD =================
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al obtener estadísticas del dashboard");
    return await res.json();
  },

  // ================= UPLOAD =================
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: getHeaders(true), // multipart
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al subir la imagen");
    }

    return await res.json(); // { url: "/uploads/products/xyz.jpg", fileName: "xyz.jpg" }
  },

  // ================= CONTACT =================
  async sendContact(contactData) {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al enviar mensaje de contacto");
    }
    return await res.json();
  },

  // ================= AUTH =================
  async login(username, password) {
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
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al cambiar contraseña");
    }
    return await res.json();
  },

  logout() {
    removeToken();
  }
};
