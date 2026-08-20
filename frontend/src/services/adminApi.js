import api from "./api.js";

const BASE_URL = "/admin";

export const getAdminStats = async () => {
  const response = await api.get(`${BASE_URL}/stats`);
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get(`${BASE_URL}/users`);
  return response.data;
};

export const getAdminUserDetails = async (id) => {
  const response = await api.get(`${BASE_URL}/users/${id}`);
  return response.data;
};

export const updateAdminUserRole = async (id, role) => {
  const response = await api.patch(`${BASE_URL}/users/${id}/role`, { role });
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`${BASE_URL}/users/${id}`);
  return response.data;
};

export const getAdminServices = async () => {
  const response = await api.get(`${BASE_URL}/services`);
  return response.data;
};

export const getAdminRequests = async () => {
  const response = await api.get(`${BASE_URL}/requests`);
  return response.data;
};

export const createAdminCategory = async (data) => {
  const response = await api.post(`${BASE_URL}/categories`, data);
  return response.data;
};

export const updateAdminCategory = async (id, data) => {
  const response = await api.patch(`${BASE_URL}/categories/${id}`, data);
  return response.data;
};

export const deleteAdminCategory = async (id) => {
  const response = await api.delete(`${BASE_URL}/categories/${id}`);
  return response.data;
};

export const getAdminReports = async () => {
  const response = await api.get(`${BASE_URL}/reports`);
  return response.data;
};

export const updateAdminReportStatus = async (id, status) => {
  const response = await api.patch(`${BASE_URL}/reports/${id}/status`, { status });
  return response.data;
};
