import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getFarmerAnalytics = async () => {
  const { data } = await axios.get(`${API_URL}/analytics/farmer`);
  return data;
};

export const getAdminAnalytics = async () => {
  const { data } = await axios.get(`${API_URL}/analytics/admin`);
  return data;
};
