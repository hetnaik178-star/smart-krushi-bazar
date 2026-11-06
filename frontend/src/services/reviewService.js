import api from './api';

export const getProductReviews = async (productId) => {
  const { data } = await api.get(`/reviews/product/${productId}`);
  return data;
};

export const getFarmerReviews = async (farmerId) => {
  const { data } = await api.get(`/reviews/farmer/${farmerId}`);
  return data;
};

export const submitReview = async (reviewData) => {
  const { data } = await api.post('/reviews', reviewData);
  return data;
};

export const deleteReview = async (reviewId) => {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
};
