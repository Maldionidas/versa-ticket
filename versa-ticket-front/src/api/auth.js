// src/api/auth.js - ✅ VERSIÓN CORRECTA
import api from './axios';  // ← SOLO esta importación

// NO declares otra constante api aquí
// NO crees otra instancia de axios
// NO pongas interceptores aquí (ya están en axios.js)

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

export { api };
export default api;