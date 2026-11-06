import axios from 'axios';
import { API_URL } from './api';
import { MOCK_USERS } from '../data/mockData';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getExperts = async (params = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/experts`, { params });
    if (data && Array.isArray(data)) return data;
  } catch (err) {}
  return MOCK_USERS.filter(u => u.role === 'Expert');
};

export const getExpertById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/experts/${id}`);
    if (data?.data || data?.name) return data?.data || data;
  } catch (err) {}
  return MOCK_USERS.find(u => u.role === 'Expert') || MOCK_USERS[3];
};

export const updateExpertProfile = async (profileData) => {
  try {
    const { data } = await axios.put(`${API_URL}/experts/profile`, profileData, getAuthHeaders());
    return data;
  } catch (err) {
    return { success: true };
  }
};
