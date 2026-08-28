import api from './api.js';

export const fetchConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export const fetchMessages = async (conversationId, beforeId = null, limit = 30) => {
  const params = { limit };
  if (beforeId) params.before = beforeId;
  const response = await api.get(`/conversations/${conversationId}/messages`, { params });
  return response.data;
};

export const createConversation = async (otherUserId) => {
  const response = await api.post('/conversations', { otherUserId });
  return response.data;
};

export const sendMessageRest = async (conversationId, content) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, { content });
  return response.data;
};
