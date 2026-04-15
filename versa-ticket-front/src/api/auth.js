// src/api/auth.js
import api from './axios';

export const authService = {
    // 1. Iniciar sesión
    login: async (email, password) => {
        // Usamos la instancia 'api' que ya tiene la URL base /api
        const response = await api.post('/auth/login', { email, password });
        
        // El interceptor en axios.js probablemente ya maneja el guardado del token,
        // pero aseguramos el guardado de los datos del usuario aquí.
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            
            // Normalizamos el nombre del objeto usuario (user o usuario)
            const userData = response.data.user || response.data.usuario;
            
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }
        }
        
        return response.data;
    },

    // 2. Cerrar sesión
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // También limpiamos sessionStorage por si acaso tu compa guardó algo ahí
        sessionStorage.clear();
    },

    // 3. Obtener el usuario actual
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (error) {
            return null;
        }
    },

    // 4. Verificar si está logueado
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

// Exportamos por defecto para mantener compatibilidad con lo que use tu compa
export default authService;