import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getExperts = async (params = {}) => {
  const { data } = await axios.get(`${API_URL}/experts`, { params });
  return data;
};

export const getExpertById = async (id) => {
  const { data } = await axios.get(`${API_URL}/experts/${id}`);
  return data?.data || data;
};

export const updateExpertProfile = async (profileData) => {
  const { data } = await axios.put(`${API_URL}/experts/profile`, profileData, getAuthHeaders());
  return data;
};
