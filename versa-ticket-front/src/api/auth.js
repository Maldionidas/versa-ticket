// src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar token - usar sessionStorage
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token'); // ✅ Cambiado
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token'); // ✅ Cambiado
      sessionStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response;
};

export const logout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');
};

export const getCurrentUser = () => {
  const user = sessionStorage.getItem('usuario');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!sessionStorage.getItem('token');
};

export default {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  api
};