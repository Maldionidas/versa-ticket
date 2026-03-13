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

    const { titulo, descripcion, estado_id, prioridad_id, usuario_id, area_id } = req.body;

    try {

        const result = await sql`
        INSERT INTO tickets
        (titulo, descripcion, estado_id, prioridad_id, usuario_id, area_id)
        VALUES
        (${titulo}, ${descripcion}, ${estado_id}, ${prioridad_id}, ${usuario_id}, ${area_id})
        RETURNING *`;

        res.status(201).json(result[0]);

    } catch (error) {

        console.error(error);
        res.status(500).send("Error creando ticket");

    }

};