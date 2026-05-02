// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();

// 1. Importaciones correctas para Neon y tu Auth unificado
const { sql } = require("../config/db");
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.rol_id;
        const { period = '24h' } = req.query;
        
        let intervalHours = 24;
        if (period === '7d') intervalHours = 168;
        if (period === '30d') intervalHours = 720;
        
        let statsResult;

        // 2. Fusionamos la lógica de Roles con la lógica de Fechas (Sintaxis Neon)
        if (userRole === 2 || userRole === "Administrador") {
            // Admin ve TODOS los tickets
            statsResult = await sql`
                SELECT 
                    COUNT(*)::int as total,
                    COUNT(CASE WHEN estado_id = 1 THEN 1 END)::int as abiertos,
                    COUNT(CASE WHEN estado_id = 2 THEN 1 END)::int as en_progreso,
                    COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END)::int as resueltos
                FROM tickets
                WHERE fecha_creacion >= NOW() - (INTERVAL '1 hour' * ${intervalHours})
            `;
        } else if (userRole === 3 || userRole === "Agente") {
            // Agente ve solo lo que tiene asignado
            statsResult = await sql`
                SELECT 
                    COUNT(*)::int as total,
                    COUNT(CASE WHEN estado_id = 1 THEN 1 END)::int as abiertos,
                    COUNT(CASE WHEN estado_id = 2 THEN 1 END)::int as en_progreso,
                    COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END)::int as resueltos
                FROM tickets
                WHERE responsable_id = ${userId}
                AND fecha_creacion >= NOW() - (INTERVAL '1 hour' * ${intervalHours})
            `;
        } else {
            // Usuario Normal ve solo los suyos
            statsResult = await sql`
                SELECT 
                    COUNT(*)::int as total,
                    COUNT(CASE WHEN estado_id = 1 THEN 1 END)::int as abiertos,
                    COUNT(CASE WHEN estado_id = 2 THEN 1 END)::int as en_progreso,
                    COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END)::int as resueltos
                FROM tickets
                WHERE usuario_id = ${userId}
                AND fecha_creacion >= NOW() - (INTERVAL '1 hour' * ${intervalHours})
            `;
        }
        
        const row = statsResult[0] || {};
        
        // 3. Mandamos la respuesta doble para evitar que el frontend truene 
        // sin importar qué versión del dashboard ganó en el merge.
        res.json({
            success: true,
            stats: {
                total: row.total || 0,
                open: row.abiertos || 0,
                inProgress: row.en_progreso || 0,
                resolved: row.resueltos || 0,
                rejected: 0 // Por si el frontend lo pide
            },
            data: {
                totalTickets: row.total || 0,
                openTickets: row.abiertos || 0,
                inProgress: row.en_progreso || 0,
                resolved: row.resueltos || 0
            }
        });
        
    } catch (error) {
        console.error('Error en dashboard:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;