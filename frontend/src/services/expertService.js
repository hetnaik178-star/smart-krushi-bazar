import axios from 'axios';
import { API_URL } from './api';

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
