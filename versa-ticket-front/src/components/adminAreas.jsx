// src/components/adminAreas.jsx
import React, { useEffect, useState } from 'react';

const AdminAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editArea, setEditArea] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/areas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAreas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarArea = async (e) => {
    e.preventDefault();
    try {
      const url = editArea ? `http://localhost:3000/api/areas/${editArea.id}` : 'http://localhost:3000/api/areas';
      const method = editArea ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      cargarAreas();
      setEditArea(null);
      setFormData({ nombre: '', descripcion: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const eliminarArea = async (id) => {
    if (!confirm('¿Eliminar esta área?')) return;
    try {
      await fetch(`http://localhost:3000/api/areas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      cargarAreas();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando áreas...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestión de Áreas</h2>
        <button onClick={() => { setEditArea(null); setFormData({ nombre: '', descripcion: '' }); setShowModal(true); }} className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold">+ Nueva Área</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">Nombre</th><th className="px-4 py-3 text-left">Descripción</th><th className="px-4 py-3 text-left">Acciones</th></tr>
          </thead>
          <tbody className="divide-y">
            {areas.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{a.id}</td><td className="px-4 py-3">{a.nombre}</td><td className="px-4 py-3">{a.descripcion}</td>
                <td className="px-4 py-3"><button onClick={() => { setEditArea(a); setFormData({ nombre: a.nombre, descripcion: a.descripcion || '' }); setShowModal(true); }} className="text-blue-600 mr-3">✏️</button><button onClick={() => eliminarArea(a.id)} className="text-red-600">🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editArea ? 'Editar Área' : 'Nueva Área'}</h2>
            <form onSubmit={guardarArea}>
              <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full p-2 border rounded mb-2" required />
              <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full p-2 border rounded mb-4" rows="3" />
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancelar</button><button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded">Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAreas;