// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      setTimeout(() => {
        const userData = JSON.parse(localStorage.getItem('usuario') || '{}');
        console.log('Usuario logueado:', userData);
        console.log('Rol:', userData.rol_id);
        
        if (userData.rol_id === 2) {
          navigate('/admin');
        } else {
          navigate('/inbox');
        }
      }, 100);
      
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#d0e8c8] to-[#b3e5fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        {/* Logo y título */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src="/Logo-Versa.svg" 
            alt="VersaTicket" 
            className="w-16 h-16 object-contain"
          />
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            VERSATICKET
          </h1>
          <img 
            src="/mascota.svg" 
            alt="VersaTicket Mascot" 
            className="w-16 h-16 object-contain"
          />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          INICIAR SESIÓN
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@empresa.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold text-base hover:brightness-105 transition shadow-md"
          >
            {loading ? 'Iniciando sesión...' : 'INGRESAR'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <div className="text-center mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            © 2026 VersaTicket - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;