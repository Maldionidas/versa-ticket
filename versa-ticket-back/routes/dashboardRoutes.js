// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middlewares/auth");

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol_id;
    
    let totalTickets = 0;
    let openTickets = 0;
    let inProgress = 0;
    let resolved = 0;
    
    if (userRole === 2) {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_id = 1 THEN 1 END) as abiertos,
          COUNT(CASE WHEN estado_id = 2 THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as resueltos
        FROM tickets
      `);
      
      totalTickets = parseInt(stats[0]?.total || 0);
      openTickets = parseInt(stats[0]?.abiertos || 0);
      inProgress = parseInt(stats[0]?.en_progreso || 0);
      resolved = parseInt(stats[0]?.resueltos || 0);
    } else if (userRole === 3) {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_id = 1 THEN 1 END) as abiertos,
          COUNT(CASE WHEN estado_id = 2 THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as resueltos
        FROM tickets
        WHERE responsable_id = $1
      `, [userId]);
      
      totalTickets = parseInt(stats[0]?.total || 0);
      openTickets = parseInt(stats[0]?.abiertos || 0);
      inProgress = parseInt(stats[0]?.en_progreso || 0);
      resolved = parseInt(stats[0]?.resueltos || 0);
    } else {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_id = 1 THEN 1 END) as abiertos,
          COUNT(CASE WHEN estado_id = 2 THEN 1 END) as en_progreso,
          COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as resueltos
        FROM tickets
        WHERE usuario_id = $1
      `, [userId]);
      
      totalTickets = parseInt(stats[0]?.total || 0);
      openTickets = parseInt(stats[0]?.abiertos || 0);
      inProgress = parseInt(stats[0]?.en_progreso || 0);
      resolved = parseInt(stats[0]?.resueltos || 0);
    }
    
    res.json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgress,
        resolved
      }
    });
    
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error obteniendo estadísticas" 
    });
  }
});

module.exports = router;