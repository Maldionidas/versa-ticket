import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth';
import sessionManager from '../api/sessionManager';

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
    const initializeAuth = () => {
      // Usamos localStorage por tu preferencia de persistencia
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user') || localStorage.getItem('usuario');
      
      console.log('🔐 AuthProvider init - Token:', !!token);
      console.log('👤 AuthProvider init - Usuario:', !!savedUser);

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          sessionManager.registerSession(parsedUser.id, token);
        } catch (e) {
          console.error('Error parsing user data', e);
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    const handleBeforeUnload = () => {
      if (user) sessionManager.clearSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);

      // Normalizamos: tu compa usa .data.usuario, tú usas .data.user
      const userData = response.data?.usuario || response.data?.user;
      const token = response.data?.token;

      if (token && userData) {
        // Guardamos en localStorage (tu diseño de persistencia)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        sessionManager.registerSession(userData.id, token);

        console.log('Login exitoso y sesión registrada');
        return response.data;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    sessionManager.clearSession();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuario');
    apiLogout();
    setUser(null);
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user 
    }}>
      {/* Solo renderizamos los hijos si ya terminó de cargar el estado inicial */}
      {!loading && children}
    </AuthContext.Provider>
  );
};