// src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ adminOnly = false }) => {
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token');
    
    console.log("PrivateRoute - user:", user);
    console.log("PrivateRoute - token:", token ? "Sí" : "No");
    console.log("PrivateRoute - loading:", loading);
    console.log("PrivateRoute - adminOnly:", adminOnly);
    
    if (loading) {
        return <div>Cargando...</div>;
    }
    
    if (!token || !user) {
        console.log("No autenticado, redirigiendo a login");
        return <Navigate to="/login" replace />;
    }
    
    if (adminOnly && user.rol_id !== 1) {
        console.log("No es admin, redirigiendo a dashboard");
        return <Navigate to="/dashboard" replace />;
    }
    
    console.log("Autenticado correctamente");
    return <Outlet />;
};

export default PrivateRoute;