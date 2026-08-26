import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getMandiPrices = async (params = {}) => {
  const { data } = await axios.get(`${API_URL}/mandi`, { params });
  return data;
};

export const getMandiLocations = async () => {
  const { data } = await axios.get(`${API_URL}/mandi/locations`);
  return data;
};
