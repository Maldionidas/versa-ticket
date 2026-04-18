// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middlewares/auth");

router.use(verifyToken);

// GET /api/stats - Estadísticas generales
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol_id;
    
    let totalTickets = 0;
    let pendingTickets = 0;
    let inProgressTickets = 0;
    let completedTickets = 0;
    let totalUsers = 0;
    let totalComments = 0;
    let avgCommentsPerTicket = 0;
    
    // Según el rol del usuario
    if (userRole === 2) {
      // ADMIN: Ve todos los tickets
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_id = 1 THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado_id = 2 THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as completados
        FROM tickets
      `);
      
      totalTickets = parseInt(stats[0]?.total || 0);
      pendingTickets = parseInt(stats[0]?.pendientes || 0);
      inProgressTickets = parseInt(stats[0]?.en_progreso || 0);
      completedTickets = parseInt(stats[0]?.completados || 0);
      
      const usersCount = await db.query(`SELECT COUNT(*) as total FROM users`);
      totalUsers = parseInt(usersCount[0]?.total || 0);
      
      // Estadísticas de comentarios
      const commentsStats = await db.query(`
        SELECT 
          COUNT(*) as total_comentarios,
          COUNT(DISTINCT ticket_id) as tickets_con_comentarios
        FROM comments
      `);
      
      totalComments = parseInt(commentsStats[0]?.total_comentarios || 0);
      avgCommentsPerTicket = totalTickets > 0 ? (totalComments / totalTickets).toFixed(2) : 0;
      
    } else if (userRole === 3) {
      // AGENTE: Ve los tickets que le han asignado
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_id = 1 THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado_id = 2 THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as completados
        FROM tickets
        WHERE responsable_id = $1
      `, [userId]);
      
      totalTickets = parseInt(stats[0]?.total || 0);
      pendingTickets = parseInt(stats[0]?.pendientes || 0);
      inProgressTickets = parseInt(stats[0]?.en_progreso || 0);
      completedTickets = parseInt(stats[0]?.completados || 0);
      
      // Comentarios en tickets asignados
      const commentsStats = await db.query(`
        SELECT COUNT(*) as total_comentarios
        FROM comments c
        JOIN tickets t ON c.ticket_id = t.id
        WHERE t.responsable_id = $1
      `, [userId]);
      
      totalComments = parseInt(commentsStats[0]?.total_comentarios || 0);
      avgCommentsPerTicket = totalTickets > 0 ? (totalComments / totalTickets).toFixed(2) : 0;
      
    } else {
      // USUARIO NORMAL: Ve solo sus tickets creados
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_id = 1 THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado_id = 2 THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as completados
        FROM tickets
        WHERE usuario_id = $1
      `, [userId]);
      
      totalTickets = parseInt(stats[0]?.total || 0);
      pendingTickets = parseInt(stats[0]?.pendientes || 0);
      inProgressTickets = parseInt(stats[0]?.en_progreso || 0);
      completedTickets = parseInt(stats[0]?.completados || 0);
      
      // Comentarios en sus tickets
      const commentsStats = await db.query(`
        SELECT COUNT(*) as total_comentarios
        FROM comments c
        JOIN tickets t ON c.ticket_id = t.id
        WHERE t.usuario_id = $1
      `, [userId]);
      
      totalComments = parseInt(commentsStats[0]?.total_comentarios || 0);
      avgCommentsPerTicket = totalTickets > 0 ? (totalComments / totalTickets).toFixed(2) : 0;
    }
    
    res.json({
      success: true,
      data: {
        totalTickets,
        pendingTickets,
        inProgressTickets,
        completedTickets,
        totalUsers: userRole === 2 ? totalUsers : null,
        totalComments,
        avgCommentsPerTicket: parseFloat(avgCommentsPerTicket)
      }
    });
    
  } catch (error) {
    console.error('Error en stats:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error obteniendo estadísticas" 
    });
  }
});

// GET /api/stats/dashboard - Datos para gráficos
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol_id;
    
    let ticketsPorDia = [];
    let prioridadesStats = [];
    let commentsPorDia = [];
    let topTicketsComentados = [];
    
    // Tickets por día según el rol
    let diaQuery;
    if (userRole === 2) {
      diaQuery = await db.query(`
        SELECT 
          DATE(fecha_creacion) as fecha,
          COUNT(*) as total
        FROM tickets
        WHERE fecha_creacion >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(fecha_creacion)
        ORDER BY fecha DESC
      `);
    } else if (userRole === 3) {
      diaQuery = await db.query(`
        SELECT 
          DATE(fecha_creacion) as fecha,
          COUNT(*) as total
        FROM tickets
        WHERE responsable_id = $1 AND fecha_creacion >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(fecha_creacion)
        ORDER BY fecha DESC
      `, [userId]);
    } else {
      diaQuery = await db.query(`
        SELECT 
          DATE(fecha_creacion) as fecha,
          COUNT(*) as total
        FROM tickets
        WHERE usuario_id = $1 AND fecha_creacion >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(fecha_creacion)
        ORDER BY fecha DESC
      `, [userId]);
    }
    
    ticketsPorDia = diaQuery.map(item => ({
      fecha: item.fecha,
      total: parseInt(item.total)
    }));
    
    // Estadísticas por prioridad según el rol
    let prioridadQuery;
    if (userRole === 2) {
      prioridadQuery = await db.query(`
        SELECT p.nombre, COUNT(t.id) as total
        FROM ticket_prioridades p
        LEFT JOIN tickets t ON t.prioridad_id = p.id
        GROUP BY p.id, p.nombre
        ORDER BY p.id
      `);
    } else if (userRole === 3) {
      prioridadQuery = await db.query(`
        SELECT p.nombre, COUNT(t.id) as total
        FROM ticket_prioridades p
        LEFT JOIN tickets t ON t.prioridad_id = p.id AND t.responsable_id = $1
        GROUP BY p.id, p.nombre
        ORDER BY p.id
      `, [userId]);
    } else {
      prioridadQuery = await db.query(`
        SELECT p.nombre, COUNT(t.id) as total
        FROM ticket_prioridades p
        LEFT JOIN tickets t ON t.prioridad_id = p.id AND t.usuario_id = $1
        GROUP BY p.id, p.nombre
        ORDER BY p.id
      `, [userId]);
    }
    
    prioridadesStats = prioridadQuery.map(item => ({
      nombre: item.nombre,
      total: parseInt(item.total)
    }));
    
    res.json({
      success: true,
      data: {
        ticketsPorDia,
        prioridadesStats,
        commentsPorDia,
        topTicketsComentados
      }
    });
    
  } catch (error) {
    console.error('Error en dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error obteniendo estadísticas del dashboard" 
    });
  }
});

module.exports = router;