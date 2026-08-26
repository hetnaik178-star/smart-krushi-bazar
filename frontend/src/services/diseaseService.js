import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const detectCropDisease = async (formData) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Note: Do NOT manually set 'Content-Type': 'multipart/form-data'.
  // Letting Axios and the browser set it automatically ensures the multipart boundary is included.
  const { data } = await axios.post(`${API_URL}/disease/detect`, formData, {
    headers
  });
  return data;
};
