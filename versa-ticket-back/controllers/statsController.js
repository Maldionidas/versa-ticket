const { sql } = require("../config/db");

exports.getGeneralStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.rol_id;
        
        let stats;
        let commentsStats;
        let totalUsers = 0;
        
        if (userRole === 2 || userRole === "Administrador") {
            // ADMIN
            stats = await sql`
                SELECT 
                    COUNT(*)::int as total,
                    COUNT(CASE WHEN estado_id = 1 THEN 1 END)::int as pendientes,
                    COUNT(CASE WHEN estado_id = 2 THEN 1 END)::int as en_progreso,
                    COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END)::int as completados
                FROM tickets
            `;
            
            const usersCount = await sql`SELECT COUNT(*)::int as total FROM users`;
            totalUsers = usersCount[0]?.total || 0;
            
            commentsStats = await sql`
                SELECT COUNT(*)::int as total_comentarios
                FROM comments
            `;
            
        } else if (userRole === 3 || userRole === "Agente") {
            // AGENTE
            stats = await sql`
                SELECT 
                    COUNT(*)::int as total,
                    COUNT(CASE WHEN estado_id = 1 THEN 1 END)::int as pendientes,
                    COUNT(CASE WHEN estado_id = 2 THEN 1 END)::int as en_progreso,
                    COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END)::int as completados
                FROM tickets
                WHERE responsable_id = ${userId}
            `;
            
            commentsStats = await sql`
                SELECT COUNT(c.id)::int as total_comentarios
                FROM comments c
                JOIN tickets t ON c.ticket_id = t.id
                WHERE t.responsable_id = ${userId}
            `;
            
        } else {
            // USUARIO NORMAL
            stats = await sql`
                SELECT 
                    COUNT(*)::int as total,
                    COUNT(CASE WHEN estado_id = 1 THEN 1 END)::int as pendientes,
                    COUNT(CASE WHEN estado_id = 2 THEN 1 END)::int as en_progreso,
                    COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END)::int as completados
                FROM tickets
                WHERE usuario_id = ${userId}
            `;
            
            commentsStats = await sql`
                SELECT COUNT(c.id)::int as total_comentarios
                FROM comments c
                JOIN tickets t ON c.ticket_id = t.id
                WHERE t.usuario_id = ${userId}
            `;
        }

        const totalTickets = stats[0]?.total || 0;
        const totalComments = commentsStats[0]?.total_comentarios || 0;
        const avgCommentsPerTicket = totalTickets > 0 ? (totalComments / totalTickets).toFixed(2) : 0;
        
        res.json({
            success: true,
            data: {
                totalTickets,
                pendingTickets: stats[0]?.pendientes || 0,
                inProgressTickets: stats[0]?.en_progreso || 0,
                completedTickets: stats[0]?.completados || 0,
                totalUsers: userRole === 2 || userRole === "Administrador" ? totalUsers : null,
                totalComments,
                avgCommentsPerTicket: parseFloat(avgCommentsPerTicket)
            }
        });
        
    } catch (error) {
        console.error('Error en stats generales:', error);
        res.status(500).json({ success: false, message: "Error obteniendo estadísticas" });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.rol_id;
        
        let diaQuery;
        let prioridadQuery;
        
        // CUIDADO: La sintaxis de fecha (INTERVAL) varía un poco en Postgres si la metes directo
        // Lo mejor es dejar que la base de datos maneje el NOW() - INTERVAL '7 days'
        
        if (userRole === 2 || userRole === "Administrador") {
            diaQuery = await sql`
                SELECT DATE(fecha_creacion) as fecha, COUNT(*)::int as total
                FROM tickets
                WHERE fecha_creacion >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(fecha_creacion)
                ORDER BY fecha DESC
            `;
            
            prioridadQuery = await sql`
                SELECT p.nombre, COUNT(t.id)::int as total
                FROM ticket_prioridades p
                LEFT JOIN tickets t ON t.prioridad_id = p.id
                GROUP BY p.id, p.nombre
                ORDER BY p.id
            `;
            
        } else if (userRole === 3 || userRole === "Agente") {
            diaQuery = await sql`
                SELECT DATE(fecha_creacion) as fecha, COUNT(*)::int as total
                FROM tickets
                WHERE responsable_id = ${userId} AND fecha_creacion >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(fecha_creacion)
                ORDER BY fecha DESC
            `;
            
            prioridadQuery = await sql`
                SELECT p.nombre, COUNT(t.id)::int as total
                FROM ticket_prioridades p
                LEFT JOIN tickets t ON t.prioridad_id = p.id AND t.responsable_id = ${userId}
                GROUP BY p.id, p.nombre
                ORDER BY p.id
            `;
            
        } else {
            diaQuery = await sql`
                SELECT DATE(fecha_creacion) as fecha, COUNT(*)::int as total
                FROM tickets
                WHERE usuario_id = ${userId} AND fecha_creacion >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(fecha_creacion)
                ORDER BY fecha DESC
            `;
            
            prioridadQuery = await sql`
                SELECT p.nombre, COUNT(t.id)::int as total
                FROM ticket_prioridades p
                LEFT JOIN tickets t ON t.prioridad_id = p.id AND t.usuario_id = ${userId}
                GROUP BY p.id, p.nombre
                ORDER BY p.id
            `;
        }
        
        // Mapeo seguro en caso de nulos (las fechas de Postgres a veces vienen raras, usamos toString o substring si es necesario)
        const ticketsPorDia = diaQuery.map(item => ({
            fecha: item.fecha instanceof Date ? item.fecha.toISOString().split('T')[0] : item.fecha,
            total: item.total || 0
        }));
        
        const prioridadesStats = prioridadQuery.map(item => ({
            nombre: item.nombre,
            total: item.total || 0
        }));
        
        res.json({
            success: true,
            data: {
                ticketsPorDia,
                prioridadesStats,
                commentsPorDia: [], // Preparado para el futuro
                topTicketsComentados: [] // Preparado para el futuro
            }
        });
        
    } catch (error) {
        console.error('Error en dashboard stats:', error);
        res.status(500).json({ success: false, message: "Error obteniendo estadísticas del dashboard" });
    }
};