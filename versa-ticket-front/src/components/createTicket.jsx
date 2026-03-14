import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import mascot from '../assets/mascota.jpeg'

const prioridades = [
  { id: 1, nombre: 'Baja' },
  { id: 2, nombre: 'Media' },
  { id: 3, nombre: 'Alta' },
  { id: 4, nombre: 'Urgente' },
]

const categorias = [
  { id: 1, nombre: 'Bug' },
  { id: 2, nombre: 'Solicitud de Funcionalidad' },
  { id: 3, nombre: 'Soporte Técnico' },
  { id: 4, nombre: 'Consulta General' },
]

const areas = [
  { id: 1, nombre: 'IT' },
  { id: 2, nombre: 'Ventas' },
  { id: 3, nombre: 'Soporte ' },
  { id: 4, nombre: 'HR' },
]

const responsables = [
  { id: 1, nombre: 'Agente 1' },
  { id: 2, nombre: 'Agente 2' },
  { id: 3, nombre: 'Agente 3' },
]

export function CreateTicketForm() {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad_id: '2',
    categoria_id: '',
    area_id: '',
    responsable_id: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Ticket creado exitosamente!')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
              {/* Título */}
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

              {/* Descripción */}
              <div className="space-y-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-foreground">
                  Descripción <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Describe el problema con el mayor detalle posible..."
                  rows={6}
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                    Cuanta más información proporciones, más rápido podremos ayudarte. Incluye pasos para reproducir el problema, resultados esperados vs reales, y cualquier otro detalle relevante.
                </p>
              </div>

              {/* Priority & Category row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="prioridad_id" className="block text-sm font-medium text-foreground">
                    Prioridad <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="prioridad_id"
                    name="prioridad_id"
                    value={formData.prioridad_id}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    {prioridades.map((prioridad) => (
                      <option key={prioridad.id} value={prioridad.id}>
                        {prioridad.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="categoria_id" className="block text-sm font-medium text-foreground">
                    Categoría <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="categoria_id"
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="">Selecciona la categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Área */}
              <div className="space-y-2">
                <label htmlFor="area_id" className="block text-sm font-medium text-foreground">
                  Área <span className="text-destructive">*</span>
                </label>
                <select
                  id="area_id"
                  name="area_id"
                  value={formData.area_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">Selecciona el área</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsable */}
              <div className="space-y-2">
                <label htmlFor="responsable_id" className="block text-sm font-medium text-foreground">
                  Asignar <span className="text-muted-foreground">(Opcional)</span>
                </label>
                <select
                  id="responsable_id"
                  name="responsable_id"
                  value={formData.responsable_id}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">Selecciona un agente...</option>
                  {responsables.map((responsable) => (
                    <option key={responsable.id} value={responsable.id}>
                      {responsable.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  Crear Ticket
                </button>
              </div>
            </form>
          </div>

          {/* Right sidebar */}
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
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Sé específico y claro en el título
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Incluye pasos para reproducir el problema
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Adjunta capturas de pantalla si aplica
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Selecciona el nivel de prioridad apropiado
                </li>
              </ul>
            </div>

            {/* Priority levels card */}
            <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-primary">Niveles de Prioridad</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
                  <span className="font-medium">Baja</span>
                  <span className="text-muted-foreground">- Problemas menores</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  <span className="font-medium">Media</span>
                  <span className="text-muted-foreground">- Prioridad normal</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                  <span className="font-medium">Alta</span>
                  <span className="text-muted-foreground">- Problemas importantes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  <span className="font-medium">Urgente</span>
                  <span className="text-muted-foreground">- Problemas críticos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
