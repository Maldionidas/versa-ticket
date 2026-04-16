// controllers/statsController.js
const { sql } = require("../config/db");

// ==========================================
// ESTADISTICAS GENERALES (Tarjetas numericas)
// ==========================================
exports.getGeneralStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol_id;
    
    let stats;
    let totalUsers = 0;
    
    if (userRole === 2) {
      stats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_id = 1 THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado_id = 2 THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as completados
        FROM tickets
      `;
      
      const usersCount = await sql`SELECT COUNT(*) as total FROM users`;
      totalUsers = parseInt(usersCount[0]?.total || 0);
      
    } else if (userRole === 3) {
      stats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_id = 1 THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado_id = 2 THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as completados
        FROM tickets
        WHERE responsable_id = ${userId}
      `;
      
    } else {
      stats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_id = 1 THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado_id = 2 THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as completados
        FROM tickets
        WHERE usuario_id = ${userId}
      `;
    }
    
    res.json({
      success: true,
      data: {
        totalTickets: parseInt(stats[0]?.total || 0),
        pendingTickets: parseInt(stats[0]?.pendientes || 0),
        inProgressTickets: parseInt(stats[0]?.en_progreso || 0),
        completedTickets: parseInt(stats[0]?.completados || 0),
        totalUsers: userRole === 2 ? totalUsers : null
      }
    });
    
  } catch (error) {
    console.error('Error en stats:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error obteniendo estadisticas generales" 
    });
  }
};

// ==========================================
// DATOS PARA GRAFICOS DEL DASHBOARD
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol_id;
    
    let diaQuery;
    let prioridadQuery;
    
    if (userRole === 2) {
      diaQuery = await sql`
        SELECT 
          DATE(fecha_creacion) as fecha,
          COUNT(*) as total
        FROM tickets
        WHERE fecha_creacion >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(fecha_creacion)
        ORDER BY fecha DESC
      `;
      
      prioridadQuery = await sql`
        SELECT p.nombre, COUNT(t.id) as total
        FROM ticket_prioridades p
        LEFT JOIN tickets t ON t.prioridad_id = p.id
        GROUP BY p.id, p.nombre
        ORDER BY p.id
      `;
    } else if (userRole === 3) {
      diaQuery = await sql`
        SELECT 
          DATE(fecha_creacion) as fecha,
          COUNT(*) as total
        FROM tickets
        WHERE responsable_id = ${userId} AND fecha_creacion >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(fecha_creacion)
        ORDER BY fecha DESC
      `;
      
      prioridadQuery = await sql`
        SELECT p.nombre, COUNT(t.id) as total
        FROM ticket_prioridades p
        LEFT JOIN tickets t ON t.prioridad_id = p.id AND t.responsable_id = ${userId}
        GROUP BY p.id, p.nombre
        ORDER BY p.id
      `;
    } else {
      diaQuery = await sql`
        SELECT 
          DATE(fecha_creacion) as fecha,
          COUNT(*) as total
        FROM tickets
        WHERE usuario_id = ${userId} AND fecha_creacion >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(fecha_creacion)
        ORDER BY fecha DESC
      `;
      
      prioridadQuery = await sql`
        SELECT p.nombre, COUNT(t.id) as total
        FROM ticket_prioridades p
        LEFT JOIN tickets t ON t.prioridad_id = p.id AND t.usuario_id = ${userId}
        GROUP BY p.id, p.nombre
        ORDER BY p.id
      `;
    }
    
    const ticketsPorDia = diaQuery.map(item => ({
      fecha: item.fecha,
      total: parseInt(item.total)
    }));
    
    const prioridadesStats = prioridadQuery.map(item => ({
      nombre: item.nombre,
      total: parseInt(item.total)
    }));
    
    res.json({
      success: true,
      data: {
        ticketsPorDia,
        prioridadesStats
      }
    });
    
  } catch (error) {
    console.error('Error en dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error obteniendo estadisticas del dashboard" 
    });
  }
};