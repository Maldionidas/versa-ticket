// src/components/adminRoles.jsx
import React, { useEffect, useState } from 'react';

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      // Datos por defecto
      setRoles([
        { id: 1, nombre: 'Usuario', descripcion: 'Usuario normal del sistema' },
        { id: 2, nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
        { id: 3, nombre: 'Agente', descripcion: 'Soporte y mantenimiento' },
        { id: 4, nombre: 'Invitado', descripcion: 'Acceso limitado' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando roles...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Gestión de Roles</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {roles.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{r.id}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    r.id === 2 ? 'bg-purple-100 text-purple-800' : 
                    r.id === 3 ? 'bg-blue-100 text-blue-800' :
                    r.id === 4 ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {r.nombre}
                  </span>
                </td>
                <td className="px-4 py-3">{r.descripcion || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRoles;