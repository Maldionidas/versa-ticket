import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    // Limpiar mensaje cuando el usuario empieza a escribir
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ 
          text: "✓ Usuario creado exitosamente. Redirigiendo...", 
          type: "success" 
        });
        
        // Limpiar el formulario
        setForm({
          nombre: "",
          apellido: "",
          email: "",
          password: ""
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMessage({ 
          text: result.message || "Error creando usuario", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ 
        text: "Error de conexión con el servidor", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#d3dcc1] to-[#75bed6]">
      <div className="w-[400px] bg-[radial-gradient(circle_at_0%_0%,_#ffffff,_#ece7cb)] rounded-2xl p-8 shadow-2xl border-4 border-orange-400">
        
        {/* Header con logo y mascota */}
        <div className="flex items-center justify-between mb-2 relative flex-wrap">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-auto" />
          <h1 className="text-[#1a4b7a] text-2xl font-bold flex-1 text-center m-0">
            VERSATICKET
          </h1>
          <img src="/images/mascota.png" alt="Mascota" className="w-12 h-auto" />
          
          {/* Eslogan */}
          <p className="w-full text-center text-gray-500 text-xs mt-1 order-3">
            Gestión de Tickets internos
          </p>
          
          {/* Título Crear cuenta */}
          <p className="w-full text-center text-gray-700 text-base mt-1 order-5">
            Crear cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-2">
          {/* Campo Nombre */}
          <div className="mb-2 text-left">
            <label className="block text-gray-600 text-sm mb-0.5 text-left">Nombre:</label>
            <input
              name="nombre"
              value={form.nombre}
              placeholder="ej. Juan Pérez"
              onChange={handleChange}
              disabled={loading}
              className="w-full py-1.5 px-1 border-2 border-blue-100 rounded-lg bg-white text-sm placeholder-gray-400 placeholder-italic focus:border-blue-500 focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Campo Apellido */}
          <div className="mb-2 text-left">
            <label className="block text-gray-600 text-sm mb-0.5 text-left">Apellido:</label>
            <input
              name="apellido"
              value={form.apellido}
              placeholder="ej. García López"
              onChange={handleChange}
              disabled={loading}
              className="w-full py-1.5 px-1 border-2 border-blue-100 rounded-lg bg-white text-sm placeholder-gray-400 placeholder-italic focus:border-blue-500 focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Campo Email */}
          <div className="mb-2 text-left">
            <label className="block text-gray-600 text-sm mb-0.5 text-left">Correo electrónico:</label>
            <input
              name="email"
              type="email"
              value={form.email}
              placeholder="usuario@empresa.com"
              onChange={handleChange}
              disabled={loading}
              className="w-full py-1.5 px-1 border-2 border-blue-100 rounded-lg bg-white text-sm placeholder-gray-400 placeholder-italic focus:border-blue-500 focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="mb-3 text-left">
            <label className="block text-gray-600 text-sm mb-0.5 text-left">Contraseña:</label>
            <input
              type="password"
              name="password"
              value={form.password}
              placeholder="********"
              onChange={handleChange}
              disabled={loading}
              className="w-full py-1.5 px-1 border-2 border-blue-100 rounded-lg bg-white text-sm placeholder-gray-400 placeholder-italic placeholder-tracking-wider focus:border-blue-500 focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Mensaje de feedback - justo después de la contraseña */}
          {message.text && (
            <div className={`mb-3 p-2 rounded-lg text-sm text-center ${
              message.type === "success" 
                ? "bg-green-100 text-green-700 border border-green-300" 
                : "bg-red-100 text-red-700 border border-red-300"
            }`}>
              {message.text}
            </div>
          )}

          {/* Botón Registrar con gradiente */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-2 bg-gradient-to-r from-[#0a4b78] to-[#5ec1e6] text-white font-bold rounded-lg text-base hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "REGISTRANDO..." : "REGISTRAR"}
          </button>
        </form>

        {/* Enlace "¿Ya tienes cuenta?" */}
        <div className="text-center mt-4 mb-2">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-[#0a4b78] font-bold no-underline hover:underline">
              Iniciar sesión
            </a>
          </p>
        </div>

        {/* Copyright con línea superior */}
        <div className="text-center pt-2 border-t-2 border-[#77beed]">
          <p className="text-gray-500 text-xs m-0">
            © 2026 VersaTicket - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}