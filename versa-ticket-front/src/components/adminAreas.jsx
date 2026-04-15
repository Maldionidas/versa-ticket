//components/adminAreas.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // Usamos la instancia con el token

const AdminAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  
  // Agregué 'activo' al formData porque es vital para el control administrativo
  const [formData, setFormData] = useState({ 
    nombre: '', 
    descripcion: '', 
    activo: true 
  });

  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      const response = await api.get('/areas');
      setAreas(response.data);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await api.put(`/areas/${editingArea.id}`, formData);
      } else {
        await api.post('/areas', formData);
      }
      await cargarAreas();
      setShowModal(false);
      setFormData({ nombre: '', descripcion: '', activo: true });
      setEditingArea(null);
    } catch (error) {
      console.error('Error guardando área:', error);
      alert(error.response?.data?.message || 'Error al guardar el área');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta área?')) {
      try {
        await api.delete(`/areas/${id}`);
        await cargarAreas();
      } catch (error) {
        console.error('Error eliminando área:', error);
        alert('No se puede eliminar un área con tickets asignados. Prueba desactivándola.');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Cargando módulos de áreas...</div>;

  return (
    <div className="p-6">
      {/* HEADER DEL COMPAÑERO */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Áreas</h2>
        <button
          onClick={() => {
            setEditingArea(null);
            setFormData({ nombre: '', descripcion: '', activo: true });
            setShowModal(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          + Nueva Área
        </button>
      </div>

      {/* TABLA DEL COMPAÑERO */}
      <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {areas.map((area) => (
              <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">{area.id}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{area.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{area.descripcion || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    area.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {area.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center font-medium space-x-4">
                  <button
                    onClick={() => {
                      setEditingArea(area);
                      setFormData({ 
                        nombre: area.nombre, 
                        descripcion: area.descripcion, 
                        activo: area.activo 
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DEL COMPAÑERO */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              {editingArea ? 'Editar Área' : 'Registrar Nueva Área'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Sistemas, Mantenimiento..."
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  placeholder="Detalles del departamento"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  rows="3"
                />
              </div>
              
              {/* Checkbox de activo añadido para control administrativo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <label htmlFor="activo" className="text-sm text-gray-700 font-medium">Área activa</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all"
                >
                  {editingArea ? 'Actualizar' : 'Crear Área'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAreas;