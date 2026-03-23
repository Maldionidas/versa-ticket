import { useEffect, useState } from "react"

// Componente para administración de usuarios (CRUD básico)
// - Lista usuarios
// - Edita usuario
// - Elimina usuario
// - Crea usuario
// - Muestra confirmaciones de cambios
export function AdminUsers({ user, permisos }) {
    // Estado local del componente
    const [users, setUsers] = useState([]) // lista de usuarios obtenidos desde backend
    const [selectedUser, setSelectedUser] = useState(null) // usuario en edición/creación
    const [originalUser, setOriginalUser] = useState(null) // copia del usuario original para detectar cambios
    const [showModal, setShowModal] = useState(false) // controla visibilidad modal de formulario
    const [showConfirm, setShowConfirm] = useState(false) // controla visibilidad modal de confirmación
    const [roles, setRoles] = useState([]) // catálogo de roles
    const [areas, setAreas] = useState([]) // catálogo de áreas
    const can = (permisos, module, action) => {
        return permisos?.[module]?.[action] === true
    }
    const canCreate = can(permisos, "users", "create")
    const canEdit = can(permisos, "users", "update")
    const canDelete = can(permisos, "users", "delete")
    const canRead = can(permisos, "users", "read")

    // Flag derivado: true si estamos editando un usuario existente
    const isEdit = !!originalUser

    // Inicia edición de usuario: copia valores para poder comparar cambios
    const handleEdit = (user) => {
        if (!canEdit) return
        setSelectedUser({ ...user })
        setOriginalUser({ ...user })
        setShowModal(true)
    }

    // Elimina usuario vía API con confirmación de usuario
    const handleDelete = async (user) => {
        if (!canDelete) return
        if (!window.confirm(`¿Eliminar a ${user.nombre}?`)) return

        try {
            await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: "DELETE",
            })

            // Refrescar lista en UI local sin recargar página
            setUsers((prev) => prev.filter(u => u.id !== user.id))

        } catch (error) {
            console.error("Error eliminando:", error)
        }
    }
    // Carga usuarios desde API de administración
    const fetchUsers = async () => {
        const res = await fetch("http://localhost:3000/api/users/admin")
        const data = await res.json()
        setUsers(data)
    }

    // Envía cambios de un usuario editado al servidor
    const handleUpdate = async () => {
        try {
            await fetch(
                `http://localhost:3000/api/users/${selectedUser.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nombre: selectedUser.nombre,
                        apellido: selectedUser.apellido,
                        rol_id: selectedUser.rol_id,
                        area_id: selectedUser.area_id
                    }),
                }
            )

            // Refresca datos en tabla luego de update
            await fetchUsers()

            // Limpia el usuario seleccionado
            setSelectedUser(null)

        } catch (error) {
            console.error("Error actualizando:", error)
        }
    }

    // Maneja creación y edición en un solo flujo con confirmación
    const handleSave = async () => {
        if (isEdit && !canEdit) return
        if (!isEdit && !canCreate) return

        try {
            // En modo edición se actualiza, si no se crea nuevo
            const url = isEdit
                ? `http://localhost:3000/api/users/${selectedUser.id}`
                : `http://localhost:3000/api/users/crear`

            const method = isEdit ? "PUT" : "POST"

            // Nota: route 'crear' para PUT/POST es poco consistente; revisarlo si hay cambios API
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(selectedUser),
            })

            const data = await res.json() // se usa para depuración futura

            await fetchUsers() // recarga datos para reflejar cambios

            // cierra modales y limpia selección
            setShowConfirm(false)
            setShowModal(false)
            setSelectedUser(null)

        } catch (error) {
            console.error("Error guardando:", error)
        }
    }

    // Compara valores originales vs modificados y devuelve resumen de cambios
    // usado en modal de confirmación para que admin vea qué modificó
    const getChanges = () => {
        if (!originalUser || !selectedUser) return []

        const changes = []

        if (originalUser.nombre !== selectedUser.nombre) {
            changes.push({
                field: "Nombre",
                before: originalUser.nombre,
                after: selectedUser.nombre
            })
        }

        if (originalUser.apellido !== selectedUser.apellido) {
            changes.push({
                field: "Apellido",
                before: originalUser.apellido,
                after: selectedUser.apellido
            })
        }

        if (originalUser.rol_id !== selectedUser.rol_id) {
            const before = roles.find(r => r.id === originalUser.rol_id)?.nombre
            const after = roles.find(r => r.id === selectedUser.rol_id)?.nombre

            changes.push({
                field: "Rol",
                before,
                after
            })
        }

        if (originalUser.area_id !== selectedUser.area_id) {
            const before = areas.find(a => a.id === originalUser.area_id)?.nombre
            const after = areas.find(a => a.id === selectedUser.area_id)?.nombre

            changes.push({
                field: "Área",
                before,
                after
            })
        }

        return changes
    }

    // Formato de fecha para presentación en UI con locale mexicano
    const formatDate = (date) => {
        return new Date(date).toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        })
    }

    // Este efecto es solo para depuración (puede eliminarse en producción)
    // Muestra en consola el usuario que se está editando/creando.
    useEffect(() => {
        if (selectedUser) {
            console.log(selectedUser)
            console.log(selectedUser.id)
        }
    }, [selectedUser])

    // Carga inicial: obtiene usuarios y catálogos para selects
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/users/admin")
                const data = await res.json()

                setUsers(data)

            } catch (error) {
                console.error("Error cargando usuarios:", error)
            }
        }
        const fetchCatalogs = async () => {
            try {
                const resRoles = await fetch("http://localhost:3000/api/catalogos/roles")
                const dataRoles = await resRoles.json()

                const resAreas = await fetch("http://localhost:3000/api/catalogos/areas")
                const dataAreas = await resAreas.json()
                setRoles(dataRoles)
                setAreas(dataAreas)

            } catch (error) {
                console.error("Error cargando catálogos:", error)
            }
        }


        fetchCatalogs()
        fetchUsers()
    }, [])
    if (!canRead) {
        return (
            <div className="p-6">
                <div className="bg-red-100 text-red-700 p-4 rounded">
                    No tienes permiso para ver usuarios
                </div>
            </div>
        )
    }

    // Render del componente completo
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

            {/* Botón de creación de nuevo usuario */}
            {canCreate && (
                <button
                    onClick={() => {
                        setSelectedUser({
                            nombre: "",
                            apellido: "",
                            email: "",
                            password: "",
                            rol_id: "",
                            area_id: ""
                        })
                        setOriginalUser(null)
                        setShowModal(true)
                    }}
                    className="bg-accent text-accent-foreground px-4 py-2 rounded-lg"
                >
                    + Agregar Usuario
                </button>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Nombre</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Rol</th>
                            <th className="p-2 border">Área</th>
                            <th className="p-2 border">Activo</th>
                            <th className="p-2 border">Fecha de registro</th>
                            <th className="p-2 border">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="text-center">
                                <td className="p-2 border">{u.id}</td>
                                <td className="p-2 border">
                                    {u.nombre} {u.apellido}
                                </td>
                                <td className="p-2 border">{u.email}</td>
                                <td className="p-2 border">{u.rol}</td>
                                <td className="p-2 border">{u.area || "-"}</td>
                                <td className="p-2 border">
                                    {u.activo ? "Sí" : "No"}
                                </td>
                                <td className="p-2 border">{formatDate(u.fecha_registro)}</td>
                                <td className="p-2 border">
                                    <div className="flex justify-center gap-2">
                                        {canEdit && (
                                            <button onClick={() => handleEdit(u)}
                                                className="px-2 py-1 bg-blue-500 text-white rounded">
                                                Editar
                                            </button>
                                        )}

                                        {canDelete && (
                                            <button onClick={() => handleDelete(u)}
                                                className="px-2 py-1 bg-red-500 text-white rounded">
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">

                        <h2 className="text-lg font-bold mb-4">Editar Usuario</h2>

                        <input
                            type="text"
                            value={selectedUser.nombre}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, nombre: e.target.value })
                            }
                            className="border p-2 w-full mb-2"
                            placeholder="Nombre"
                        />

                        <input
                            type="text"
                            value={selectedUser.apellido}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, apellido: e.target.value })
                            }
                            className="border p-2 w-full mb-4"
                            placeholder="Apellido"
                        />
                        <select
                            value={selectedUser.rol_id || ""}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, rol_id: Number(e.target.value) })
                            }
                            className="border p-2 w-full mb-2"
                        >
                            <option value="">Selecciona rol</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.nombre}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedUser.area_id || ""}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, area_id: Number(e.target.value) })
                            }
                            className="border p-2 w-full mb-2"
                        >
                            <option value="">Selecciona área</option>
                            {areas.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nombre}
                                </option>
                            ))}
                        </select>
                        <input
                            type="email"
                            value={selectedUser.email || ""}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, email: e.target.value })
                            }
                            className="border p-2 w-full mb-2"
                            placeholder="Email"
                        />

                        {!isEdit && (
                            <input
                                type="password"
                                value={selectedUser.password || ""}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, password: e.target.value })
                                }
                                className="border p-2 w-full mb-2"
                                placeholder="Password"
                            />
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-300 px-3 py-1 rounded"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={() => setShowConfirm(true)}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                            >
                                {isEdit ? "Actualizar" : "Crear"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">

                        <h2 className="text-lg font-bold mb-4">Confirmar cambios</h2>

                        {isEdit && (getChanges().length === 0 ? (
                            <p>No hay cambios</p>
                        ) : (
                            <ul className="mb-4">
                                {getChanges().map((c, i) => (
                                    <li key={i} className="text-sm">
                                        <strong>{c.field}:</strong> {c.before} → {c.after}
                                    </li>
                                ))}
                            </ul>
                        ))}
                        {!isEdit && (
                            <p className="text-sm text-muted-foreground mb-4">
                                Se creará un nuevo usuario con los datos proporcionados.
                            </p>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="bg-gray-300 px-3 py-1 rounded">
                                Cancelar
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isEdit ? !canEdit : !canCreate}
                                className="bg-blue-500 text-white px-3 py-1 rounded">
                                Confirmar
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>

    )

}