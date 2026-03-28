import { useEffect, useState } from "react";

export function AdminCampos({ user, permisos }) {
    const [campos, setCampos] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedCampo, setSelectedCampo] = useState(null);
    const [originalCampo, setOriginalCampo] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Estado temporal para manejar la creación de opciones en listas desplegables
    const [nuevaOpcion, setNuevaOpcion] = useState("");

    // Lógica de permisos
    const can = (permisos, module, action) => permisos?.[module]?.[action] === true;
    const canCreate = can(permisos, "campos", "create");
    const canEdit = can(permisos, "campos", "update");
    const canDelete = can(permisos, "campos", "delete");
    const canRead = can(permisos, "campos", "read");

    const isEdit = !!originalCampo;

    const fetchData = async () => {
        try {
            const [resCampos, resAreas] = await Promise.all([
                fetch("http://localhost:3000/api/campos"),
                fetch("http://localhost:3000/api/catalogos/areas")
            ]);
            
            const dataCampos = await resCampos.json();
            const dataAreas = await resAreas.json();
            
            setCampos(dataCampos);
            setAreas(dataAreas);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => {
        if (canRead) fetchData();
    }, [canRead]);

    const handleEdit = (campo) => {
        if (!canEdit) return;
        // Nos aseguramos de que las opciones sean un arreglo, incluso si vienen nulas de la BD
        const opcionesArray = campo.opciones ? 
            (typeof campo.opciones === 'string' ? JSON.parse(campo.opciones) : campo.opciones) 
            : [];
            
        const campoToEdit = { ...campo, opciones: opcionesArray };
        setSelectedCampo(campoToEdit);
        setOriginalCampo(campoToEdit);
        setShowModal(true);
    };

    const handleDelete = async (campo) => {
        if (!canDelete) return;
        if (!window.confirm(`¿Eliminar el campo "${campo.nombre_campo}"?`)) return;

        try {
            const res = await fetch(`http://localhost:3000/api/campos/${campo.id}`, { method: "DELETE" });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message);
            
            setCampos((prev) => prev.filter(c => c.id !== campo.id));
        } catch (error) {
            alert(error.message); // Muestra el mensaje de fail-safe que configuramos en el backend
        }
    };

    const handleSave = async () => {
        if (isEdit && !canEdit) return;
        if (!isEdit && !canCreate) return;

        try {
            const url = isEdit
                ? `http://localhost:3000/api/campos/${selectedCampo.id}`
                : `http://localhost:3000/api/campos`;
            const method = isEdit ? "PUT" : "POST";

            // Limpiamos las opciones si el tipo de dato ya no las necesita
            const necesitaOpciones = selectedCampo.tipo_dato === 'select' || selectedCampo.tipo_dato === 'radio';
            const payload = {
                ...selectedCampo,
                opciones: necesitaOpciones ? selectedCampo.opciones : null
            };

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            await fetchData();
            setShowConfirm(false);
            setShowModal(false);
            setSelectedCampo(null);
        } catch (error) {
            console.error("Error guardando:", error);
        }
    };

    // Funciones para manejar el arreglo de opciones dinámicas
    const agregarOpcion = () => {
        if (!nuevaOpcion.trim()) return;
        setSelectedCampo(prev => ({
            ...prev,
            opciones: [...(prev.opciones || []), nuevaOpcion.trim()]
        }));
        setNuevaOpcion("");
    };

    const quitarOpcion = (indexToRemove) => {
        setSelectedCampo(prev => ({
            ...prev,
            opciones: prev.opciones.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const getChanges = () => {
        if (!originalCampo || !selectedCampo) return [];
        const changes = [];
        if (originalCampo.nombre_campo !== selectedCampo.nombre_campo) changes.push({ field: "Nombre", before: originalCampo.nombre_campo, after: selectedCampo.nombre_campo });
        if (originalCampo.tipo_dato !== selectedCampo.tipo_dato) changes.push({ field: "Tipo", before: originalCampo.tipo_dato, after: selectedCampo.tipo_dato });
        if (originalCampo.area_id !== selectedCampo.area_id) {
            const before = areas.find(a => a.id === originalCampo.area_id)?.nombre;
            const after = areas.find(a => a.id === selectedCampo.area_id)?.nombre;
            changes.push({ field: "Área", before, after });
        }
        if (originalCampo.requerido !== selectedCampo.requerido) changes.push({ field: "Requerido", before: originalCampo.requerido ? "Sí" : "No", after: selectedCampo.requerido ? "Sí" : "No" });
        if (originalCampo.activo !== selectedCampo.activo) changes.push({ field: "Activo", before: originalCampo.activo ? "Sí" : "No", after: selectedCampo.activo ? "Sí" : "No" });
        return changes;
    };

    if (!canRead) {
        return <div className="p-6"><div className="bg-red-100 text-red-700 p-4 rounded">No tienes permiso para ver esta sección.</div></div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Campos Personalizados por Área</h1>

            {canCreate && (
                <button
                    onClick={() => {
                        setSelectedCampo({ nombre_campo: "", tipo_dato: "text", area_id: "", requerido: false, activo: true, opciones: [] });
                        setOriginalCampo(null);
                        setNuevaOpcion("");
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-700"
                >
                    + Agregar Campo
                </button>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Área</th>
                            <th className="p-2 border">Nombre del Campo</th>
                            <th className="p-2 border">Tipo</th>
                            <th className="p-2 border">Requerido</th>
                            <th className="p-2 border">Activo</th>
                            <th className="p-2 border">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campos.map((c) => (
                            <tr key={c.id} className="text-center hover:bg-gray-50">
                                <td className="p-2 border">{c.id}</td>
                                <td className="p-2 border font-medium">{c.area_nombre}</td>
                                <td className="p-2 border">{c.nombre_campo}</td>
                                <td className="p-2 border capitalize">{c.tipo_dato}</td>
                                <td className="p-2 border">{c.requerido ? "Sí" : "No"}</td>
                                <td className="p-2 border">
                                    <span className={`px-2 py-1 rounded text-xs ${c.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {c.activo ? "Sí" : "No"}
                                    </span>
                                </td>
                                <td className="p-2 border">
                                    <div className="flex justify-center gap-2">
                                        {canEdit && <button onClick={() => handleEdit(c)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Editar</button>}
                                        {canDelete && <button onClick={() => handleDelete(c)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Eliminar</button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Formulario */}
            {showModal && selectedCampo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{isEdit ? "Editar Campo" : "Nuevo Campo Dinámico"}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Área a la que pertenece</label>
                                <select
                                    value={selectedCampo.area_id || ""}
                                    onChange={(e) => setSelectedCampo({ ...selectedCampo, area_id: Number(e.target.value) })}
                                    className="border p-2 w-full rounded focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Selecciona un área</option>
                                    {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Campo (Etiqueta)</label>
                                <input
                                    type="text"
                                    value={selectedCampo.nombre_campo}
                                    onChange={(e) => setSelectedCampo({ ...selectedCampo, nombre_campo: e.target.value })}
                                    className="border p-2 w-full rounded outline-none"
                                    placeholder="Ej. Número de Placa"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Dato</label>
                                <select
                                    value={selectedCampo.tipo_dato || "text"}
                                    onChange={(e) => setSelectedCampo({ ...selectedCampo, tipo_dato: e.target.value })}
                                    className="border p-2 w-full rounded outline-none"
                                >
                                    <option value="text">Texto corto</option>
                                    <option value="textarea">Área de texto (Párrafo)</option>
                                    <option value="number">Número</option>
                                    <option value="date">Fecha</option>
                                    <option value="select">Lista Desplegable (Select)</option>
                                    <option value="radio">Opciones únicas (Radio)</option>
                                    <option value="checkbox">Casilla de verificación (Checkbox)</option>
                                </select>
                            </div>

                            {/* UI DINÁMICA: Solo aparece si se selecciona 'select' o 'radio' */}
                            {(selectedCampo.tipo_dato === 'select' || selectedCampo.tipo_dato === 'radio') && (
                                <div className="bg-gray-50 p-3 rounded border">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Opciones de la lista</label>
                                    <div className="flex gap-2 mb-2">
                                        <input 
                                            type="text" 
                                            value={nuevaOpcion} 
                                            onChange={(e) => setNuevaOpcion(e.target.value)} 
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarOpcion())}
                                            className="border p-1.5 flex-1 rounded text-sm" 
                                            placeholder="Nueva opción..." 
                                        />
                                        <button type="button" onClick={agregarOpcion} className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700">
                                            Agregar
                                        </button>
                                    </div>
                                    <ul className="space-y-1">
                                        {(selectedCampo.opciones || []).map((opt, idx) => (
                                            <li key={idx} className="flex justify-between items-center bg-white border p-1.5 rounded text-sm">
                                                <span>{opt}</span>
                                                <button type="button" onClick={() => quitarOpcion(idx)} className="text-red-500 hover:text-red-700 px-2 font-bold">×</button>
                                            </li>
                                        ))}
                                    </ul>
                                    {(!selectedCampo.opciones || selectedCampo.opciones.length === 0) && (
                                        <p className="text-xs text-red-500 mt-1">Debes agregar al menos una opción.</p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4 mt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedCampo.requerido}
                                        onChange={(e) => setSelectedCampo({ ...selectedCampo, requerido: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm">¿Es obligatorio?</span>
                                </label>
                                {isEdit && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedCampo.activo}
                                            onChange={(e) => setSelectedCampo({ ...selectedCampo, activo: e.target.checked })}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm text-gray-900">Campo Activo</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
                            <button
                                onClick={() => setShowConfirm(true)}
                                disabled={
                                    !selectedCampo.nombre_campo || 
                                    !selectedCampo.area_id || 
                                    ((selectedCampo.tipo_dato === 'select' || selectedCampo.tipo_dato === 'radio') && (!selectedCampo.opciones || selectedCampo.opciones.length === 0))
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Confirmar cambios</h2>
                        <div className="bg-gray-50 p-4 rounded mb-6">
                            {isEdit ? (
                                getChanges().length === 0 ? <p>No hay cambios para guardar.</p> : (
                                    <ul className="space-y-2">
                                        {getChanges().map((c, i) => (
                                            <li key={i} className="text-sm border-b pb-1 last:border-0">
                                                <span className="font-semibold">{c.field}:</span>{" "}
                                                <span className="line-through text-red-500">{c.before}</span>{" "}
                                                <span className="text-green-600">→ {c.after}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                <ul className="text-sm space-y-1">
                                    <li><strong>Nombre:</strong> {selectedCampo.nombre_campo}</li>
                                    <li><strong>Tipo:</strong> {selectedCampo.tipo_dato}</li>
                                    <li><strong>Área:</strong> {areas.find(a => a.id === selectedCampo.area_id)?.nombre}</li>
                                </ul>
                            )}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-200 rounded">Volver</button>
                            <button onClick={handleSave} disabled={isEdit ? (getChanges().length === 0 || !canEdit) : !canCreate} className="px-4 py-2 bg-green-600 text-white rounded">
                                Confirmar y Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}