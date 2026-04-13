import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error cargando roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, formData);
      } else {
        await api.post('/roles', formData);
      }
      await cargarRoles();
      setShowModal(false);
      setFormData({ nombre: '', descripcion: '' });
      setEditingRole(null);
    } catch (error) {
      console.error('Error guardando rol:', error);
      alert('Error al guardar el rol');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este rol?')) {
      try {
        await api.delete(`/roles/${id}`);
        await cargarRoles();
      } catch (error) {
        console.error('Error eliminando rol:', error);
        alert('No se puede eliminar un rol con usuarios asignados');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando roles...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Roles</h2>
        <button
          onClick={() => {
            setEditingRole(null);
            setFormData({ nombre: '', descripcion: '' });
            setShowModal(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
        >
          + Nuevo Rol
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="border rounded-lg p-4 hover:shadow-lg transition">
            <h3 className="font-bold text-lg text-gray-800">{role.nombre}</h3>
            <p className="text-gray-600 text-sm mt-1">{role.descripcion}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setEditingRole(role);
                  setFormData({ nombre: role.nombre, descripcion: role.descripcion });
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(role.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal igual que en AdminUsers */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">
              {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
            </h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nombre del rol"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mb-3"
                required
              />
              <textarea
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mb-3"
                rows="3"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-lg">
                  {editingRole ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;