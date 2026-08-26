import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getNotifications = async () => {
  const { data } = await axios.get(`${API_URL}/notifications`);
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await axios.put(`${API_URL}/notifications/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await axios.put(`${API_URL}/notifications/read-all`);
  return data;
};
