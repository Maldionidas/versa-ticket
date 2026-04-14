import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

export const authService = {
    // 1. Iniciar sesión
    login: async (email, password) => {
        // Hacemos la petición POST al backend
        const response = await axios.post(`${API_URL}/login`, { email, password });
        
        // Si el backend nos responde con el Token, lo guardamos en la caja fuerte del navegador
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // Guardamos los datos del usuario (como su rol) para que tu Sidebar los pueda leer
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
        // Si hay token, devolvemos true
        return !!localStorage.getItem('token');
    }
};