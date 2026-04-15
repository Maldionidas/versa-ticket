// src/pages/AssignedTickets.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AssignedTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    cargarTicketsAsignados();
  }, []);

  const cargarTicketsAsignados = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/tickets/assigned', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (ticketId, nuevoEstadoId) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado_id: nuevoEstadoId })
      });

      if (response.ok) {
        alert('✅ Estado actualizado correctamente');
        cargarTicketsAsignados();
        setSelectedTicket(null);
      } else {
        alert('❌ Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
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
    switch (prioridad?.toLowerCase()) {
      case 'crítica': return 'text-red-600 bg-red-100';
      case 'alta': return 'text-orange-600 bg-orange-100';
      case 'media': return 'text-yellow-600 bg-yellow-100';
      case 'baja': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'abierto': return 'text-blue-600 bg-blue-100';
      case 'en proceso': return 'text-purple-600 bg-purple-100';
      case 'en espera': return 'text-orange-600 bg-orange-100';
      case 'resuelto': return 'text-green-600 bg-green-100';
      case 'cerrado': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const estadosTicket = [
    { id: 1, nombre: 'Abierto' },
    { id: 2, nombre: 'En proceso' },
    { id: 3, nombre: 'En espera' },
    { id: 4, nombre: 'Resuelto' },
    { id: 5, nombre: 'Cerrado' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando tickets asignados...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">🎧 Tickets Asignados</h1>
      <p className="text-gray-500 mb-6">Tickets que te han sido asignados para resolver</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de tickets */}
        <div className="lg:col-span-1 space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No tienes tickets asignados
            </div>
          ) : (
            tickets.map((ticket) => (
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
                  <span className="text-xs text-gray-400">
                    {formatDate(ticket.fecha_creacion)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.estado_nombre)}`}>
                    {ticket.estado_nombre || 'Pendiente'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  👤 Usuario: {ticket.usuario_nombre || 'N/A'}
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
                <p className="text-gray-600">{selectedTicket.descripcion}</p>
              </div>

              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-800 mb-3">📌 Información</h3>
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

              {/* Actualizar estado */}
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

              {/* Agregar comentario */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-3">💬 Agregar Comentario</h3>
                <textarea
                  placeholder="Escribe un comentario..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows="3"
                />
                <button className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
                  Enviar Comentario
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-b-lg border-t">
                <p className="text-xs text-gray-400">Sistema de Tickets - Versa Ticket</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>Selecciona un ticket para ver los detalles y actualizar su estado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedTickets;