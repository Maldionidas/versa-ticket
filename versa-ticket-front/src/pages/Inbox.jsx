// src/pages/Inbox.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TicketComments from '../components/TicketComments';
import SignatureModal from '../components/modalFirmas';

// 1. FUNCIONES Y CONSTANTES ESTÁTICAS FUERA DEL COMPONENTE
const estadosTicket = [
  { id: 1, nombre: 'Abierto' },
  { id: 2, nombre: 'En proceso' },
  { id: 3, nombre: 'En espera' },
  { id: 4, nombre: 'Resuelto' },
  { id: 5, nombre: 'Cerrado' }
];

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPriorityColor = (prioridad) => {
  const prioridadLower = prioridad?.toLowerCase() || '';
  const colors = {
    'crítica': 'text-red-600 bg-red-100',
    'critica': 'text-red-600 bg-red-100',
    'alta': 'text-orange-600 bg-orange-100',
    'media': 'text-yellow-600 bg-yellow-100',
    'baja': 'text-green-600 bg-green-100'
  };
  return colors[prioridadLower] || 'text-gray-600 bg-gray-100';
};

const getStatusColor = (estado) => {
  const estadoLower = estado?.toLowerCase() || '';
  const colors = {
    'abierto': 'text-blue-600 bg-blue-100',
    'pendiente': 'text-blue-600 bg-blue-100',
    'en proceso': 'text-purple-600 bg-purple-100',
    'en_progreso': 'text-purple-600 bg-purple-100',
    'en espera': 'text-orange-600 bg-orange-100',
    'resuelto': 'text-green-600 bg-green-100',
    'completado': 'text-green-600 bg-green-100',
    'cerrado': 'text-gray-600 bg-gray-100'
  };
  return colors[estadoLower] || 'text-gray-600 bg-gray-100';
};

// Calculadora de SLA
const calcularEstadoSLA = (fechaLimite, estadoId) => {
  // IDs 4 (Resuelto) y 5 (Cerrado) detienen el reloj
  if (!fechaLimite || estadoId === 4 || estadoId === 5) {
    return { estado: 'inactivo', claseFila: 'bg-white border-gray-200', badge: 'bg-gray-100 text-gray-600', texto: 'Inactivo' };
  }

  const ahora = new Date();
  const limite = new Date(fechaLimite);
  const diferenciaHoras = (limite - ahora) / (1000 * 60 * 60);

  if (diferenciaHoras < 0) {
    return { estado: 'vencido', claseFila: 'bg-red-50 border-red-300', badge: 'bg-red-200 text-red-800 font-bold', texto: '¡Vencido!' };
  }

  if (diferenciaHoras <= 2) {
    return { estado: 'peligro', claseFila: 'bg-orange-50 border-orange-300', badge: 'bg-orange-200 text-orange-800 font-bold', texto: 'Por vencer' };
  }

  return { estado: 'a_tiempo', claseFila: 'bg-white border-gray-200', badge: 'bg-green-100 text-green-800', texto: 'A tiempo' };
};

// 2. COMPONENTE PRINCIPAL
const Inbox = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const detailRef = useRef(null);

  const isAdmin = user?.rol_id === 2 || user?.rol_id === "Administrador";
  const isAgente = user?.rol_id === 3 || user?.rol_id === "Agente";

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([cargarTickets(), cargarAgentes()]);
    setLoading(false);
  };

  const cargarTickets = async () => {
    try {
      const endpoint = (isAgente && !isAdmin) ? '/tickets/assigned' : '/tickets';

      const response = await api.get(endpoint);
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error cargando tickets:', error);
      setTickets([]);
    }
  };

  const cargarAgentes = async () => {
    try {
      const response = await api.get('/users', { params: { rol: 3 } });
      setAgentes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error cargando agentes:', error);
      setAgentes([]);
    }
  };

  const asignarAgente = async (ticketId, agenteId) => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${ticketId}`, { responsable_id: agenteId || null });
      alert('Agente asignado correctamente');
      await cargarTickets();
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al asignar agente';
      alert(`${mensaje}`);
    } finally {
      setUpdating(false);
    }
  };

  const actualizarEstado = async (ticketId, nuevoEstadoId) => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${ticketId}`, { estado_id: nuevoEstadoId });
      alert('Estado actualizado correctamente');
      await cargarTickets();
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al actualizar estado';
      alert(`${mensaje}`);
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    if (isAdmin) return tickets;
    if (isAgente) return tickets.filter(t => t.responsable_id === user?.id);
    return tickets.filter(t => t.usuario_id === user?.id);
  }, [tickets, isAdmin, isAgente, user?.id]);

  const selectedTicket = useMemo(() =>
    tickets.find(t => t.id === selectedTicketId) || null,
    [tickets, selectedTicketId]);

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        {isAdmin ? '📋 Todos los Tickets' : '📥 Bandeja de entrada'}
      </h1>
      <p className="text-sm sm:text-base text-gray-500 mb-6">
        {isAdmin ? 'Gestiona todos los tickets del sistema' : 'Tus tickets y solicitudes'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de tickets */}
        <div className="lg:col-span-1 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No hay tickets
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              // 🔥 Calculamos el SLA en tiempo real
              const sla = calcularEstadoSLA(ticket.sla_fecha_limite, ticket.estado_id);

              return (
                <div
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket.id)}
                  // Inyectamos el color de fondo dinámico dependiendo del SLA
                  className={`rounded-lg shadow border p-4 cursor-pointer transition-all hover:shadow-md ${sla.claseFila} ${selectedTicketId === ticket.id ? 'ring-2 ring-amber-500' : ''
                    }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex flex-col">
                      {/* Mostramos el Folio real de la base de datos */}
                      <span className="text-xs font-mono text-gray-500 mb-1">{ticket.folio || `#${ticket.id}`}</span>
                      <h3 className="font-semibold text-gray-800 break-words line-clamp-2">{ticket.titulo}</h3>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.prioridad_nombre)}`}>
                        {ticket.prioridad_nombre || 'Media'}
                      </span>
                      {/* Mostrar Badge de SLA si el ticket sigue activo */}
                      {sla.estado !== 'inactivo' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${sla.badge}`}>
                          ⏳ {sla.texto}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{ticket.descripcion}</p>
                  <div className="flex flex-wrap justify-between items-center mt-3 gap-2">
                    <span className="text-xs text-gray-400">{formatDate(ticket.fecha_creacion)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.estado_nombre)}`}>
                      {ticket.estado_nombre || 'Pendiente'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 break-words">
                    👤 {ticket.usuario_nombre || 'Usuario'}
                    {ticket.responsable_nombre && ` | 🎧 ${ticket.responsable_nombre}`}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detalle del ticket */}
        <div className="lg:col-span-2" ref={detailRef}>
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0 mb-4">
                  <div className="w-full md:w-auto">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">{selectedTicket.titulo}</h2>
                    <p className="text-sm font-mono text-gray-500 mt-1">
                      {selectedTicket.folio || `#${selectedTicket.id?.toString().padStart(6, '0')}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <span className={`text-xs px-3 py-1 rounded-full ${getPriorityColor(selectedTicket.prioridad_nombre)}`}>
                      {selectedTicket.prioridad_nombre || 'Media'}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(selectedTicket.estado_nombre)}`}>
                      {selectedTicket.estado_nombre || 'Pendiente'}
                    </span>
                    {/* Badge de SLA en el encabezado del detalle */}
                    {calcularEstadoSLA(selectedTicket.sla_fecha_limite, selectedTicket.estado_id).estado !== 'inactivo' && (
                      <span className={`text-xs px-3 py-1 rounded-full ${calcularEstadoSLA(selectedTicket.sla_fecha_limite, selectedTicket.estado_id).badge}`}>
                        SLA: {calcularEstadoSLA(selectedTicket.sla_fecha_limite, selectedTicket.estado_id).texto}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">📅 Creado: {formatDate(selectedTicket.fecha_creacion)}</p>
                <p className="text-sm text-gray-500 mt-1 break-words">👤 Creado por: {selectedTicket.usuario_nombre || 'N/A'}</p>
              </div>

              <div className="p-4 sm:p-6 border-b">
                <h3 className="font-semibold text-gray-800 mb-3">📄 Descripción</h3>
                <p className="text-gray-600 whitespace-pre-wrap text-sm sm:text-base">{selectedTicket.descripcion}</p>
              </div>

              <div className="p-4 sm:p-6 border-b">
                <h3 className="font-semibold text-gray-800 mb-3">ℹ️ Información</h3>
                {/* 3 columnas para incluir el Vencimiento */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Área</p>
                    <p className="text-sm font-medium">{selectedTicket.area_nombre || 'No asignada'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Categoría</p>
                    <p className="text-sm font-medium">{selectedTicket.categoria_nombre || 'No asignada'}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${calcularEstadoSLA(selectedTicket.sla_fecha_limite, selectedTicket.estado_id).claseFila || 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Fecha de Vencimiento</p>
                    <p className="text-sm font-medium">
                      {selectedTicket.sla_fecha_limite ? formatDate(selectedTicket.sla_fecha_limite) : 'No configurado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Asignar Agente */}
              {isAdmin && (
                <div className="p-4 sm:p-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-3">🎧 Asignar Agente</h3>
                  <div className="flex gap-3">
                    <select
                      value={selectedTicket.responsable_id || ''}
                      onChange={(e) => asignarAgente(selectedTicket.id, e.target.value)}
                      disabled={updating}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
                    >
                      <option value="">Sin asignar</option>
                      {agentes.map((agente) => (
                        <option key={agente.id} value={agente.id}>
                          {agente.nombre} {agente.apellido || ''} - {agente.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedTicket.responsable_nombre && (
                    <p className="text-xs text-green-600 mt-2">
                      Actualmente asignado a: {selectedTicket.responsable_nombre}
                    </p>
                  )}
                </div>
              )}

              {/* Actualizar Estado */}
              {(isAdmin || isAgente) && (
                <div className="p-4 sm:p-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-3">🔄 Actualizar Estado</h3>
                  <div className="flex flex-wrap gap-2">
                    {estadosTicket.map((estado) => (
                      <button
                        key={estado.id}
                        onClick={() => {
                          if (estado.id === 5) {
                            setShowSignatureModal(true); // ¡Abrimos el modal para firmar!
                          } else {
                            actualizarEstado(selectedTicket.id, estado.id); // Flujo normal
                          }
                        }}
                        disabled={updating}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${selectedTicket.estado_id === estado.id
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {estado.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {showSignatureModal && (
                <SignatureModal
                  ticketId={selectedTicket.id}
                  onClose={() => setShowSignatureModal(false)}
                  onSuccess={() => {
                    setShowSignatureModal(false);
                    cargarTickets();
                  }}
                />
              )}

              {/* Sección de comentarios */}
              <div className="border-t">
                <TicketComments
                  ticketId={selectedTicket.id}
                  ticketEstadoId={selectedTicket.estado_id}
                  ticketEstadoNombre={selectedTicket.estado_nombre}
                />
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 rounded-b-lg border-t">
                <p className="text-xs text-gray-400">Sistema de Tickets - Versa Ticket</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 h-full flex flex-col justify-center items-center min-h-[300px]">
              <div className="text-5xl sm:text-6xl mb-4">📧</div>
              <p className="text-sm sm:text-base">Selecciona un ticket para ver los detalles</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Inbox;