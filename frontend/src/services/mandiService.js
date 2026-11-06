import axios from 'axios';
import { API_URL } from './api';

export const getMandiPrices = async (params = {}) => {
  const { data } = await axios.get(`${API_URL}/mandi`, { params });
  return data;
};

export const getMandiLocations = async () => {
  const { data } = await axios.get(`${API_URL}/mandi/locations`);
  return data;
};
