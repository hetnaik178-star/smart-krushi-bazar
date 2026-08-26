import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Automatically attach JWT token to all requests if present in localStorage
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
