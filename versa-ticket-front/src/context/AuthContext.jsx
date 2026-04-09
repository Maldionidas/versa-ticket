// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/auth';
import { sessionManager } from '../api/sessionManager';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ CAMBIAR: usar sessionStorage en lugar de localStorage
    const token = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('usuario');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    
    console.log('AuthProvider - Token en sessionStorage:', !!token);
    console.log('AuthProvider - Usuario en sessionStorage:', savedUser);
    
    if (token && currentUser) {
      setUser(currentUser);
      // Registrar sesión al cargar
      sessionManager.registerSession(currentUser.id, token);
    }
    
    setLoading(false);
    
    // Limpiar al cerrar la pestaña
    window.addEventListener('beforeunload', () => {
      if (user) {
        sessionManager.clearSession();
      }
    });
    
    return () => {
      window.removeEventListener('beforeunload', () => {});
    };
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    if (response.data.token) {
      // ✅ Guardar en sessionStorage
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      setUser(response.data.usuario);
    }
    return response;
  };

  const logout = () => {
    // ✅ Limpiar sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};