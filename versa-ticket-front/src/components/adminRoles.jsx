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