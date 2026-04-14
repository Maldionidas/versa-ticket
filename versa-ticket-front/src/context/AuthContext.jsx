import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../api/auth';

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
        const usuario = authService.getCurrentUser();
        if (usuario) {
            setUser(usuario);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        const userData = data.user || data.usuario;
        setUser(userData);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: authService.isAuthenticated(),
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};