const sql = require("../config/db");

exports.getUserAdmin = async (req, res) => {
    try {

        const result = await sql`
            SELECT 
                u.id,
                u.nombre,
                u.apellido,
                u.email,
                r.nombre AS rol,
                a.nombre AS area,
                u.activo,
                u.fecha_registro

            FROM users u
            LEFT JOIN roles r ON u.rol_id = r.id
            LEFT JOIN areas a ON u.area_id = a.id
            ORDER BY u.id
        `;

        res.json(result)

    } catch (error) {
        console.error("Error obteniendo usuarios:", error)
        res.status(500).json({ message: "Error obteniendo usuarios" })
    }
}
exports.updateUser = async (req, res) => {
    const { id } = req.params
    const { nombre, apellido, rol_id, area_id } = req.body

    try {

        const result = await sql`
            UPDATE users
            SET nombre = ${nombre},
                apellido = ${apellido},
                rol_id = ${rol_id},
                area_id = ${area_id}
            WHERE id = ${id}
            RETURNING *
        `

        res.json(result[0])

    } catch (error) {
        console.error("ERROR UPDATE:", error)
        res.status(500).json({ message: "Error actualizando usuario" })
    }
}