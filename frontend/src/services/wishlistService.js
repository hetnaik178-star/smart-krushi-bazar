import axios from 'axios';
import { API_URL } from './api';

export const getWishlist = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/wishlist`);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    return [];
  }
};

export const addToWishlist = async (productId) => {
  const { data } = await axios.post(`${API_URL}/wishlist/${productId}`);
  return data;
};

export const removeFromWishlist = async (productId) => {
  const { data } = await axios.delete(`${API_URL}/wishlist/${productId}`);
  return data;
};
