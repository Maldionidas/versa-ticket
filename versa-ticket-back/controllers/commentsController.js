// controllers/commentsController.js
const { sql } = require("../config/db");

const getCommentsByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.rol_id;
    
    const ticket = await sql.query(
      "SELECT usuario_id, responsable_id FROM tickets WHERE id = $1",
      [ticketId]
    );
    
    if (!ticket || ticket.length === 0) {
      return res.status(404).json({ success: false, message: "Ticket no encontrado" });
    }
    
    const hasAccess = userRole === 2 || 
                      ticket[0].usuario_id === userId || 
                      ticket[0].responsable_id === userId;
    
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este ticket" });
    }
    
    const comments = await sql.query(`
      SELECT c.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM comments c
      JOIN users u ON c.usuario_id = u.id
      WHERE c.ticket_id = $1
      ORDER BY c.fecha ASC
    `, [ticketId]);
    
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: "Error obteniendo comentarios" });
  }
};

const createComment = async (req, res) => {
  try {
    const { ticket_id, contenido } = req.body;
    const userId = req.user.id;
    
    if (!ticket_id || !contenido) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos" });
    }

    const ticket = await sql.query("SELECT estado_id FROM tickets WHERE id = $1", [ticket_id]);

    if (!ticket || ticket.length === 0) {
      return res.status(404).json({ success: false, message: "Ticket no encontrado" });
    }

    const ESTADOS_CERRADOS = [3, 4, 5]; 
    if (ESTADOS_CERRADOS.includes(Number(ticket[0].estado_id))) {
      return res.status(403).json({ success: false, message: "El ticket está cerrado." });
    }
    
    const result = await sql.query(
      `INSERT INTO comments (ticket_id, usuario_id, contenido, fecha) 
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [ticket_id, userId, contenido]
    );
    
    res.json({ success: true, message: "Comentario agregado", data: result[0] });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: "Error creando comentario" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.rol_id;
    
    const comment = await sql.query(`
      SELECT c.usuario_id, t.estado_id 
      FROM comments c
      JOIN tickets t ON c.ticket_id = t.id
      WHERE c.id = $1
    `, [id]);
    
    if (!comment || comment.length === 0) {
      return res.status(404).json({ success: false, message: "Comentario no encontrado" });
    }

    const ESTADOS_CERRADOS = [3, 4, 5];
    if (ESTADOS_CERRADOS.includes(Number(comment[0].estado_id))) {
      return res.status(403).json({ success: false, message: "El ticket está cerrado." });
    }
    
    const hasAccess = Number(userRole) === 2 || Number(comment[0].usuario_id) === Number(userId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }
    
    await db.query("DELETE FROM comments WHERE id = $1", [id]);
    
    res.json({ success: true, message: "Comentario eliminado" });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: "Error eliminando comentario" });
  }
};

module.exports = { getCommentsByTicket, createComment, deleteComment };