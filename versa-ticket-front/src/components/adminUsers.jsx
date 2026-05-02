import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export function AdminUsers({ user: propUser, permisos }) {
  const { user: currentUser } = useAuth();
  
  // Estado de datos
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Form States
  const [editingUser, setEditingUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol_id: 1,
    area_id: '',
    activo: true
  });

  // Lógica de permisos
  const can = (permisos, module, action) => permisos?.[module]?.[action] === true;
  const canCreate = can(permisos, "users", "create");
  const canEdit = can(permisos, "users", "update");
  const canDelete = can(permisos, "users", "delete");
  const canRead = can(permisos, "users", "read");

  useEffect(() => {
    if (canRead) {
      cargarDatosIniciales();
    }
  }, [canRead]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [resUsers, resRoles, resAreas] = await Promise.all([
        api.get('/users'),
        api.get('/catalogos/roles'),
        api.get('/catalogos/areas')
      ]);
      setUsers(resUsers.data);
      setRoles(resRoles.data);
      setAreas(resAreas.data);
      setError(null);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudieron cargar los datos de administración');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setOriginalUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido || '',
        email: user.email,
        rol_id: user.rol_id,
        area_id: user.area_id || '',
        activo: user.activo,
        password: ''
      });
    } else {
      setEditingUser(null);
      setOriginalUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol_id: 1,
        area_id: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  // Tu lógica de comparación de cambios
  const getChanges = () => {
    if (!originalUser) return [];
    const changes = [];
    if (originalUser.nombre !== formData.nombre) changes.push({ field: "Nombre", before: originalUser.nombre, after: formData.nombre });
    if (originalUser.apellido !== formData.apellido) changes.push({ field: "Apellido", before: originalUser.apellido, after: formData.apellido });
    if (originalUser.rol_id !== formData.rol_id) {
      changes.push({ 
        field: "Rol", 
        before: roles.find(r => r.id === originalUser.rol_id)?.nombre, 
        after: roles.find(r => r.id === formData.rol_id)?.nombre 
      });
    }
    return changes;
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      await cargarDatosIniciales();
      setShowConfirm(false);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al procesar la solicitud');
    }
  };

  const handleDelete = async (userId, nombre) => {
    if (!window.confirm(`¿Eliminar permanentemente a ${nombre}?`)) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert('Error al eliminar usuario');
    }
  };

  if (!canRead) return <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg m-6">No tienes permiso para ver este módulo.</div>;
  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando consola de administración...</div>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Usuarios</h2>
          <p className="text-sm text-gray-500 italic">Control de acceso y personal de VersaTicket</p>
        </div>
        {canCreate && (
          <button onClick={() => openModal()} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95">
            + Nuevo Usuario
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Usuario</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Rol</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Área</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{u.nombre} {u.apellido}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${u.rol_id === 2 ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {roles.find(r => r.id === u.rol_id)?.nombre || 'Usuario'}
                   </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{areas.find(a => a.id === u.area_id)?.nombre || '-'}</td>
                <td className="px-6 py-4">
                  <div className={`h-2 w-2 rounded-full ${u.activo ? 'bg-green-500' : 'bg-red-400'} inline-block mr-2`}></div>
                  <span className="text-xs font-bold text-gray-600">{u.activo ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  {canEdit && <button onClick={() => openModal(u)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors font-bold text-sm underline">Editar</button>}
                  {canDelete && currentUser?.id !== u.id && (
                    <button onClick={() => handleDelete(u.id, u.nombre)} className="text-red-400 hover:text-red-600 font-bold text-sm underline">Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-800 mb-6">{editingUser ? 'Editar Perfil' : 'Registro de Usuario'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-medium" />
                <input type="text" placeholder="Apellido" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-medium" />
              </div>
              <input type="email" placeholder="Email institucional" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-medium" />
              {!editingUser && <input type="password" placeholder="Contraseña temporal" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-medium" />}
              <select value={formData.rol_id} onChange={(e) => setFormData({...formData, rol_id: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-bold text-gray-600 appearance-none">
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              <select value={formData.area_id} onChange={(e) => setFormData({...formData, area_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-bold text-gray-600 appearance-none">
                <option value="">Sin área específica</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                <input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({...formData, activo: e.target.checked})} className="w-5 h-5 accent-amber-500 rounded-lg" />
                <span className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Cuenta Habilitada</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-50">
              <button onClick={() => setShowModal(false)} className="px-6 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase text-xs">Cancelar</button>
              <button onClick={() => editingUser ? setShowConfirm(true) : handleSave()} className="px-8 py-3 bg-gray-800 text-white rounded-xl font-black shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95 uppercase text-xs">
                {editingUser ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tu Modal de Confirmación de Cambios */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm border-t-4 border-amber-500">
            <h4 className="text-xl font-black text-gray-800 mb-4">¿Confirmar cambios?</h4>
            <div className="space-y-3 mb-6 bg-amber-50 p-4 rounded-2xl border border-amber-100">
              {getChanges().length > 0 ? getChanges().map((c, i) => (
                <div key={i} className="text-xs font-bold text-amber-800">
                  <span className="uppercase text-[10px] text-amber-400 block mb-1">{c.field}</span>
                  {c.before} <span className="text-amber-300 mx-2">→</span> {c.after}
                </div>
              )) : <p className="text-xs text-gray-500 italic">No se detectaron cambios visuales en el perfil.</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 text-gray-400 font-bold text-xs uppercase">Revisar</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-black shadow-lg shadow-amber-200 text-xs uppercase">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;