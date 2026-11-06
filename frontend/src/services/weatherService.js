import axios from 'axios';
import { API_URL } from './api';

export const getWeather = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/weather`);
    return data;
  } catch (err) {
    console.warn('Weather fetch fallback:', err.message);
    return null;
  }
};
