// src/components/TicketModal.jsx
import React, { useState, useEffect } from 'react';

export default function TicketModal({ onClose, onTicketCreated, currentUser }) {
  const [areas, setAreas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad_id: '',
    categoria_id: '',
    area_id: '',
  });

  // Cargar catálogos
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        // Usa las URLs correctas con /catalogos
        const [areasRes, prioridadesRes] = await Promise.all([
          fetch('http://localhost:3000/api/catalogos/areas'),
          fetch('http://localhost:3000/api/catalogos/prioridades')
        ]);

        if (!areasRes.ok || !prioridadesRes.ok) {
          throw new Error('Error cargando catálogos');
        }

        const areasData = await areasRes.json();
        const prioridadesData = await prioridadesRes.json();

        setAreas(areasData);
        setPrioridades(prioridadesData);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
      }
    };

    fetchCatalogos();
  }, []);

  // Cargar categorías cuando cambia el área
  useEffect(() => {
    if (!formData.area_id) return;

    const fetchCategorias = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/catalogos/categorias/${formData.area_id}`
        );
        
        if (!res.ok) {
          throw new Error('Error cargando categorías');
        }
        
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };

    fetchCategorias();
  }, [formData.area_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'area_id' && { categoria_id: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estado_id: 1,
          usuario_id: currentUser?.id || 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Error creando ticket');
      }

      const data = await response.json();
      console.log('Ticket creado:', data);
      
      onTicketCreated();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Crear Nuevo Ticket</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="3"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Área</label>
            <select
              name="area_id"
              value={formData.area_id}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Selecciona un área</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.nombre}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              required
              disabled={!formData.area_id}
              className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Prioridad</label>
            <select
              name="prioridad_id"
              value={formData.prioridad_id}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Selecciona una prioridad</option>
              {prioridades.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}