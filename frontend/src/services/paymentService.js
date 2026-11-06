import axios from 'axios';
import { API_URL } from './api';
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const createRazorpayOrder = (payload) =>
  axios.post(`${API_URL}/payments/create-order`, payload, auth()).then(r => r.data);

export const verifyPayment = (payload) =>
  axios.post(`${API_URL}/payments/verify`, payload, auth()).then(r => r.data);

export const reportPaymentFailure = (payload) =>
  axios.post(`${API_URL}/payments/failed`, payload, auth()).then(r => r.data);

export const getAllPayments = (queryString = '') =>
  axios.get(`${API_URL}/payments${queryString ? '?' + queryString : ''}`, auth()).then(r => r.data);
