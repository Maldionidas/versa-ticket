const express = require('express');
const router = express.Router();
const sql = require('../config/db');

router.get('/stats', async (req, res) => {
    try {
        const { period = '24h' } = req.query;
        
        let intervalHours = 24;
        if (period === '7d') intervalHours = 168;
        if (period === '30d') intervalHours = 720;
        
        const generalStats = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN prioridad_id = 1 THEN 1 END) as critical,
                COUNT(CASE WHEN estado_id IN (1, 2, 3) THEN 1 END) as open,
                COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END) as rejected
            FROM tickets
            WHERE fecha_creacion >= NOW() - (INTERVAL '1 hour' * ${intervalHours})
        `;
        
        const statsRow = generalStats[0] || {};
        
        res.json({
            stats: {
                total: parseInt(statsRow.total) || 0,
                critical: parseInt(statsRow.critical) || 0,
                open: parseInt(statsRow.open) || 0,
                rejected: parseInt(statsRow.rejected) || 0,
                myTickets: 0,
                myTasks: 0
            },
            metrics: {
                responseTime: 85,
                resolutionRate: 72,
                satisfaction: 91
            },
            unresolvedCritical: []
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;