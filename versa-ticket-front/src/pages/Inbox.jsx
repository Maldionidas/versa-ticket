// src/pages/Inbox.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Inbox = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const isAdmin = user?.rol_id === 2;
  const isAgente = user?.rol_id === 3;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([
      cargarTickets(),
      cargarAgentes()
    ]);
    setLoading(false);
  };

  const cargarTickets = async () => {
    try {
      const response = await api.get('/tickets');
      console.log('Tickets:', response.data);
      setTickets(response.data);
    } catch (error) {
      console.error('Error cargando tickets:', error);
      if (error.response?.status === 401) {
        // El interceptor ya maneja la redirección, solo logueamos
        console.warn('No autorizado - redirigiendo a login');
      }
    }
  };

  const cargarAgentes = async () => {
    try {
      const response = await api.get('/users', {
        params: { rol: 3 }
      });
      setAgentes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error cargando agentes:', error);
      setAgentes([]);
    }
  };

  // ✅ CORREGIDO: Usar api en lugar de fetch
  const asignarAgente = async (ticketId, agenteId) => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${ticketId}`, { 
        responsable_id: agenteId || null 
      });
      
      alert('✅ Agente asignado correctamente');
      await cargarTickets();
      
      // Actualizar ticket seleccionado
      if (selectedTicket?.id === ticketId) {
        const ticketActualizado = tickets.find(t => t.id === ticketId);
        setSelectedTicket(ticketActualizado);
      }
    } catch (error) {
      console.error('Error:', error);
      const mensaje = error.response?.data?.message || 'Error al asignar agente';
      alert(`❌ ${mensaje}`);
    } finally {
      setUpdating(false);
    }
  };

  // ✅ CORREGIDO: Usar api en lugar de fetch
  const actualizarEstado = async (ticketId, nuevoEstadoId) => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${ticketId}`, { 
        estado_id: nuevoEstadoId 
      });
      
      alert('✅ Estado actualizado correctamente');
      await cargarTickets();
      
      // Actualizar ticket seleccionado
      if (selectedTicket?.id === ticketId) {
        const ticketActualizado = tickets.find(t => t.id === ticketId);
        setSelectedTicket(ticketActualizado);
      }
    } catch (error) {
      console.error('Error:', error);
      const mensaje = error.response?.data?.message || 'Error al actualizar estado';
      alert(`❌ ${mensaje}`);
    } finally {
      setUpdating(false);
    }
  };

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
    switch (prioridadLower) {
      case 'crítica':
      case 'critica':
        return 'text-red-600 bg-red-100';
      case 'alta':
        return 'text-orange-600 bg-orange-100';
      case 'media':
        return 'text-yellow-600 bg-yellow-100';
      case 'baja':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (estado) => {
    const estadoLower = estado?.toLowerCase() || '';
    switch (estadoLower) {
      case 'abierto':
      case 'pendiente':
        return 'text-blue-600 bg-blue-100';
      case 'en proceso':
      case 'en_progreso':
        return 'text-purple-600 bg-purple-100';
      case 'en espera':
        return 'text-orange-600 bg-orange-100';
      case 'resuelto':
      case 'completado':
        return 'text-green-600 bg-green-100';
      case 'cerrado':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const estadosTicket = [
    { id: 1, nombre: 'Abierto' },
    { id: 2, nombre: 'En proceso' },
    { id: 3, nombre: 'En espera' },
    { id: 4, nombre: 'Resuelto' },
    { id: 5, nombre: 'Cerrado' }
  ];

  // Filtrar tickets según el rol
  const getFilteredTickets = () => {
    if (isAdmin) return tickets;
    if (isAgente) return tickets.filter(t => t.responsable_id === user?.id);
    return tickets.filter(t => t.usuario_id === user?.id);
  };

  const filteredTickets = getFilteredTickets();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {isAdmin ? '📋 Todos los Tickets' : '📥 Bandeja de entrada'}
      </h1>
      <p className="text-gray-500 mb-6">
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
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTicket?.id === ticket.id ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{ticket.titulo}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.prioridad_nombre)}`}>
                    {ticket.prioridad_nombre || 'Media'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{ticket.descripcion}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-400">{formatDate(ticket.fecha_creacion)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.estado_nombre)}`}>
                    {ticket.estado_nombre || 'Pendiente'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  👤 {ticket.usuario_nombre || 'Usuario'} 
                  {ticket.responsable_nombre && ` | 🎧 ${ticket.responsable_nombre}`}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detalle del ticket */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedTicket.titulo}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      #{selectedTicket.id?.toString().padStart(6, '0')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${getPriorityColor(selectedTicket.prioridad_nombre)}`}>
                      {selectedTicket.prioridad_nombre || 'Media'}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(selectedTicket.estado_nombre)}`}>
                      {selectedTicket.estado_nombre || 'Pendiente'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">📅 {formatDate(selectedTicket.fecha_creacion)}</p>
                <p className="text-sm text-gray-500 mt-1">👤 Creado por: {selectedTicket.usuario_nombre || 'N/A'}</p>
              </div>

              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-800 mb-3">📄 Descripción</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedTicket.descripcion}</p>
              </div>

              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-800 mb-3">ℹ️ Información</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Área</p>
                    <p className="text-sm font-medium">{selectedTicket.area_nombre || 'No asignada'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Categoría</p>
                    <p className="text-sm font-medium">{selectedTicket.categoria_nombre || 'No asignada'}</p>
                  </div>
                </div>
              </div>

              {/* Asignar Agente - Solo visible para Admin */}
              {isAdmin && (
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-3">🎧 Asignar Agente</h3>
                  <div className="flex gap-3">
                    <select
                      value={selectedTicket.responsable_id || ''}
                      onChange={(e) => asignarAgente(selectedTicket.id, e.target.value)}
                      disabled={updating}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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

              {/* Actualizar Estado - Visible para Admin y Agente */}
              {(isAdmin || isAgente) && (
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-3">🔄 Actualizar Estado</h3>
                  <div className="flex flex-wrap gap-2">
                    {estadosTicket.map((estado) => (
                      <button
                        key={estado.id}
                        onClick={() => actualizarEstado(selectedTicket.id, estado.id)}
                        disabled={updating}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedTicket.estado_id === estado.id
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

              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3">📜 Historial</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">No hay comentarios disponibles</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-b-lg border-t">
                <p className="text-xs text-gray-400">Sistema de Tickets - Versa Ticket</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">📧</div>
              <p>Selecciona un ticket para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;