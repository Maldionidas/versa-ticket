<<<<<<< HEAD
import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

const modules = ["users", "areas", "tickets"]
const actions = ["create", "read", "update", "delete"]

export function AdminRoles() {
    const [roles, setRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState(null)
    const [isEdit, setIsEdit] = useState(false)
    const [showModal, setShowModal] = useState(false)

    //  fetch roles
    const fetchRoles = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/roles")
            const data = await res.json()

            setRoles(data)

        } catch (error) {
            console.error("Error cargando roles:", error)
        }
    }
    useEffect(() => {
        fetchRoles()
    }, [])

    //  crear permisos base
    const createEmptyPermissions = () => {
        const perms = {}
        modules.forEach(m => {
            perms[m] = {}
            actions.forEach(a => {
                perms[m][a] = false
            })
        })
        return perms
    }

    // ➕ crear
    const handleCreate = () => {
        setSelectedRole({
            nombre: "",
            descripcion: "",
            permisos: createEmptyPermissions()
        })
        setIsEdit(false)
        setShowModal(true)
    }

    //  editar
    const handleEdit = (role) => {
        setSelectedRole({
            ...role,
            permisos: role.permisos || createEmptyPermissions()
        })
        setIsEdit(true)
        setShowModal(true)
    }

    //  guardar
    const handleSave = async () => {
        try {
            const url = isEdit
                ? `http://localhost:3000/api/roles/${selectedRole.id}`
                : `http://localhost:3000/api/roles`

            const method = isEdit ? "PUT" : "POST"

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedRole)
            })

            await fetchRoles()
            setShowModal(false)

        } catch (error) {
            console.error("Error:", error)
        }
    }

    // eliminar
    const handleDelete = async (role) => {
        if (!confirm(`Eliminar rol ${role.nombre}?`)) return

        await fetch(`http://localhost:3000/api/roles/${role.id}`, {
            method: "DELETE"
        })

        fetchRoles()
    }

    //  toggle permiso
    const togglePermission = (module, action) => {
        setSelectedRole(prev => ({
            ...prev,
            permisos: {
                ...prev.permisos,
                [module]: {
                    ...prev.permisos[module],
                    [action]: !prev.permisos[module][action]
                }
            }
        }))
    }

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Roles</h1>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    <Plus size={16} /> Nuevo Rol
                </button>
            </div>

            {/* TABLA */}
            <table className="w-full border">
                <thead className="bg-gray-100">
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {roles.map(r => (
                        <tr key={r.id} className="text-center border-t">
                            <td>{r.nombre}</td>
                            <td>{r.descripcion}</td>
                            <td className="flex justify-center gap-2 py-2">
                                <button onClick={() => handleEdit(r)}>
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(r)}>
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL */}
            {showModal && selectedRole && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

                    <div className="bg-white p-6 rounded-lg w-[600px]">

                        <h2 className="text-lg font-bold mb-4">
                            {isEdit ? "Editar Rol" : "Nuevo Rol"}
                        </h2>

                        {/* Nombre */}
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={selectedRole.nombre}
                            onChange={(e) =>
                                setSelectedRole({ ...selectedRole, nombre: e.target.value })
                            }
                            className="border p-2 w-full mb-2"
                        />

                        {/* Descripción */}
                        <textarea
                            placeholder="Descripción"
                            value={selectedRole.descripcion}
                            onChange={(e) =>
                                setSelectedRole({ ...selectedRole, descripcion: e.target.value })
                            }
                            className="border p-2 w-full mb-4"
                        />

                        {/* PERMISOS */}
                        <h3 className="font-bold mb-2">Permisos</h3>

                        <div className="space-y-3">
                            {modules.map((module) => (
                                <div key={module}>
                                    <p className="font-semibold capitalize">{module}</p>

                                    <div className="flex gap-4 mt-1">
                                        {actions.map((action) => (
                                            <label key={action} className="flex items-center gap-1 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRole.permisos[module][action]}
                                                    onChange={() => togglePermission(module, action)}
                                                />
                                                {action}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* BOTONES */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-300 px-3 py-1 rounded"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleSave}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Guardar
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}
=======
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
>>>>>>> origin/Login_CV2
