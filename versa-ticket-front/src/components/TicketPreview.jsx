// src/components/TicketPreview.jsx
import React from 'react';

export default function TicketPreview({ ticket }) {
  // Verificar si ticket es null
  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Ningún ticket seleccionado
          </h3>
          <p className="text-gray-500 text-sm">
            Selecciona un ticket de la lista para ver los detalles
          </p>
        </div>
      </div>
    );
  }

  // Mapear campos según la estructura de tu backend
  const titulo = ticket.titulo || ticket.asunto || ticket.subject || 'Sin título';
  const folio = ticket.folio || '';
  const descripcion = ticket.descripcion || ticket.contenido || ticket.content || 'No hay descripción disponible';
  const fecha = ticket.fecha_creacion || ticket.created_at;
  
  // Validar fecha
  const isValidDate = fecha && !isNaN(new Date(fecha).getTime());
  const fechaFormateada = isValidDate 
    ? new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Fecha no disponible';
  
  // Mapear prioridad
  const getPriorityInfo = (prioridadId, prioridadNombre) => {
    // Si viene con ID
    if (prioridadId) {
      const priorityMap = {
        1: { text: 'Baja', color: 'bg-green-100 text-green-700', icon: '🟢' },
        2: { text: 'Media', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
        3: { text: 'Alta', color: 'bg-red-100 text-red-700', icon: '🔴' }
      };
      return priorityMap[prioridadId] || { text: 'Normal', color: 'bg-gray-100 text-gray-700', icon: '⚪' };
    }
    // Si viene con texto
    const priorityText = (prioridadNombre || '').toLowerCase();
    if (priorityText.includes('alta') || priorityText === 'high') {
      return { text: 'Alta', color: 'bg-red-100 text-red-700', icon: '🔴' };
    }
    if (priorityText.includes('media') || priorityText === 'medium') {
      return { text: 'Media', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' };
    }
    if (priorityText.includes('baja') || priorityText === 'low') {
      return { text: 'Baja', color: 'bg-green-100 text-green-700', icon: '🟢' };
    }
    return { text: 'Normal', color: 'bg-gray-100 text-gray-700', icon: '⚪' };
  };
  
  // Mapear estado
  const getStatusInfo = (estadoId, estadoNombre) => {
    if (estadoId) {
      const statusMap = {
        1: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
        2: { text: 'En Progreso', color: 'bg-blue-100 text-blue-700', icon: '🔄' },
        3: { text: 'Completado', color: 'bg-green-100 text-green-700', icon: '✅' },
        4: { text: 'Cerrado', color: 'bg-gray-100 text-gray-700', icon: '🔒' }
      };
      return statusMap[estadoId] || { text: 'No definido', color: 'bg-gray-100 text-gray-700', icon: '❓' };
    }
    
    const statusText = (estadoNombre || '').toLowerCase();
    if (statusText.includes('completado') || statusText === 'completed') {
      return { text: 'Completado', color: 'bg-green-100 text-green-700', icon: '✅' };
    }
    if (statusText.includes('progreso') || statusText === 'in_progress') {
      return { text: 'En Progreso', color: 'bg-blue-100 text-blue-700', icon: '🔄' };
    }
    if (statusText.includes('pendiente') || statusText === 'pending') {
      return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' };
    }
    if (statusText.includes('cerrado') || statusText === 'closed') {
      return { text: 'Cerrado', color: 'bg-gray-100 text-gray-700', icon: '🔒' };
    }
    return { text: 'No definido', color: 'bg-gray-100 text-gray-700', icon: '❓' };
  };
  
  const prioridadInfo = getPriorityInfo(ticket.prioridad_id, ticket.prioridad_nombre);
  const estadoInfo = getStatusInfo(ticket.estado_id, ticket.estado_nombre);
  
  // Información adicional
  const categoria = ticket.categoria_nombre || ticket.categoria || '';
  const area = ticket.area_nombre || ticket.area || '';

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto">
      {/* Header con información del ticket */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="mb-4">
          {folio && (
            <div className="text-sm font-mono text-gray-500 mb-2">
              {folio}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{titulo}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Fecha:</span>
              <span>{fechaFormateada}</span>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full ${prioridadInfo.color}`}>
              <span>{prioridadInfo.icon}</span>
              <span>Prioridad: {prioridadInfo.text}</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full ${estadoInfo.color}`}>
              <span>{estadoInfo.icon}</span>
              <span>Estado: {estadoInfo.text}</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Contenido del ticket */}
      <div className="p-6">
        {/* Descripción */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
             Descripción
          </h3>
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {descripcion}
              </p>
            </div>
          </div>
        </div>
        
        {/* Información adicional */}
        {(categoria || area) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
               Información adicional
            </h3>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-2">
              {area && (
                <div className="flex">
                  <span className="font-medium text-gray-700 w-24">Área:</span>
                  <span className="text-gray-600">{area}</span>
                </div>
              )}
              {categoria && (
                <div className="flex">
                  <span className="font-medium text-gray-700 w-24">Categoría:</span>
                  <span className="text-gray-600">{categoria}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Historial o comentarios (opcional) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
             Historial
          </h3>
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <p className="text-gray-500 text-center py-4">
              No hay comentarios disponibles
            </p>
          </div>
        </div>
        
        {/* Firma o pie de página */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-400 text-center">
            <p>Sistema de Tickets - Versa Ticket</p>
            <p className="text-xs mt-1">Ticket creado el {fechaFormateada}</p>
          </div>
        </div>
      </div>
    </div>
  );
}