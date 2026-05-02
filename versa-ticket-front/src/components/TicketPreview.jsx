// src/components/TicketsList.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // ✅ Importar la instancia
import TicketPreview from './TicketPreview';

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar tickets
  useEffect(() => {
    const cargarTickets = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tickets');
        setTickets(response.data);
        setError(null);
      } catch (err) {
        console.error('Error cargando tickets:', err);
        setError('No se pudieron cargar los tickets');
        
        // Si es 401, redirigir a login
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    cargarTickets();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando tickets...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex h-full">
      {/* Lista de tickets */}
      <div className="w-1/3 border-r overflow-y-auto">
        {tickets.map(ticket => (
          <div
            key={ticket.id}
            onClick={() => setSelectedTicket(ticket)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
              selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
            }`}
          >
            <h3 className="font-medium">{ticket.titulo}</h3>
            <p className="text-sm text-gray-500 truncate">{ticket.descripcion}</p>
          </div>
        ))}
      </div>
      
      {/* Vista previa */}
      <TicketPreview ticket={selectedTicket} />
    </div>
  );
};

export default TicketsList;