// src/api/axios.js - ✅ Debe tener los interceptores
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Interceptor para agregar token - ¡IMPORTANTE!
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    console.log('🔑 Interceptor - Token existe?', !!token); // 👈 Debug
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token agregado a:', config.url);
    } else {
      console.warn('⚠️ No hay token para:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;