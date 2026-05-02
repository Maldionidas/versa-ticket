const { sql } = require("../config/db");

const checkTicketNotClosed = async (req, res, next) => {
  try {
    const ticketId = req.params.id || req.params.ticketId || req.body.ticket_id;
    
    if (!ticketId) {
      return res.status(400).json({ 
        success: false, 
        message: "ID de ticket no proporcionado" 
      });
    }
    
    // CORRECCIÓN: Sintaxis nativa de Neon Serverless
    const ticket = await sql`
      SELECT estado_id FROM tickets WHERE id = ${ticketId}
    `;
    
    if (!ticket || ticket.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Ticket no encontrado" 
      });
    }
    
    if (ticket[0].estado_id === 4 || ticket[0].estado_id === 5) {
      return res.status(400).json({ 
        success: false, 
        message: "No se puede modificar un ticket cerrado" 
      });
    }
    
    next();
  } catch (error) {
    console.error("Error en checkTicketNotClosed:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error verificando estado del ticket" 
    });
  }
};

const checkTicketIsClosed = async (req, res, next) => {
  try {
    const ticketId = req.params.id || req.params.ticketId || req.body.ticket_id;
    
    if (!ticketId) {
      return res.status(400).json({ 
        success: false, 
        message: "ID de ticket no proporcionado" 
      });
    }
    
    // CORRECCIÓN: Sintaxis nativa de Neon Serverless
    const ticket = await sql`
      SELECT estado_id FROM tickets WHERE id = ${ticketId}
    `;
    
    if (!ticket || ticket.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Ticket no encontrado" 
      });
    }
    
    const isClosed = ticket[0].estado_id === 4 || ticket[0].estado_id === 5;
    
    if (!isClosed) {
      return res.status(400).json({ 
        success: false, 
        message: "El ticket debe estar cerrado para realizar esta acción" 
      });
    }
    
    next();
  } catch (error) {
    console.error("Error en checkTicketIsClosed:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error verificando estado del ticket" 
    });
  }
};

module.exports = {
  checkTicketNotClosed,
  checkTicketIsClosed
};