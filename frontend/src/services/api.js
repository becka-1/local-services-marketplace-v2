import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, "") : "";
export const API_URL = rawBase
  ? (rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`)
  : `http://${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Create a custom event to notify the app that auth failed
      window.dispatchEvent(new Event('auth-failed'));
    }
    return Promise.reject(error);
  }
);

export default api;