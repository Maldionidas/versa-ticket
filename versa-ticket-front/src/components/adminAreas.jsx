import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';

export function AdminAreas({ user, permisos }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({ 
    nombre: '', 
    descripcion: '', 
    activo: true 
  });

  // ----------------------------------------------------------------------
  // 1. LÓGICA DE PERMISOS BLINDADA (Senior Style)
  // ----------------------------------------------------------------------
  const safePermisos = useMemo(() => {
    try {
      if (!permisos) return {};
      return typeof permisos === "string" ? JSON.parse(permisos) : permisos;
    } catch { return {}; }
  }, [permisos]);

  const can = (module, action) => {
    if (user?.rol_id === 2) return true; // Super Admin Bypass
    return safePermisos?.[module]?.[action] === true;
  };

  const canRead = can("areas", "read");
  const canCreate = can("areas", "create");
  const canEdit = can("areas", "update");
  const canDelete = can("areas", "delete");

  // ----------------------------------------------------------------------
  // 2. EFECTOS Y FETCHES
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (canRead) {
      cargarAreas();
    } else {
      setLoading(false); // Detiene el loader si no tiene acceso
    }
  }, [canRead]);

  const cargarAreas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/catalogos/areas');
      setAreas(response.data);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // 3. MANEJADORES DE EVENTOS
  // ----------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingArea && !canEdit) return;
    if (!editingArea && !canCreate) return;

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
      alert(error.response?.data?.message || 'Error al procesar el área');
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!canDelete) return;
    if (!window.confirm(`¿Eliminar permanentemente el área de "${nombre}"?`)) return;
    
    try {
      await api.delete(`/areas/${id}`);
      setAreas(prev => prev.filter(a => a.id !== id)); // Optimistic UI update
    } catch (error) {
      alert(error.response?.data?.message || 'No se puede eliminar un área con tickets o usuarios asignados.');
    }
  };

  const openModal = (area = null) => {
    if (area) {
      if (!canEdit) return;
      setEditingArea(area);
      setFormData({ nombre: area.nombre, descripcion: area.descripcion || '', activo: area.activo ?? true });
    } else {
      if (!canCreate) return;
      setEditingArea(null);
      setFormData({ nombre: '', descripcion: '', activo: true });
    }
    setShowModal(true);
  };

  // ----------------------------------------------------------------------
  // 4. ESTADOS DE CARGA Y BLOQUEO VISUAL
  // ----------------------------------------------------------------------
  if (loading && canRead) {
    return <div className="p-12 text-center text-gray-500 animate-pulse font-bold">Validando permisos y cargando áreas...</div>;
  }

  if (!canRead) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl shadow-sm text-center">
          <p className="font-black text-lg uppercase tracking-tighter">Acceso Restringido</p>
          <p className="text-sm opacity-80">No tienes privilegios para administrar las áreas del sistema.</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // 5. RENDER PRINCIPAL
  // ----------------------------------------------------------------------
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Departamentos y Áreas</h2>
          <p className="text-sm text-gray-500 italic">Estructura organizacional para la asignación de tickets</p>
        </div>
        {canCreate && (
          <button
            onClick={() => openModal()}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95"
          >
            + Nueva Área
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {areas.map((area) => (
              <tr key={area.id} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-400">{area.id}</td>
                <td className="px-6 py-4 text-sm font-black text-gray-800 uppercase">{area.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={area.descripcion}>{area.descripcion || <span className="italic text-gray-300">Sin descripción</span>}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${area.activo ? 'bg-green-500' : 'bg-red-400'}`}></div>
                    <span className="text-xs font-bold text-gray-600">{area.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center space-x-3">
                  {canEdit && (
                    <button onClick={() => openModal(area)} className="text-blue-500 hover:text-blue-700 font-bold text-sm underline transition-colors">
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(area.id, area.nombre)} className="text-red-400 hover:text-red-600 font-bold text-sm underline transition-colors">
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {areas.length === 0 && !loading && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">No hay áreas registradas en el sistema.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CREACIÓN/EDICIÓN */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-800 mb-6">
              {editingArea ? 'Actualizar Área' : 'Nueva Área'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Nombre del Departamento</label>
                <input
                  type="text"
                  placeholder="Ej: Sistemas, Recursos Humanos..."
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-bold text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Descripción General</label>
                <textarea
                  placeholder="Funciones o detalles del área..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-medium text-gray-600 resize-none custom-scrollbar"
                  rows="3"
                />
              </div>
              
              {isEdit && (
                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors mt-2 border border-gray-100">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded-lg"
                  />
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Área Operativa</span>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-6 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={editingArea ? !canEdit : !canCreate}
                  className="px-8 py-3 bg-gray-800 text-white rounded-xl font-black shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95 uppercase text-xs disabled:opacity-50"
                >
                  {editingArea ? 'Guardar Cambios' : 'Registrar Área'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Eliminamos el export default para mantener la convención de Named Exports en componentes de admin