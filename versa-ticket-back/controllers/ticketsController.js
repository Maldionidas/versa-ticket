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

    const { titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id } = req.body;

    if (!titulo || !descripcion || !prioridad_id || !area_id) {
        return res.status(400).json({ message: "Campos obligatorios faltantes" });
    }

    try {

        const estado_id = 1;   // estado inicial
        const usuario_id = 1;  // temporal hasta tener login
        console.log(req.body);

        const result = await sql`
        INSERT INTO tickets
        (titulo, descripcion, estado_id, prioridad_id, categoria_id, usuario_id, responsable_id, area_id)
        VALUES
        (${titulo}, ${descripcion}, ${estado_id}, ${prioridad_id}, ${categoria_id}, ${usuario_id}, ${responsable_id}, ${area_id})
        RETURNING *`;

        res.status(201).json({
            message: "Ticket creado exitosamente",
            ticket: result[0]
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({
            message: "Error creando ticket",
            error: error.message
        });

    }
};