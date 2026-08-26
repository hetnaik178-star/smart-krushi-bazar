import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const createRazorpayOrder = (payload) =>
  axios.post(`${API_URL}/payments/create-order`, payload, auth()).then(r => r.data);

export const verifyPayment = (payload) =>
  axios.post(`${API_URL}/payments/verify`, payload, auth()).then(r => r.data);

export const reportPaymentFailure = (payload) =>
  axios.post(`${API_URL}/payments/failed`, payload, auth()).then(r => r.data);

export const getAllPayments = (queryString = '') =>
  axios.get(`${API_URL}/payments${queryString ? '?' + queryString : ''}`, auth()).then(r => r.data);
