import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getWishlist = async () => {
  const { data } = await axios.get(`${API_URL}/wishlist`);
  return data;
};

export const addToWishlist = async (productId) => {
  const { data } = await axios.post(`${API_URL}/wishlist/${productId}`);
  return data;
};

export const removeFromWishlist = async (productId) => {
  const { data } = await axios.delete(`${API_URL}/wishlist/${productId}`);
  return data;
};
