// controllers/ticketsController.js
const db = require("../config/db");

// Obtener tickets asignados al agente
const getAssignedTickets = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.rol_id;
    
    
    // Verificar que sea agente o admin
    if (userRole !== 2 && userRole !== 3) {
      return res.status(403).json({ message: "No tienes permiso para ver tickets asignados" });
    }
    
    // Consulta simple primero para probar
    let query;
    let params;
    
    if (userRole === 2) {
      // Admin ve todos los tickets con responsable asignado
      query = `
        SELECT t.*, 
               p.nombre as prioridad_nombre,
               c.nombre as categoria_nombre,
               a.nombre as area_nombre,
               e.nombre as estado_nombre,
               u.nombre as usuario_nombre
        FROM tickets t
        LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
        LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN ticket_estados e ON t.estado_id = e.id
        LEFT JOIN users u ON t.usuario_id = u.id
        WHERE t.responsable_id IS NOT NULL
        ORDER BY t.id DESC
      `;
      params = [];
    } else {
      // Agente ve solo sus tickets asignados
      query = `
        SELECT t.*, 
               p.nombre as prioridad_nombre,
               c.nombre as categoria_nombre,
               a.nombre as area_nombre,
               e.nombre as estado_nombre,
               u.nombre as usuario_nombre
        FROM tickets t
        LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
        LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN ticket_estados e ON t.estado_id = e.id
        LEFT JOIN users u ON t.usuario_id = u.id
        WHERE t.responsable_id = $1
        ORDER BY t.id DESC
      `;
      params = [userId];
    }
    
    const result = await db.query(query, params);
    console.log(`Tickets asignados encontrados: ${result.length}`);
    res.json(result);
  } catch (error) {
    console.error('Error detallado en getAssignedTickets:', error);
    res.status(500).json({ 
      message: "Error obteniendo tickets asignados",
      error: error.message 
    });
  }
};

// Obtener todos los tickets
const getTickets = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.rol_id;
    
    
    let query;
    let params;
    
    if (userRole === 2) {
      // Admin ve todos los tickets
      query = `
        SELECT t.*, 
               p.nombre as prioridad_nombre,
               c.nombre as categoria_nombre,
               a.nombre as area_nombre,
               e.nombre as estado_nombre,
               u.nombre as usuario_nombre,
               r.nombre as responsable_nombre
        FROM tickets t
        LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
        LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN ticket_estados e ON t.estado_id = e.id
        LEFT JOIN users u ON t.usuario_id = u.id
        LEFT JOIN users r ON t.responsable_id = r.id
        ORDER BY t.id DESC
      `;
      params = [];
    } else {
      // Usuario normal ve solo sus tickets
      query = `
        SELECT t.*, 
               p.nombre as prioridad_nombre,
               c.nombre as categoria_nombre,
               a.nombre as area_nombre,
               e.nombre as estado_nombre,
               u.nombre as usuario_nombre
        FROM tickets t
        LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
        LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN ticket_estados e ON t.estado_id = e.id
        LEFT JOIN users u ON t.usuario_id = u.id
        WHERE t.usuario_id = $1
        ORDER BY t.id DESC
      `;
      params = [userId];
    }
    
    const result = await db.query(query, params);
    res.json(result);
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    res.status(500).json({ message: "Error obteniendo tickets" });
  }
};

// Obtener ticket por ID
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que id sea número
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    const query = `
      SELECT t.*, 
             p.nombre as prioridad_nombre,
             c.nombre as categoria_nombre,
             a.nombre as area_nombre,
             e.nombre as estado_nombre,
             u.nombre as usuario_nombre
      FROM tickets t
      LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
      LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
      LEFT JOIN areas a ON t.area_id = a.id
      LEFT JOIN ticket_estados e ON t.estado_id = e.id
      LEFT JOIN users u ON t.usuario_id = u.id
      WHERE t.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo ticket" });
  }
};

// Crear ticket
const createTicket = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      prioridad_id,
      categoria_id,
      area_id,
      responsable_id,
      estado_id
    } = req.body;
    
    const usuario_id = req.user?.id;
    
    const result = await db.query(
      `INSERT INTO tickets (
        titulo, descripcion, prioridad_id, categoria_id, 
        area_id, responsable_id, estado_id, usuario_id, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
      RETURNING *`,
      [titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id || null, estado_id || 1, usuario_id]
    );
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creando ticket:', error);
    res.status(500).json({ message: "Error creando ticket" });
  }
};

// Actualizar ticket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id, estado_id } = req.body;
    
    const result = await db.query(
      `UPDATE tickets 
       SET titulo = COALESCE($1, titulo),
           descripcion = COALESCE($2, descripcion),
           prioridad_id = COALESCE($3, prioridad_id),
           categoria_id = COALESCE($4, categoria_id),
           area_id = COALESCE($5, area_id),
           responsable_id = COALESCE($6, responsable_id),
           estado_id = COALESCE($7, estado_id)
       WHERE id = $8
       RETURNING *`,
      [titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id, estado_id, id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando ticket" });
  }
};

// Eliminar ticket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query("DELETE FROM tickets WHERE id = $1 RETURNING id", [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    
    res.json({ message: "Ticket eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando ticket" });
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getAssignedTickets
};