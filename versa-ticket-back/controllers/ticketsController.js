const sql = require("../config/db");

exports.getTickets = async (req, res) => {
    try {
        const result = await sql`
        SELECT * FROM tickets
        ORDER BY fecha_creacion DESC`;

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo tickets", error: error.message });
    }
};

exports.createTicket = async (req, res) => {
    // 1. Extraemos los textos del req.body (incluyendo el JSON stringificado de valores_dinamicos)
    const { titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id, valores_dinamicos } = req.body;
    
    // 2. Extraemos los archivos de req.files (Multer y Cloudinary los inyectan aquí)
    const archivos = req.files; 

    if (!titulo || !descripcion || !prioridad_id || !area_id) {
        return res.status(400).json({ message: "Campos obligatorios faltantes" });
    }

    try {
        const estado_id = 1;   // estado inicial (Abierto)
        // NOTA: Cuando tu compañero acabe el login, cambiaremos esto por: const usuario_id = req.user.id;
        const usuario_id = 1;  

        // 🚀 INICIAMOS LA TRANSACCIÓN
        const resultadoTransaccion = await sql.begin(async (sqlTransaccion) => {

            // PASO 1: Insertar el Ticket Principal
            const ticketInsert = await sqlTransaccion`
                INSERT INTO tickets
                (titulo, descripcion, estado_id, prioridad_id, categoria_id, usuario_id, responsable_id, area_id)
                VALUES
                (${titulo}, ${descripcion}, ${estado_id}, ${prioridad_id}, ${categoria_id || null}, ${usuario_id}, ${responsable_id || null}, ${area_id})
                RETURNING *
            `;
            const nuevoTicket = ticketInsert[0];

            // PASO 2: Insertar Campos Dinámicos (Si el frontend los envió)
            if (valores_dinamicos) {
                // Como lo mandamos con JSON.stringify desde React, aquí lo volvemos a convertir a Objeto
                const valoresParseados = JSON.parse(valores_dinamicos);

                // Iteramos sobre las llaves del objeto (que son los IDs de los campos)
                for (const campo_id of Object.keys(valoresParseados)) {
                    const valor = valoresParseados[campo_id];

                    // Solo guardamos si el usuario realmente escribió algo o marcó el checkbox
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

            // PASO 3: Insertar Evidencias / Archivos (Si Multer atrapó archivos)
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

            // Retornamos todo el paquete armado
            return {
                ...nuevoTicket,
                evidencias: evidenciasGuardadas
            };
        });

        // Si todo salió bien, cerramos con éxito
        res.status(201).json({
            message: "Ticket creado exitosamente con toda su información",
            ticket: resultadoTransaccion
        });

    } catch (error) {
        console.error("Error en la transacción de creación de ticket:", error);
        res.status(500).json({
            message: "Error creando ticket",
            error: error.message
        });
    }
};