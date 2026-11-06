import axios from 'axios';
import { API_URL } from './api';
import { MOCK_MANDI } from '../data/mockData';

export const getMandiPrices = async (params = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/mandi`, { params });
    if (data && (Array.isArray(data) || Array.isArray(data.data) || Array.isArray(data.records))) return data;
  } catch (err) {}
  return {
    data: MOCK_MANDI,
    records: MOCK_MANDI,
    count: MOCK_MANDI.length
  };
};

export const getMandiLocations = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/mandi/locations`);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (err) {}
  return ['Navsari APMC', 'Anand APMC', 'Surat APMC', 'Lasalgaon APMC', 'Ludhiana Mandi'];
};
