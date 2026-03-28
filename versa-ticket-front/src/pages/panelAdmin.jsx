import { useState, useMemo } from "react"
import { AdminUsers } from "../components/adminUsers"
import { AdminAreas } from "../components/adminAreas"
import { AdminRoles } from "../components/adminRoles"
import { AdminCategorias } from "../components/adminCategorias"
import { AdminCampos } from "../components/adminCampos"

// helpers simples
const normalizePermissions = (permisos) => {
    try {
        if (!permisos) return {}
        return typeof permisos === "string"
            ? JSON.parse(permisos)
            : permisos
    } catch {
        return {}
    }
}

const can = (permisos, module, action) => {
    return permisos?.[module]?.[action] === true
}

export function AdminPanel({ user }) {
    const [view, setView] = useState("users")

    const permisos = useMemo(() => {
        return normalizePermissions(user?.permisos)
    }, [user])

    // 🔐 Validar accesos disponibles
    const canViewUsers = can(permisos, "users", "read")
    const canViewAreas = can(permisos, "areas", "read")
    const canViewRoles = can(permisos, "roles", "read")
    const canViewCategorias = can(permisos, "categorias", "read")
    const canViewCampos = can(permisos, "campos", "read")
    // 🚨 Si no tiene acceso a nada
    if (!canViewUsers && !canViewAreas && !canViewRoles && !canViewCategorias && !canViewCampos) {
        return (
            <div className="p-6">
                <div className="bg-red-100 text-red-700 p-4 rounded">
                    No tienes acceso al panel de administración
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">

            {/* TABS */}
            <div className="flex gap-2 border-b mb-4">

                {canViewUsers && (
                    <button
                        onClick={() => setView("users")}
                        className={`px-4 py-2 rounded-t-lg border ${
                            view === "users"
                                ? "bg-white border-b-white font-bold"
                                : "bg-gray-100"
                        }`}
                    >
                        Usuarios
                    </button>
                )}

                {canViewAreas && (
                    <button
                        onClick={() => setView("areas")}
                        className={`px-4 py-2 rounded-t-lg border ${
                            view === "areas"
                                ? "bg-white border-b-white font-bold"
                                : "bg-gray-100"
                        }`}
                    >
                        Áreas
                    </button>
                )}

                {canViewRoles && (
                    <button
                        onClick={() => setView("roles")}
                        className={`px-4 py-2 rounded-t-lg border ${
                            view === "roles"
                                ? "bg-white border-b-white font-bold"
                                : "bg-gray-100"
                        }`}
                    >
                        Roles
                    </button>
                )}
                
                {canViewCategorias && (
                    <button
                        onClick={() => setView("categorias")}
                        className={`px-4 py-2 rounded-t-lg border ${
                            view === "categorias"
                                ? "bg-white border-b-white font-bold"
                                : "bg-gray-100"
                        }`}
                    >
                        Categorías
                    </button>
                )}
                {canViewCampos && (
                    <button
                        onClick={() => setView("campos")}
                        className={`px-4 py-2 rounded-t-lg border ${
                            view === "campos"
                                ? "bg-white border-b-white font-bold"
                                : "bg-gray-100"
                        }`}
                    >
                        Campos
                    </button>
                )}

            </div>

            {/* CONTENIDO PROTEGIDO */}
            <div className="bg-white border p-4 rounded-b-lg">

                {view === "users" && canViewUsers && (
                    <AdminUsers user={user} permisos={permisos} />
                )}

                {view === "areas" && canViewAreas && (
                    <AdminAreas user={user} permisos={permisos} />
                )}

                {view === "roles" && canViewRoles && (
                    <AdminRoles user={user} permisos={permisos} />
                )}
                {view === "categorias" && canViewCategorias && (
                    <AdminCategorias user={user} permisos={permisos} />
                )}
                {view === "campos" && canViewCampos && (
                    <AdminCampos user={user} permisos={permisos} />
                )}


            </div>

        </div>
    )
}