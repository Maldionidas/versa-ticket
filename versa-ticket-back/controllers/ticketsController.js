const sql = require("../config/db");

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
    const { titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id, valores_dinamicos } = req.body;
    const archivos = req.files; 
    const usuario_id = req.user?.id; 

    if (!usuario_id) {
        return res.status(401).json({ message: "No autorizado. Token inválido o expirado." });
    }

    if (!titulo || !descripcion || !prioridad_id || !area_id) {
        return res.status(400).json({ message: "Campos obligatorios faltantes" });
    }

    try {
        const estado_id = 1; // Abierto

        const resultadoTransaccion = await sql.begin(async (sqlTransaccion) => {
            const ticketInsert = await sqlTransaccion`
                INSERT INTO tickets
                (titulo, descripcion, estado_id, prioridad_id, categoria_id, usuario_id, responsable_id, area_id)
                VALUES
                (${titulo}, ${descripcion}, ${estado_id}, ${prioridad_id}, ${categoria_id || null}, ${usuario_id}, ${responsable_id || null}, ${area_id})
                RETURNING *
            `;
            const nuevoTicket = ticketInsert[0];

            if (valores_dinamicos) {
                const valoresParseados = JSON.parse(valores_dinamicos);
                for (const campo_id of Object.keys(valoresParseados)) {
                    const valor = valoresParseados[campo_id];
                    if (valor !== "" && valor !== null && valor !== false) {
                        await sqlTransaccion`
                            INSERT INTO ticket_campos_valores
                            (ticket_id, campo_id, valor)
                            VALUES
                            (${nuevoTicket.id}, ${campo_id}, ${valor.toString()})
                        `;
                    }
                }
            }

            const evidenciasGuardadas = [];
            if (archivos && archivos.length > 0) {
                for (const file of archivos) {
                    const attachmentInsert = await sqlTransaccion`
                        INSERT INTO attachments
                        (ticket_id, nombre_archivo, ruta_archivo, tipo_archivo, tamaño, subido_por)
                        VALUES
                        (${nuevoTicket.id}, ${file.originalname}, ${file.path}, ${file.mimetype}, ${file.size || 0}, ${usuario_id})
                        RETURNING *
                    `;
                    evidenciasGuardadas.push(attachmentInsert[0]);
                }
            }

            return {
                ...nuevoTicket,
                evidencias: evidenciasGuardadas
            };
        });

        res.status(201).json({
            message: "Ticket creado exitosamente",
            ticket: resultadoTransaccion
        });

    } catch (error) {
        console.error("Error en la transacción de creación de ticket:", error);
        res.status(500).json({ message: "Error creando ticket", error: error.message });
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