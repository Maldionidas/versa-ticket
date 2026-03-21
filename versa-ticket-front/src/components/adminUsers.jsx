import { useEffect, useState } from "react"

export function AdminUsers() {
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [originalUser, setOriginalUser] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [roles, setRoles] = useState([])
    const [areas, setAreas] = useState([])


    const handleEdit = (user) => {
        setSelectedUser(user)
        setOriginalUser(user)
        setShowModal(true)
    }
    //para eliminar un usuario, se muestra una confirmación antes de eliminar
    const handleDelete = (user) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${user.nombre} ${user.apellido}?`)) {
            // Aquí puedes agregar la lógica para eliminar al usuario
            console.log(`Usuario ${user.id} eliminado`)
        }
    }
    //para actualizar la lista de usuarios después de editar
    const fetchUsers = async () => {
        const res = await fetch("http://localhost:3000/api/users/admin")
        const data = await res.json()
        setUsers(data)
    }
    // actualizar usuario handler
    const handleUpdate = async () => {
        try {
            const res = await fetch(
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
                        area_id: selectedUser.area_id,
                    }),
                }
            )

            const data = await res.json()

            // actualizar la lista de usuarios con el usuario actualizado
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === data.id ? { ...u, ...data } : u)
            )

            setSelectedUser(null)

        } catch (error) {
            console.error("Error actualizando:", error)
        }
    }
    // para mostrar los cambios antes de confirmar
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

    // para cargar un usuario seleccionado
    useEffect(() => {
        if (selectedUser) {
            console.log(selectedUser)
            console.log(selectedUser.id)
        }
    }, [selectedUser])
    // para cargar los usuarios al montar el componente
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
                console.log("ROLES:", dataRoles)
                setRoles(dataRoles)
                setAreas(dataAreas)

            } catch (error) {
                console.error("Error cargando catálogos:", error)
            }
        }

        fetchCatalogs()
        fetchUsers()
    }, [])
    console.log(users)
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

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
                                <td className="p-2 border">{u.fecha_registro}</td>
                                <td className="p-2 border">
                                    {/* botones para editar o eliminar */}
                                    <button onClick={() => handleEdit(u)} className="px-2 py-1 bg-blue-500 text-white rounded mr-2">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(u)} className="px-2 py-1 bg-red-500 text-white rounded">
                                        Eliminar
                                    </button>
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
                                setSelectedUser({ ...selectedUser, rol_id: e.target.value })
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
                                setSelectedUser({ ...selectedUser, area_id: e.target.value })
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
                                Guardar
                            </button>
                        </div>

                    </div>
                </div>
            )}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">

                        <h2 className="text-lg font-bold mb-4">Confirmar cambios</h2>

                        {getChanges().length === 0 ? (
                            <p>No hay cambios</p>
                        ) : (
                            <ul className="mb-4">
                                {getChanges().map((c, i) => (
                                    <li key={i} className="text-sm">
                                        <strong>{c.field}:</strong> {c.before} → {c.after}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="bg-gray-300 px-3 py-1 rounded"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={async () => {
                                    await handleUpdate()
                                    setShowConfirm(false)
                                    setShowModal(false)
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Confirmar
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>

    )

}