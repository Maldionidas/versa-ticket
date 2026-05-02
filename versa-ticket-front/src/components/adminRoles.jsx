import React, { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import api from '../api/axios';

const modules = ["users", "areas", "tickets", "categorias", "campos"];
const actions = ["create", "read", "update", "delete"];

// Añadimos 'user' y 'permisos' a los props recibidos desde PanelAdmin
export function AdminRoles({ user, permisos }) {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        permisos: {}
    });

    // ----------------------------------------------------------------------
    // 1. LÓGICA DE PERMISOS BLINDADA
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

    const canRead = can("roles", "read");
    const canCreate = can("roles", "create");
    const canEdit = can("roles", "update");
    const canDelete = can("roles", "delete");

    // ----------------------------------------------------------------------
    // 2. EFECTOS Y FETCHES
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (canRead) {
            fetchRoles();
        } else {
            setLoading(false); // Detiene loader si no hay acceso
        }
    }, [canRead]);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await api.get("/roles");
            setRoles(res.data);
        } catch (error) {
            console.error("Error cargando roles:", error);
        } finally {
            setLoading(false);
        }
    };

    const createEmptyPermissions = () => {
        const perms = {};
        modules.forEach(m => {
            perms[m] = {};
            actions.forEach(a => {
                perms[m][a] = false;
            });
        });
        return perms;
    };

    // ----------------------------------------------------------------------
    // 3. HANDLERS
    // ----------------------------------------------------------------------
    const handleCreate = () => {
        if (!canCreate) return;
        setFormData({
            nombre: "",
            descripcion: "",
            permisos: createEmptyPermissions()
        });
        setIsEdit(false);
        setShowModal(true);
    };

    const handleEdit = (role) => {
        if (!canEdit) return;
        const parsedPerms = typeof role.permisos === 'string' 
            ? JSON.parse(role.permisos) 
            : (role.permisos || createEmptyPermissions());

        setFormData({
            nombre: role.nombre,
            descripcion: role.descripcion,
            permisos: parsedPerms
        });
        setSelectedRole(role);
        setIsEdit(true);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (isEdit && !canEdit) return;
        if (!isEdit && !canCreate) return;

        try {
            if (isEdit) {
                await api.put(`/roles/${selectedRole.id}`, formData);
            } else {
                await api.post("/roles", formData);
            }
            await fetchRoles();
            setShowModal(false);
        } catch (error) {
            console.error("Error guardando rol:", error);
            alert(error.response?.data?.message || "Error al procesar el rol");
        }
    };

    const handleDelete = async (role) => {
        if (!canDelete) return;
        if (!window.confirm(`¿Eliminar permanentemente el rol "${role.nombre}"?`)) return;
        try {
            await api.delete(`/roles/${role.id}`);
            await fetchRoles();
        } catch (error) {
            alert("No se puede eliminar un rol con usuarios vinculados.");
        }
    };

    const togglePermission = (module, action) => {
        setFormData(prev => ({
            ...prev,
            permisos: {
                ...prev.permisos,
                [module]: {
                    ...prev.permisos[module],
                    [action]: !prev.permisos[module][action]
                }
            }
        }));
    };

    // ----------------------------------------------------------------------
    // 4. ESTADOS DE CARGA Y SEGURIDAD VISUAL
    // ----------------------------------------------------------------------
    if (loading && canRead) return <div className="p-12 text-center font-bold text-gray-400 animate-pulse">Cargando privilegios del sistema...</div>;

    if (!canRead) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl shadow-sm text-center">
                    <p className="font-black text-lg uppercase tracking-tighter">Acceso Restringido</p>
                    <p className="text-sm opacity-80">No tienes privilegios para administrar los roles del sistema.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50/50 min-h-full">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Roles y Permisos</h2>
                    <p className="text-sm text-gray-500">Define qué puede hacer cada tipo de usuario</p>
                </div>

                {canCreate && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95"
                    >
                        <Plus size={20} /> Nuevo Rol
                    </button>
                )}
            </div>

            {/* GRID DE TARJETAS */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                    <div key={role.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="flex gap-1">
                                {canEdit && (
                                    <button onClick={() => handleEdit(role)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Pencil size={18} />
                                    </button>
                                )}
                                {canDelete && (
                                    <button onClick={() => handleDelete(role)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <h3 className="font-black text-xl text-gray-800 mb-2 uppercase tracking-tighter">{role.nombre}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">{role.descripcion || "Sin descripción asignada."}</p>
                        <div className="pt-4 border-t border-gray-50">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID del Rol: {role.id}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="text-2xl font-black text-gray-800">
                                {isEdit ? `Configurando: ${formData.nombre}` : "Nuevo Perfil de Seguridad"}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nombre del Rol</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Supervisor de TI"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Descripción Breve</label>
                                    <input
                                        type="text"
                                        placeholder="Responsabilidades de este rol..."
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-gray-800 mb-4 border-l-4 border-amber-500 pl-3 uppercase">Matriz de Privilegios</h3>
                            
                            <div className="space-y-4">
                                {modules.map((module) => (
                                    <div key={module} className="bg-gray-50 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <p className="font-bold text-gray-700 capitalize w-24">{module}</p>
                                        <div className="flex flex-wrap gap-6">
                                            {actions.map((action) => (
                                                <label key={action} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 accent-amber-500 rounded-lg"
                                                        checked={formData.permisos[module]?.[action] || false}
                                                        onChange={() => togglePermission(module, action)}
                                                    />
                                                    <span className="text-xs font-bold text-gray-500 group-hover:text-amber-600 transition-colors uppercase">{action}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase text-xs"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isEdit ? !canEdit : !canCreate}
                                    className="px-10 py-3 bg-gray-800 text-white rounded-xl font-black shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95 uppercase text-xs disabled:opacity-50"
                                >
                                    {isEdit ? "Actualizar Rol" : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminRoles;