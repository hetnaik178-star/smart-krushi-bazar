import axios from 'axios';

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
  const { data } = await axios.post(`${API_URL}/auth/register`, userData);
  return data;
};

export const loginUser = async (userData) => {
  const { data } = await axios.post(`${API_URL}/auth/login`, userData);
  return data;
};

export const getProducts = async (params) => {
  const { data } = await axios.get(`${API_URL}/products`, { params });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await axios.get(`${API_URL}/products/${id}`);
  return data?.data || data;
};

export const createProduct = async (productData) => {
  const { data } = await axios.post(`${API_URL}/products`, productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await axios.put(`${API_URL}/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await axios.delete(`${API_URL}/products/${id}`);
  return data;
};

export const getMyProducts = async () => {
  const { data } = await axios.get(`${API_URL}/products/my`);
  return data;
};

export const createOrder = async (orderData) => {
  const { data } = await axios.post(`${API_URL}/orders`, orderData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await axios.get(`${API_URL}/orders/my-orders`);
  return data;
};

export const getFarmerOrders = async () => {
  const { data } = await axios.get(`${API_URL}/orders/farmer-orders`);
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await axios.put(`${API_URL}/orders/${id}/status`, { status });
  return data;
};

// Expert & Consultation Services
export const getExpertById = async (id) => {
  const { data } = await axios.get(`${API_URL}/experts/${id}`);
  return data?.data || data;
};

export const bookConsultation = async (formData) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const { data } = await axios.post(`${API_URL}/consultations`, formData, { headers });
  return data;
};

// Admin Services
export const getAdminUsers = async () => {
  const { data } = await axios.get(`${API_URL}/admin/users`);
  return data;
};

export const getAdminProducts = async () => {
  const { data } = await axios.get(`${API_URL}/admin/products`);
  return data;
};

export const getAdminOrders = async () => {
  const { data } = await axios.get(`${API_URL}/admin/orders`);
  return data;
};

export const deleteAdminUser = async (id) => {
  const { data } = await axios.delete(`${API_URL}/admin/users/${id}`);
  return data;
};

export const deleteAdminProduct = async (id) => {
  const { data } = await axios.delete(`${API_URL}/admin/products/${id}`);
  return data;
};

export { api };
export default api;
