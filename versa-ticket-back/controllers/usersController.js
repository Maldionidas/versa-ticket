const sql = require("../config/db");

exports.getUserAdmin = async (req, res) => {
    try {

        const result = await sql`
            SELECT 
                u.id,
                u.nombre,
                u.apellido,
                u.email,
                u.rol_id,
                u.area_id,
                r.nombre AS rol,
                r.permisos,
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
exports.deleteUser = async (req, res) => {
    const { id } = req.params

    try {
        await sql`DELETE FROM users WHERE id = ${id}`

        res.json({ message: "Usuario eliminado" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error eliminando usuario" })
    }
}
exports.createUser = async (req, res) => {
  const { nombre, apellido, email, password, rol_id, area_id } = req.body

  try {
    const result = await sql`
      INSERT INTO users (nombre, apellido, email, password_hash, rol_id, area_id)
      VALUES (${nombre}, ${apellido}, ${email}, ${password}, ${rol_id}, ${area_id})
      RETURNING *
    `

    res.json(result[0])
  } catch (error) {
    res.status(500).json({ message: "Error creando usuario" })
  }
}