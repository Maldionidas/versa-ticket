// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. Mientras el Contexto está leyendo el LocalStorage, no hagas nada
  if (loading) {
    return null; // O un spinner muy discreto
  }

  // 2. Si terminó de cargar y NO hay usuario, entonces SÍ al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si hay usuario, adelante
  return children;
};

export default PrivateRoute;