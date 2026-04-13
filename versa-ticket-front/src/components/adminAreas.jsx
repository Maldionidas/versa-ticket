import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

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
      setFormData({ nombre: '', descripcion: '' });
      setEditingArea(null);
    } catch (error) {
      console.error('Error guardando área:', error);
      alert('Error al guardar el área');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta área?')) {
      try {
        await api.delete(`/areas/${id}`);
        await cargarAreas();
      } catch (error) {
        console.error('Error eliminando área:', error);
        alert('No se puede eliminar un área con tickets asignados');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando áreas...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Áreas</h2>
        <button
          onClick={() => {
            setEditingArea(null);
            setFormData({ nombre: '', descripcion: '' });
            setShowModal(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
        >
          + Nueva Área
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {areas.map((area) => (
              <tr key={area.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{area.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{area.nombre}</td>
                <td className="px-6 py-4 text-sm">{area.descripcion}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => {
                      setEditingArea(area);
                      setFormData({ nombre: area.nombre, descripcion: area.descripcion });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">
              {editingArea ? 'Editar Área' : 'Nueva Área'}
            </h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nombre del área"
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
                  {editingArea ? 'Actualizar' : 'Crear'}
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