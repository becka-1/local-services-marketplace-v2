import api from './api.js';

export const getCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};