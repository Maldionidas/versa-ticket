import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const auth = useAuth();
    const location = useLocation();

    // 1. Mientras revisamos si hay sesión, mostramos spinner
    if (!auth || auth.loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // 2. Si definitivamente no hay usuario, patada al login
    if (!auth.user) {
        // Guardamos la ruta a la que quería ir (state: { from: location }) 
        // por si después quieres hacer que al loguearse regrese directo ahí
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Si todo está en orden, lo dejamos pasar al MainLayout
    return children;
};

export default PrivateRoute;