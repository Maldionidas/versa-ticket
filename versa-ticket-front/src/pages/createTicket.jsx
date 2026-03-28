import { useState, useEffect } from 'react'
import { ArrowLeft, UploadCloud, X, Paperclip } from 'lucide-react' // Importé iconos para los archivos
import mascot from '../assets/mascota.jpeg'

export function CreateTicketForm() {
    const [areas, setAreas] = useState([])
    const [prioridades, setPrioridades] = useState([])
    const [categorias, setCategorias] = useState([])

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        prioridad_id: '2',
        categoria_id: '',
        area_id: ''
    })

    // NUEVO ESTADO: Para guardar los archivos seleccionados
    const [archivos, setArchivos] = useState([])
    const [responsables, setResponsables] = useState([])

    // Para guardar la configuración de los campos que vienen del backend
    const [camposDinamicos, setCamposDinamicos] = useState([])

    // Para guardar lo que el usuario escribe en esos campos (el state del formulario dinámico)
    const [valoresDinamicos, setValoresDinamicos] = useState({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resAreas = await fetch("http://localhost:3000/api/catalogos/areas")
                const dataAreas = await resAreas.json()

                const resPrioridades = await fetch("http://localhost:3000/api/catalogos/prioridades")
                const dataPrioridades = await resPrioridades.json()

                const resUsuarios = await fetch("http://localhost:3000/api/users/admin")
                const dataUsuarios = await resUsuarios.json()

                setResponsables(dataUsuarios)
                setAreas(dataAreas)
                setPrioridades(dataPrioridades)
            } catch (error) {
                console.error("Error cargando catálogos:", error)
            }
        }
        fetchData()
    }, [])
    useEffect(() => {
        // Si no hay área seleccionada, limpiamos todo
        if (!formData.area_id) {
            setCategorias([])
            setCamposDinamicos([])
            setValoresDinamicos({})
            return
        }

        const fetchDatosPorArea = async () => {
            try {
                // 1. Pedimos las categorías (Lo que ya tenías)
                const resCat = await fetch(`http://localhost:3000/api/catalogos/categorias/${formData.area_id}`)
                const dataCat = await resCat.json()
                setCategorias(dataCat)

                // 2. PEDIMOS LOS CAMPOS DINÁMICOS (¡Esto era lo que faltaba!)
                const resCampos = await fetch(`http://localhost:3000/api/campos/area/${formData.area_id}`)
                const dataCampos = await resCampos.json()
                setCamposDinamicos(dataCampos)

                // 3. Inicializamos el estado de las respuestas
                const valoresIniciales = {}
                dataCampos.forEach(campo => {
                    valoresIniciales[campo.id] = campo.tipo_dato === 'checkbox' ? false : ''
                })
                setValoresDinamicos(valoresIniciales)

            } catch (error) {
                console.error("Error cargando datos del área:", error)
            }
        }

        fetchDatosPorArea()
    }, [formData.area_id])

    useEffect(() => {
        if (!formData.area_id) return
        const fetchCategorias = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/catalogos/categorias/${formData.area_id}`)
                const data = await res.json()
                setCategorias(data)
            } catch (error) {
                console.error("Error cargando categorías:", error)
            }
        }
        fetchCategorias()
    }, [formData.area_id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value, ...(name === "area_id" && { categoria_id: "" }) }))
    }
    // Este handler es vital para los campos dinámicos
    const handleDynamicChange = (campoId, valor) => {
        setValoresDinamicos(prev => ({
            ...prev,
            [campoId]: valor
        }))
    }

    // NUEVO HANDLER: Captura los archivos seleccionados
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        setArchivos(prev => [...prev, ...files])
        // Limpiamos el input por si el usuario borra un archivo y quiere volver a subir exactamente el mismo
        e.target.value = null
    }

    // NUEVO HANDLER: Elimina un archivo de la lista antes de enviar
    const removeFile = (indexToRemove) => {
        setArchivos(prev => prev.filter((_, index) => index !== indexToRemove))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // CAMBIO CRUCIAL: Usamos FormData en lugar de JSON para poder adjuntar archivos binarios
            const submitData = new FormData()

            // 1. Agregamos los campos de texto
            submitData.append('titulo', formData.titulo)
            submitData.append('descripcion', formData.descripcion)
            submitData.append('prioridad_id', formData.prioridad_id)
            submitData.append('categoria_id', formData.categoria_id)
            submitData.append('area_id', formData.area_id)
            submitData.append('estado_id', 1) // Abierto
            submitData.append('usuario_id', 3) // usuario de prueba
            // Agrega esta línea justo antes del foreach de los archivos
            submitData.append('valores_dinamicos', JSON.stringify(valoresDinamicos))

            // 2. Agregamos los archivos (iteramos porque pueden ser múltiples)
            archivos.forEach(archivo => {
                // 'archivos' será el nombre del campo que el backend debe leer
                submitData.append('archivos', archivo)
            })

            const response = await fetch("http://localhost:3000/api/tickets", {
                method: "POST",
                // ⚠️ IMPORTANTE: Cuando usas FormData, NO debes configurar el "Content-Type". 
                // El navegador lo hace automáticamente (pone multipart/form-data y genera el boundary).
                body: submitData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Error creando ticket")
            }

            console.log("Ticket creado:", data)
            alert("Ticket creado exitosamente!")

            // Limpiamos todo el formulario
            setFormData({
                titulo: '',
                descripcion: '',
                prioridad_id: '2',
                categoria_id: '',
                area_id: '',
            })
            setArchivos([]) // Limpiamos archivos

        } catch (error) {
            console.error(error)
            alert("Error creando ticket")
        }
    }

    return (
        <div className="flex-1 overflow-auto">
            <div className="min-h-full bg-background p-6">
                {/* Back button */}
                <button className="mb-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Regresar a tickets
                </button>

                {/* Header */}
                <div className="mb-6 rounded-lg bg-primary px-6 py-5">
                    <h1 className="text-2xl font-bold text-primary-foreground">Crear un nuevo Ticket</h1>
                    <p className="text-primary-foreground/80">Llena a detalle el formulario para resolver el problema</p>
                </div>

                <div className="flex gap-6">
                    {/* Main form */}
                    <div className="flex-1 rounded-lg border border-border bg-white p-6 shadow-sm">
                        <div className="mb-4 border-l-4 border-accent pl-4">
                            <h2 className="text-xl font-semibold text-primary">Detalles del Ticket</h2>
                        </div>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Proporciona toda la información relevante para que nuestro equipo pueda ayudarte de manera eficiente.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* ... (TÍTULO Y DESCRIPCIÓN SE MANTIENEN IGUAL) ... */}
                            <div className="space-y-2">
                                <label htmlFor="titulo" className="block text-sm font-medium text-foreground">
                                    Título <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    placeholder="Resumen del problema"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="descripcion" className="block text-sm font-medium text-foreground">
                                    Descripción <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    placeholder="Describe el problema con el mayor detalle posible..."
                                    rows={4}
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                                />
                            </div>

                            {/* ... (PRIORIDAD, CATEGORÍA Y ÁREA SE MANTIENEN IGUAL) ... */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="prioridad_id" className="block text-sm font-medium text-foreground">Prioridad <span className="text-destructive">*</span></label>
                                    <select id="prioridad_id" name="prioridad_id" value={formData.prioridad_id} onChange={handleChange} className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20">
                                        {prioridades.map((p) => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="categoria_id" className="block text-sm font-medium text-foreground">Categoría <span className="text-destructive">*</span></label>
                                    <select id="categoria_id" name="categoria_id" value={formData.categoria_id} onChange={handleChange} required className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20">
                                        <option value="">Selecciona la categoría</option>
                                        {categorias.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="area_id" className="block text-sm font-medium text-foreground">Área <span className="text-destructive">*</span></label>
                                <select id="area_id" name="area_id" value={formData.area_id} onChange={handleChange} required className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20">
                                    <option value="">Selecciona el área</option>
                                    {areas.map((a) => (<option key={a.id} value={a.id}>{a.nombre}</option>))}
                                </select>
                            </div>
                            {/* Renderizado dinámico dentro de tu form */}
                            {camposDinamicos.length > 0 && (
                                <div className="space-y-4 border-t pt-4 mt-4">
                                    <h3 className="font-semibold text-primary flex items-center gap-2">
                                        <span>✨</span> Información específica del Área
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {camposDinamicos.map(campo => {
                                            // AQUÍ EL FIX: Parseamos las opciones de forma segura
                                            const opciones = campo.opciones ?
                                                (typeof campo.opciones === 'string' ? JSON.parse(campo.opciones) : campo.opciones)
                                                : [];

                                            return (
                                                <div key={campo.id} className="space-y-2">
                                                    <label className="block text-sm font-medium text-foreground">
                                                        {campo.nombre_campo} {campo.requerido && <span className="text-destructive">*</span>}
                                                    </label>

                                                    {/* INPUT TEXT */}
                                                    {campo.tipo_dato === 'text' && (
                                                        <input
                                                            type="text"
                                                            required={campo.requerido}
                                                            value={valoresDinamicos[campo.id] || ''} // Usamos el estado controlado
                                                            onChange={(e) => handleDynamicChange(campo.id, e.target.value)}
                                                            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                                                        />
                                                    )}

                                                    {/* SELECT (Lista desplegable) */}
                                                    {campo.tipo_dato === 'select' && (
                                                        <select
                                                            required={campo.requerido}
                                                            value={valoresDinamicos[campo.id] || ''} // Usamos el estado controlado
                                                            onChange={(e) => handleDynamicChange(campo.id, e.target.value)}
                                                            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                                                        >
                                                            <option value="">Selecciona una opción</option>
                                                            {/* Usamos la variable 'opciones' ya parseada */}
                                                            {opciones.map((opt, idx) => (
                                                                <option key={idx} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/*Subida de Archivos */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground">
                                    Evidencia Adjunta (Opcional)
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Haz clic para subir</span> o arrastra tus archivos</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, PDF (Max. 5MB)</p>
                                        </div>
                                        <input
                                            id="dropzone-file"
                                            type="file"
                                            className="hidden"
                                            multiple
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                {/* Lista de archivos seleccionados con opción de borrar */}
                                {archivos.length > 0 && (
                                    <ul className="mt-4 space-y-2">
                                        {archivos.map((file, idx) => (
                                            <li key={idx} className="flex items-center justify-between p-2 text-sm border border-border rounded-md bg-muted/10">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <span className="truncate max-w-xs">{file.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="text-destructive hover:text-red-700 p-1"
                                                    title="Eliminar archivo"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4 border-t border-border">
                                <button type="button" className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors">
                                    Crear Ticket
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ... (EL SIDEBAR SE MANTIENE IGUAL) ... */}
                    <div className="hidden w-72 space-y-4 lg:block">
                        {/* Help card */}
                        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                            <div className="bg-primary p-6 text-center">
                                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-lg bg-primary-foreground/10">
                                    <img src={mascot} alt="Mascot" className="h-16 w-16" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary-foreground">¿Necesitas Ayuda?</h3>
                                <p className="mt-1 text-sm text-primary-foreground/80">
                                    ¡Nuestro equipo está aquí para ayudarte! Completa el formulario y te responderemos pronto.
                                </p>
                            </div>
                        </div>

                        {/* Tips card */}
                        <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold text-primary">
                                <span>📋</span> Consejos para Mejores Tickets
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2"><span className="text-green-500">•</span>Sé específico y claro en el título</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">•</span>Incluye pasos para reproducir el problema</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">•</span>Adjunta capturas de pantalla si aplica</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">•</span>Selecciona el nivel de prioridad apropiado</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}