// controllers/statusController.js
const { db }  = require("../config/db");

const getAllStatuses = async (req, res) => {
  try {
    //  CAMBIADO: estados_tickets → ticket_estados
    const estados = await sql.query(
      "SELECT id, nombre, descripcion FROM ticket_estados WHERE activo = true ORDER BY id"
    );
    
    res.json({
      success: true,
      data: estados
    });
  } catch (error) {
    console.error("Error obteniendo estados:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error obteniendo lista de estados" 
    });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_id } = req.body;
    const userId = req.user.id;
    const userRole = req.user.rol_id;
    
    const ticket = await sql.query(
      "SELECT * FROM tickets WHERE id = $1",
      [id]
    );
    
    if (!ticket || ticket.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Ticket no encontrado" 
      });
    }
    
    const hasAccess = userRole === 2 || ticket[0].responsable_id === userId;
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: "No tienes permiso para cambiar el estado de este ticket" 
      });
    }
    
    // CAMBIADO: Verificar que el estado existe en ticket_estados
    const estado = await sql.query(
      "SELECT id FROM ticket_estados WHERE id = $1 AND activo = true",
      [estado_id]
    );
    
    if (!estado || estado.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Estado no válido" 
      });
    }
    
    await sql.query(
      "UPDATE tickets SET estado_id = $1, updated_at = NOW() WHERE id = $2",
      [estado_id, id]
    );
    
    res.json({
      success: true,
      message: "Estado actualizado correctamente"
    });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error actualizando el estado del ticket" 
    });
  }
};

module.exports = {
  getAllStatuses,
  updateTicketStatus
};