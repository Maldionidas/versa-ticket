import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../api/auth'; 
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
  }, []); // Quitamos [user] para evitar bucles infinitos en el init

  const login = async (email, password) => {
    try {
      // Usamos authService directamente
      const data = await authService.login(email, password);

      const userData = data.usuario || data.user;
      const token = data.token;

      if (token && userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        sessionManager.registerSession(userData.id, token);

        console.log('✅ Login exitoso y sesión registrada');
        return data;
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
    // Limpiamos todo el rastro
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuario');
    
    // Llamamos al logout del servicio (que borra axios headers si existen)
    authService.logout();
    
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
      {!loading && children}
    </AuthContext.Provider>
  );
};