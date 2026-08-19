import api from "./api.js";

export const createRequest = async (requestData) => {
  const response = await api.post("/requests", requestData);
  return response.data;
};

export const getRequestsByRequester = async (userId) => {
  const response = await api.get(`/requests/requester/${userId}`);
  return response.data;
};

export const getRequestsByProvider = async (userId) => {
  const response = await api.get(`/requests/provider/${userId}`);
  return response.data;
};

export const getRequestById = async (id) => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

export const updateRequest = async (id, updateData) => {
  const response = await api.patch(`/requests/${id}`, updateData);
  return response.data;
};

export const deleteRequest = async (id) => {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
};
