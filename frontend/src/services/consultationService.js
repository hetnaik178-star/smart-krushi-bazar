import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const bookConsultation = async (formData) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Note: Do NOT manually set 'Content-Type': 'multipart/form-data'
  // When FormData is passed, Axios and the browser will automatically compute the correct boundary parameter.
  const { data } = await axios.post(`${API_URL}/consultations`, formData, {
    headers
  });
  return data;
};

export const getMyConsultations = async () => {
  const { data } = await axios.get(`${API_URL}/consultations`, getAuthHeaders());
  return data;
};

export const getConsultationById = async (id) => {
  const { data } = await axios.get(`${API_URL}/consultations/${id}`, getAuthHeaders());
  return data;
};

export const updateConsultationStatus = async (id, statusData) => {
  const { data } = await axios.put(`${API_URL}/consultations/${id}/status`, statusData, getAuthHeaders());
  return data;
};
