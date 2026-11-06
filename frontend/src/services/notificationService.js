import axios from 'axios';
import { API_URL } from './api';

export const getNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await axios.get(`${API_URL}/notifications`, { headers });
    return data;
  } catch (e) {
    return { notifications: [], unreadCount: 0 };
  }
};

export const markAsRead = async (id) => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axios.put(`${API_URL}/notifications/${id}/read`, {}, { headers });
  return data;
};

export const markAllAsRead = async () => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axios.put(`${API_URL}/notifications/read-all`, {}, { headers });
  return data;
};
