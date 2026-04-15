const express = require('express');
const router = express.Router();
const sql = require('../config/db');

// Importamos el middleware de seguridad unificado
const { verifyToken } = require('../middlewares/auth');

// Protegemos la ruta inyectando verifyToken
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const { period = '24h' } = req.query;
        // Obtenemos el ID del usuario gracias a verifyToken
        const userId = req.user.id; 
        
        let intervalHours = 24;
        if (period === '7d') intervalHours = 168;
        if (period === '30d') intervalHours = 720;
        
        // 1. Estadisticas Generales (Para toda la empresa)
        const generalStats = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN prioridad_id = 1 THEN 1 END) as critical,
                COUNT(CASE WHEN estado_id IN (1, 2, 3) THEN 1 END) as open,
                COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as rejected
            FROM tickets
            WHERE fecha_creacion >= NOW() - (INTERVAL '1 hour' * ${intervalHours})
        `;
        
        // 2. Estadisticas Personales (Para el usuario que inicio sesion)
        const personalStats = await sql`
            SELECT 
                COUNT(CASE WHEN usuario_id = ${userId} THEN 1 END) as mis_tickets,
                COUNT(CASE WHEN responsable_id = ${userId} THEN 1 END) as mis_tareas
            FROM tickets
            WHERE fecha_creacion >= NOW() - (INTERVAL '1 hour' * ${intervalHours})
        `;
        
        const statsRow = generalStats[0] || {};
        const personalRow = personalStats[0] || {};
        
        res.json({
            stats: {
                total: parseInt(statsRow.total) || 0,
                critical: parseInt(statsRow.critical) || 0,
                open: parseInt(statsRow.open) || 0,
                rejected: parseInt(statsRow.rejected) || 0,
                myTickets: parseInt(personalRow.mis_tickets) || 0,
                myTasks: parseInt(personalRow.mis_tareas) || 0
            },
            // Estas metricas siguen hardcodeadas, despues podemos calcularlas de verdad
            metrics: {
                responseTime: 85,
                resolutionRate: 72,
                satisfaction: 91
            },
            unresolvedCritical: []
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener estadisticas' });
    }
});

module.exports = router;