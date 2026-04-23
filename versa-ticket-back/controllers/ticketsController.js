const {sql, pool} = require("../config/db");
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. OBTENER TODOS LOS TICKETS (Con filtros por rol)
// ==========================================
exports.getTickets = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.rol_id;

        let result;
        if (userRole === 2 || userRole === "Administrador") {
            result = await sql`
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
        } else {
            // Si es un Usuario Normal, SOLO ve los suyos
            result = await sql`
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
        WHERE t.usuario_id = ${userId}
        ORDER BY t.id DESC
      `;
        }

        res.json(result);
    } catch (error) {
        console.error('Error obteniendo tickets:', error);
        res.status(500).json({ message: "Error obteniendo tickets" });
    }
};

// ==========================================
// 2. OBTENER TICKETS ASIGNADOS AL AGENTE
// ==========================================
exports.getAssignedTickets = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.rol_id;

        let result;

        // 🔥 CORREGIDO: ID 2 es el Administrador
        if (userRole === 2 || userRole === "Administrador") {
            // Admin ve todos los tickets con alguien asignado
            result = await sql`
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
        } else {
            // Agente ve solo los tickets que le asignaron a él
            result = await sql`
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
        WHERE t.responsable_id = ${userId}
        ORDER BY t.id DESC
      `;
        }

        res.json(result);
    } catch (error) {
        console.error('Error en getAssignedTickets:', error);
        res.status(500).json({ message: "Error obteniendo tickets asignados", error: error.message });
    }
};

// ==========================================
// 3. OBTENER TICKET POR ID
// ==========================================
exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const result = await sql`
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
      WHERE t.id = ${id}
    `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Ticket no encontrado" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo ticket" });
    }
};

// ==========================================
// 4. CREAR TICKET 
// ==========================================
exports.createTicket = async (req, res) => {
    let { titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id, valores_dinamicos } = req.body;
    const archivos = req.files; 
    const usuario_id = req.user?.id; 

    if (!usuario_id) {
        return res.status(401).json({ message: "No autorizado." });
    }

    if (!titulo || !descripcion || !prioridad_id || !area_id) {
        return res.status(400).json({ message: "Campos obligatorios faltantes" });
    }

    const cat_id = categoria_id && categoria_id !== "null" && categoria_id !== "" ? categoria_id : null;
    const resp_id = responsable_id && responsable_id !== "null" && responsable_id !== "" ? responsable_id : null;
    const estado_id = 1; 

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Obtenemos el tiempo SLA directo de tu tabla dinámica
        const prioridadResult = await client.query(
            `SELECT tiempo_sla FROM ticket_prioridades WHERE id = $1`, 
            [prioridad_id]
        );
        const horasSLA = prioridadResult.rows[0]?.tiempo_sla || 24; // 24h por defecto por si acaso
        
        // Calculamos la fecha
        const slaFechaLimite = new Date();
        slaFechaLimite.setHours(slaFechaLimite.getHours() + horasSLA);

        // 2. Insertar Ticket (¡Sin Folio! El Trigger de Postgres lo hará)
        const ticketQuery = `
            INSERT INTO tickets 
            (titulo, descripcion, estado_id, prioridad_id, categoria_id, usuario_id, responsable_id, area_id, sla_fecha_limite) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING id, folio; -- Atrapamos lo que generó la BD
        `;
        const ticketResult = await client.query(ticketQuery, [
            titulo, 
            descripcion, 
            estado_id, 
            prioridad_id, 
            cat_id, 
            usuario_id, 
            resp_id, 
            area_id,
            slaFechaLimite.toISOString() 
        ]);
        
        const nuevoTicketId = ticketResult.rows[0].id;
        const folioGenerado = ticketResult.rows[0].folio;

        // 3. Insertar Campos Dinámicos
        if (valores_dinamicos) {
            let valoresParseados = typeof valores_dinamicos === 'string' ? JSON.parse(valores_dinamicos) : valores_dinamicos;

            for (const campo_id of Object.keys(valoresParseados)) {
                const valor = valoresParseados[campo_id];
                if (valor !== "" && valor !== null && valor !== false) {
                    await client.query(
                        `INSERT INTO ticket_campos_valores (ticket_id, campo_id, valor) VALUES ($1, $2, $3)`, 
                        [nuevoTicketId, campo_id, valor.toString()]
                    );
                }
            }
        }

        // 4. Insertar Evidencias
        if (archivos && archivos.length > 0) {
            for (const file of archivos) {
                const rutaWeb = `/uploads/${file.filename}`;
                await client.query(
                    `INSERT INTO attachments (ticket_id, nombre_archivo, ruta_archivo, tipo_archivo, tamaño, subido_por) VALUES ($1, $2, $3, $4, $5, $6)`, 
                    [nuevoTicketId, file.originalname, rutaWeb, file.mimetype, file.size || 0, usuario_id]
                );
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: "Ticket creado exitosamente",
            ticketId: nuevoTicketId,
            folio: folioGenerado // Se lo mandamos al Frontend
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en la transacción de creación de ticket:", error);
        res.status(500).json({ message: "Error creando ticket", error: error.message });
    } finally {
        client.release();
    }
};

// ==========================================
// 5. ACTUALIZAR TICKET
// ==========================================
exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id, estado_id } = req.body;

        const result = await sql`
       UPDATE tickets 
       SET titulo = COALESCE(${titulo || null}, titulo),
           descripcion = COALESCE(${descripcion || null}, descripcion),
           prioridad_id = COALESCE(${prioridad_id || null}, prioridad_id),
           categoria_id = COALESCE(${categoria_id || null}, categoria_id),
           area_id = COALESCE(${area_id || null}, area_id),
           responsable_id = COALESCE(${responsable_id || null}, responsable_id),
           estado_id = COALESCE(${estado_id || null}, estado_id)
       WHERE id = ${id}
       RETURNING *
    `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Ticket no encontrado" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualizando ticket" });
    }
};

// ==========================================
// 6. ELIMINAR TICKET
// ==========================================
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql`DELETE FROM tickets WHERE id = ${id} RETURNING id`;

        if (result.length === 0) {
            return res.status(404).json({ message: "Ticket no encontrado" });
        }

        res.json({ message: "Ticket eliminado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminando ticket" });
    }
};

// ==========================================
// 7. Firmar ticket (agentes y admin pueden hacerlo)
// ==========================================
exports.closeTicketSign = async (req, res) => {
    try {
        const { id } = req.params;
        const { firma_base64 } = req.body;

        if (!firma_base64) {
            return res.status(400).json({ message: "La firma es obligatoria para cerrar el ticket." });
        }

        // 1. Limpiamos el string de Base64
        const base64Data = firma_base64.replace(/^data:image\/png;base64,/, "");
        
        // 2. Creamos un nombre único
        const fileName = `firma_tkt_${id}_${Date.now()}.png`;
        
        // 3. Definimos el directorio de destino
        const uploadDir = path.join(__dirname, '../uploads');

        // Si la carpeta 'uploads' no existe, la creamos automáticamente
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 4. Guardamos el archivo físicamente
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, base64Data, 'base64');

        // 5. La ruta web que va a la base de datos
        const rutaWeb = `/uploads/${fileName}`;

        // 6. Actualizamos el estado y guardamos la ruta
        const result = await sql`
            UPDATE tickets 
            SET estado_id = 5, 
                firma_representante = ${rutaWeb},
                fecha_cierre = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
        `;

        res.json({
            message: "Ticket cerrado y firmado exitosamente",
            ticket: result[0]
        });

    } catch (error) {
        // AQUÍ ES DONDE IMPRIME EL ERROR REAL
        console.error("Error CRÍTICO al guardar la firma:", error);
        res.status(500).json({ message: "Error interno al procesar la firma" });
    }
};