import axios from 'axios';
import { API_URL } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getConversations = async () => {
  const { data } = await axios.get(`${API_URL}/chat/conversations`, getAuthHeaders());
  return data;
};

export const getMessages = async (receiverId) => {
  const { data } = await axios.get(`${API_URL}/chat/messages/${receiverId}`, getAuthHeaders());
  return data;
};

export const sendMessage = async (formData) => {
  const { data } = await axios.post(`${API_URL}/chat/send`, formData, {
    ...getAuthHeaders(),
    headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' }
  });
  return data;
};
