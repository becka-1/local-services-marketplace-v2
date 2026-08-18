import api from './api.js';

export const getUserProfile = async id => {
  const response = await api.get(`/users/${id}`);

  return response.data;
}

export const getUserServices = async id => {
  const response = await api.get(`/users/${id}/services`);

  return response.data;
}