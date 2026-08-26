import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getWeather = async () => {
  const { data } = await axios.get(`${API_URL}/weather`);
  return data;
};
