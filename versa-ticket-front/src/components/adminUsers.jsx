// src/components/adminUsers.jsx
import React, { useEffect, useState } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol_id: '',
    activo: true
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarRoles = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando roles:', error);
      // Roles por defecto si no carga
      setRoles([
        { id: 1, nombre: 'Usuario' },
        { id: 2, nombre: 'Administrador' },
        { id: 3, nombre: 'Agente' },
        { id: 4, nombre: 'Invitado' }
      ]);
    }
  };

  const getRolNombre = (rolId) => {
    const rol = roles.find(r => r.id === rolId);
    return rol ? rol.nombre : 'Desconocido';
  };

  const getRolColor = (rolId) => {
    switch (rolId) {
      case 2: return 'bg-purple-100 text-purple-800';  // Administrador
      case 3: return 'bg-blue-100 text-blue-800';      // Agente
      case 4: return 'bg-gray-100 text-gray-800';      // Invitado
      default: return 'bg-green-100 text-green-800';   // Usuario
    }
  };

  const abrirModal = (user = null) => {
    if (user) {
      setEditUser(user);
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        rol_id: user.rol_id || '',
        activo: user.activo !== undefined ? user.activo : true
      });
    } else {
      setEditUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        rol_id: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    try {
      const url = editUser 
        ? `http://localhost:3000/api/users/${editUser.id}`
        : 'http://localhost:3000/api/users';
      const method = editUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        cargarUsuarios();
        setEditUser(null);
        setFormData({});
        alert(editUser ? 'Usuario actualizado' : 'Usuario creado');
      } else {
        const error = await res.json();
        alert(error.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const eliminarUsuario = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        cargarUsuarios();
        alert('Usuario eliminado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando usuarios...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
        <button
          onClick={() => abrirModal()}
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold"
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{u.id}</td>
                <td className="px-4 py-3 text-sm">{u.nombre} {u.apellido || ''}</td>
                <td className="px-4 py-3 text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRolColor(u.rol_id)}`}>
                    {getRolNombre(u.rol_id)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => abrirModal(u)} className="text-blue-600 mr-3 hover:text-blue-800">✏️</button>
                  <button onClick={() => eliminarUsuario(u.id, u.nombre)} className="text-red-600 hover:text-red-800">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <form onSubmit={guardarUsuario}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full p-2 border rounded mb-2"
                required
              />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded mb-2"
                required
                disabled={!!editUser}
              />
              <select
                name="rol_id"
                value={formData.rol_id}
                onChange={(e) => setFormData({...formData, rol_id: parseInt(e.target.value)})}
                className="w-full p-2 border rounded mb-2"
                required
              >
                <option value="">Seleccionar rol</option>
                <option value="1">Usuario</option>
                <option value="2">Administrador</option>
                <option value="3">Agente</option>
                <option value="4">Invitado</option>
              </select>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                />
                Usuario activo
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;