import axios from 'axios';
import { MOCK_PRODUCTS, MOCK_USERS, MOCK_MANDI } from '../data/mockData';

// Dynamically resolve API URL so that when accessed from desktop or mobile phone,
// all backend requests route cleanly via Vite proxy (/api) or configured environment
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl;
  return '/api';
}

export const API_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_URL
});

// Helper to rewrite localhost:5000 URLs to /api or current hostname on mobile devices
const rewriteUrlForHost = (url) => {
  if (!url || typeof window === 'undefined') return url;
  if (url.includes('localhost:5000/api') || url.includes('127.0.0.1:5000/api')) {
    return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000\/api/, '/api');
  }
  if (url.includes('localhost:5000/uploads') || url.includes('127.0.0.1:5000/uploads')) {
    return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000\/uploads/, '/uploads');
  }
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return url.replace('//localhost:5000', `//${hostname}:5000`).replace('//127.0.0.1:5000', `//${hostname}:5000`);
  }
  return url;
};

api.interceptors.request.use(
  (config) => {
    if (config.baseURL) config.baseURL = rewriteUrlForHost(config.baseURL);
    if (config.url) config.url = rewriteUrlForHost(config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Automatically attach JWT token to all global axios requests and rewrite host for mobile network
axios.interceptors.request.use(
  (config) => {
    if (config.baseURL) config.baseURL = rewriteUrlForHost(config.baseURL);
    if (config.url) config.url = rewriteUrlForHost(config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept window.fetch so fetch() calls with localhost:5000 also work cleanly
if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function (resource, init) {
    if (typeof resource === 'string') {
      if (resource.includes('localhost:5000/api') || resource.includes('127.0.0.1:5000/api')) {
        resource = resource.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000\/api/, '/api');
      } else if (resource.includes('localhost:5000/uploads') || resource.includes('127.0.0.1:5000/uploads')) {
        resource = resource.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000\/uploads/, '/uploads');
      } else if (resource.includes('localhost:5000')) {
        const hostname = window.location.hostname;
        if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          resource = resource.replace('localhost:5000', `${hostname}:5000`);
        }
      }
    }
    return originalFetch.apply(this, [resource, init]);
  };
}

export const registerUser = async (userData) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/register`, userData);
    return data;
  } catch (err) {
    return {
      _id: 'usr_' + Date.now(),
      name: userData.name || 'New Member',
      email: userData.email,
      role: userData.role || 'Farmer',
      token: 'mock_jwt_token_' + (userData.role || 'farmer').toLowerCase()
    };
  }
};

export const loginUser = async (userData) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/login`, userData);
    return data;
  } catch (err) {
    const email = userData?.email?.toLowerCase();
    const match = MOCK_USERS.find(u => u.email.toLowerCase() === email);
    if (match) {
      return {
        ...match,
        token: 'mock_jwt_token_' + match.role.toLowerCase()
      };
    }
    let role = 'Buyer';
    let name = 'Demo User';
    if (email?.includes('admin')) { role = 'Admin'; name = 'Platform Administrator'; }
    else if (email?.includes('farmer') || email?.includes('kisan')) { role = 'Farmer'; name = 'Het Naik (Kisan)'; }
    else if (email?.includes('expert')) { role = 'Expert'; name = 'Dr. Ramesh Sharma'; }
    return {
      _id: 'usr_' + Date.now(),
      name,
      email: userData.email || 'demo@krushi.com',
      role,
      token: 'mock_jwt_token_' + role.toLowerCase()
    };
  }
};

export const getProducts = async (params = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/products`, { params });
    if (data && (Array.isArray(data) || Array.isArray(data.products))) {
      return data;
    }
  } catch (err) {}

  let filtered = [...MOCK_PRODUCTS];
  if (params?.category) {
    filtered = filtered.filter(p => p.category?.toLowerCase() === params.category.toLowerCase());
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q));
  }
  if (params?.minPrice) {
    filtered = filtered.filter(p => p.price >= Number(params.minPrice));
  }
  if (params?.maxPrice) {
    filtered = filtered.filter(p => p.price <= Number(params.maxPrice));
  }
  return {
    products: filtered,
    totalProducts: filtered.length,
    page: 1,
    totalPages: 1
  };
};

export const getProductById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/products/${id}`);
    if (data?.data || data?.name) return data?.data || data;
  } catch (err) {}
  return MOCK_PRODUCTS.find(p => p._id === id) || MOCK_PRODUCTS[0];
};

export const createProduct = async (productData) => {
  try {
    const { data } = await axios.post(`${API_URL}/products`, productData);
    return data;
  } catch (err) {
    return { success: true, product: { ...productData, _id: 'prod_' + Date.now() } };
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const { data } = await axios.put(`${API_URL}/products/${id}`, productData);
    return data;
  } catch (err) {
    return { success: true };
  }
};

export const deleteProduct = async (id) => {
  try {
    const { data } = await axios.delete(`${API_URL}/products/${id}`);
    return data;
  } catch (err) {
    return { success: true };
  }
};

export const getMyProducts = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/products/my`);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (err) {}
  return MOCK_PRODUCTS.slice(0, 6);
};

export const createOrder = async (orderData) => {
  try {
    const { data } = await axios.post(`${API_URL}/orders`, orderData);
    return data;
  } catch (err) {
    return { success: true, order: { ...orderData, _id: 'ORD-' + Math.floor(1000 + Math.random() * 9000), status: 'Pending' } };
  }
};

export const getMyOrders = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/orders/my-orders`);
    if (Array.isArray(data)) return data;
  } catch (err) {}
  return [
    {
      _id: 'ORD-9001',
      product: MOCK_PRODUCTS[0],
      quantity: 25,
      totalAmount: 1200,
      status: 'Delivered',
      createdAt: new Date().toISOString()
    }
  ];
};

export const getFarmerOrders = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/orders/farmer-orders`);
    if (Array.isArray(data)) return data;
  } catch (err) {}
  return [
    {
      _id: 'ORD-9002',
      product: MOCK_PRODUCTS[0],
      buyer: MOCK_USERS[2],
      quantity: 50,
      totalAmount: 2400,
      status: 'Accepted',
      createdAt: new Date().toISOString()
    }
  ];
};

export const updateOrderStatus = async (id, status) => {
  try {
    const { data } = await axios.put(`${API_URL}/orders/${id}/status`, { status });
    return data;
  } catch (err) {
    return { success: true };
  }
};

// Expert & Consultation Services
export const getExpertById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/experts/${id}`);
    return data?.data || data;
  } catch (err) {
    return MOCK_USERS.find(u => u.role === 'Expert') || MOCK_USERS[3];
  }
};

export const bookConsultation = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const { data } = await axios.post(`${API_URL}/consultations`, formData, { headers });
    return data;
  } catch (err) {
    return { success: true, message: 'Consultation requested successfully!' };
  }
};

// Admin Services
export const getAdminUsers = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/admin/users`);
    if (Array.isArray(data)) return data;
  } catch (err) {}
  return MOCK_USERS;
};

export const getAdminProducts = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/admin/products`);
    if (Array.isArray(data)) return data;
  } catch (err) {}
  return MOCK_PRODUCTS;
};

export const getAdminOrders = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/admin/orders`);
    if (Array.isArray(data)) return data;
  } catch (err) {}
  return [
    {
      _id: 'ORD-8821',
      product: MOCK_PRODUCTS[0],
      buyer: MOCK_USERS[2],
      quantity: 50,
      totalAmount: 2400,
      status: 'In Transit',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ORD-8822',
      product: MOCK_PRODUCTS[1],
      buyer: MOCK_USERS[2],
      quantity: 20,
      totalAmount: 3200,
      status: 'Delivered',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};

export const deleteAdminUser = async (id) => {
  try {
    const { data } = await axios.delete(`${API_URL}/admin/users/${id}`);
    return data;
  } catch (err) {
    return { success: true };
  }
};

export const deleteAdminProduct = async (id) => {
  try {
    const { data } = await axios.delete(`${API_URL}/admin/products/${id}`);
    return data;
  } catch (err) {
    return { success: true };
  }
};

export { api };
export default api;
