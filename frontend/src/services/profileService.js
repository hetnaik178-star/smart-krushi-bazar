import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getMyProfile = async () => {
  const { data } = await axios.get(`${API_URL}/profile`, getAuthHeaders());
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await axios.put(`${API_URL}/profile`, profileData, getAuthHeaders());
  return data;
};

export const uploadProfilePhoto = async (formData) => {
  const { data } = await axios.put(`${API_URL}/profile/photo`, formData, {
    ...getAuthHeaders(),
    headers: {
      ...getAuthHeaders().headers,
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

export const removeProfilePhoto = async () => {
  const { data } = await axios.delete(`${API_URL}/profile/photo`, getAuthHeaders());
  return data;
};

export const getProfileStats = async () => {
  const { data } = await axios.get(`${API_URL}/profile/stats`, getAuthHeaders());
  return data;
};

export const getPublicFarmerProfile = async (farmerId) => {
  const { data } = await axios.get(`${API_URL}/farmers/${farmerId}`);
  return data;
};
