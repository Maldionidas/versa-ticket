import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            // ¡EL CAMBIO ESTÁ AQUÍ! Te mandamos a la app real que construimos, no al dashboard vacío.
            navigate('/crear-ticket'); 
        } catch (error) {
            // Mejoramos el manejo del error para que sea más claro si el backend no contesta
            if (error.message === "Network Error" || !error.response) {
                setError("No se pudo conectar con el servidor. ¿Está prendido el backend?");
            } else {
                setError(error.response?.data?.message || 'Error al iniciar sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#d0e8c8] to-[#b3e5fc] flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 m-4">
                <div className="flex items-center justify-center gap-4 mb-2">

      <img 
        src="/Logo-Versa.svg"
        alt="VersaTicket Mascot" 
        className="w-16 h-16 object-contain"
      />
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
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

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="••••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold hover:brightness-105 transition shadow-md"
                    >
                        {loading ? 'Iniciando sesión...' : 'INGRESAR'}
                    </button>
                </form>

                {/* Enlace olvidó contraseña */}
                <div className="text-center mt-6">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                        
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;