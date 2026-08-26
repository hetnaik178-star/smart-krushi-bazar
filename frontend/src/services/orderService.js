import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const initiateOrder = (productId, quantity) =>
  axios.post(`${API_URL}/orders/initiate`, { productId, quantity }, auth()).then(r => r.data);

export const getMyOrders = () =>
  axios.get(`${API_URL}/orders/my`, auth()).then(r => r.data);

export const getReceivedOrders = () =>
  axios.get(`${API_URL}/orders/received`, auth()).then(r => r.data);

export const updateOrderStatus = (id, status) =>
  axios.patch(`${API_URL}/orders/${id}/status`, { status }, auth()).then(r => r.data);
