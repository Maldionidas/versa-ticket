import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

const modules = ["users", "areas", "tickets"]
const actions = ["create", "read", "update", "delete"]

export function AdminAreas() {
    const [areas, setAreas] = useState([])
    const [search, setSearch] = useState("")
    const [selectedArea, setSelectedArea] = useState(null)
    const [isEdit, setIsEdit] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    //  Cargar áreas
    const fetchAreas = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/areas")
            const text = await res.text()
            let data = []

            try {
                data = text ? JSON.parse(text) : []
            } catch {
                console.warn("Respuesta no válida, usando array vacío")
            }

            setAreas(data)
        } catch (error) {
            console.error("Error cargando áreas:", error)
        }
    }

    useEffect(() => {
        fetchAreas()
    }, [])

    //  Filtrado
    const filteredAreas = areas.filter(a =>
        a.nombre.toLowerCase().includes(search.toLowerCase())
    )

    //  Abrir modal crear
    const handleCreate = () => {
        setSelectedArea({
            nombre: "",
            descripcion: "",
            activo: true
        })
        setIsEdit(false)
        setShowModal(true)
    }

    //  Editar
    const handleEdit = (area) => {
        setSelectedArea({ ...area })
        setIsEdit(true)
        setShowModal(true)
    }

    //  Guardar 
    const handleSave = async () => {
        try {
            setLoading(true) // 🔥 empieza loading

            const url = isEdit
                ? `http://localhost:3000/api/areas/${selectedArea.id}`
                : `http://localhost:3000/api/areas`

            const method = isEdit ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedArea)
            })

            const text = await res.text()


            if (!res.ok) {
                throw new Error("Error en backend")
            }

            await fetchAreas()
            setShowModal(false)
            setSelectedArea(null)

        } catch (error) {
            console.error("Error guardando área:", error)
        } finally {
            setLoading(false) // 🔥 SIEMPRE apagar loading
        }
    }

    //  Eliminar
    const handleDelete = async (area) => {
        if (!confirm(`¿Eliminar área "${area.nombre}"?`)) return

        try {
            await fetch(`http://localhost:3000/api/areas/${area.id}`, {
                method: "DELETE"
            })

            await fetchAreas()
        } catch (error) {
            console.error("Error eliminando:", error)
        }
    }

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Áreas</h1>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    <Plus size={16} /> Nueva Área
                </button>
            </div>

            {/* BUSCADOR */}
            <input
                type="text"
                placeholder="Buscar área..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 mb-4 w-full rounded-lg"
            />

            {/* TABLA */}
            <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2">Nombre</th>
                        <th className="p-2">Descripción</th>
                        <th className="p-2">Estado</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredAreas.map((a) => (
                        <tr key={a.id} className="text-center border-t">
                            <td>{a.nombre}</td>
                            <td>{a.descripcion || "-"}</td>
                            <td>
                                <span className={`px-2 py-1 rounded text-xs ${a.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}>
                                    {a.activo ? "Activo" : "Inactivo"}
                                </span>
                            </td>

                            <td className="flex justify-center gap-2 py-2">
                                <button onClick={() => handleEdit(a)}>
                                    <Pencil size={16} />
                                </button>

                                <button onClick={() => handleDelete(a)}>
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL */}
            {showModal && selectedArea && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-lg font-bold mb-4">
                            {isEdit ? "Editar Área" : "Nueva Área"}
                        </h2>

                        <input
                            type="text"
                            placeholder="Nombre"
                            value={selectedArea.nombre}
                            onChange={(e) =>
                                setSelectedArea({ ...selectedArea, nombre: e.target.value })
                            }
                            className="border p-2 w-full mb-2"
                        />

                        <textarea
                            placeholder="Descripción"
                            value={selectedArea.descripcion || ""}
                            onChange={(e) =>
                                setSelectedArea({ ...selectedArea, descripcion: e.target.value })
                            }
                            className="border p-2 w-full mb-2" />

                        <label className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={selectedArea.activo}
                                onChange={(e) =>
                                    setSelectedArea({ ...selectedArea, activo: e.target.checked })
                                } />
                            Activo
                        </label>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-300 px-3 py-1 rounded">
                                Cancelar
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50">
                                {loading ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}