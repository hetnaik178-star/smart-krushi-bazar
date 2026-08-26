import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const createDispute = async (formData) => {
  const { data } = await axios.post(`${API_URL}/disputes`, formData, {
    ...getAuthHeaders(),
    headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const getMyDisputes = async () => {
  const { data } = await axios.get(`${API_URL}/disputes/my`, getAuthHeaders());
  return data;
};

export const getAllDisputes = async () => {
  const { data } = await axios.get(`${API_URL}/disputes`, getAuthHeaders());
  return data;
};

export const resolveDispute = async (id, resolveData) => {
  const { data } = await axios.put(`${API_URL}/disputes/${id}/resolve`, resolveData, getAuthHeaders());
  return data;
};
