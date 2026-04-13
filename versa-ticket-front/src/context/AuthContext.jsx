// src/context/AuthContext.jsx
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

  // Inicializar al cargar la aplicación
  useEffect(() => {
    const initializeAuth = () => {
      const token = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('usuario');
      
      console.log('🔐 AuthProvider init - Token:', !!token);
      console.log('👤 AuthProvider init - Usuario:', !!savedUser);

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          sessionManager.registerSession(parsedUser.id, token);
        } catch (e) {
          console.error('Error parsing user from sessionStorage', e);
          sessionStorage.clear();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Limpieza al cerrar pestaña
    const handleBeforeUnload = () => {
      if (user) sessionManager.clearSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // ← Solo se ejecuta una vez al montar

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);

      if (response.data?.token && response.data?.usuario) {
        const { token, usuario } = response.data;

        // Guardar en sessionStorage
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('usuario', JSON.stringify(usuario));

        setUser(usuario);

        // Registrar sesión (importante para BroadcastChannel)
        sessionManager.registerSession(usuario.id, token);

        console.log('✅ Login exitoso y sesión registrada');
        return response.data;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    sessionManager.clearSession();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    apiLogout();
    setUser(null);
    window.location.href = '/login'; // Forzar redirección
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};