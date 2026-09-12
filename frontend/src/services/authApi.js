import api from "./api.js";

export const registerRequest = async (userData) => {
  const response = await api.post("/auth/register/request", userData);
  return response.data;
};

export const registerConfirm = async (email, code) => {
  const response = await api.post("/auth/register/confirm", { email, code });
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const googleLogin = async (idToken) => {
  const response = await api.post("/auth/google", { token: idToken });
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  localStorage.removeItem('token');
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
