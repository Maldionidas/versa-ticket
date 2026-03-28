const sql = require("../config/db");

// =========================
// OBTENER TODAS (Admin)
// =========================
exports.getAllCategoriasAdmin = async (req, res) => {
    try {
        // Hacemos JOIN con areas para obtener el nombre del área y mostramos también las inactivas
        const categorias = await sql`
            SELECT c.id, c.nombre, c.descripcion, c.activo, c.area_id, a.nombre as area_nombre
            FROM ticket_categorias c
            LEFT JOIN areas a ON c.area_id = a.id
            ORDER BY c.id DESC
        `;
        
        // Con postgres.js, el resultado es el arreglo directo
        res.json(categorias);
    } catch (error) {
        console.error("Error obteniendo categorías admin:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// =========================
// CREAR CATEGORÍA
// =========================
exports.createCategoria = async (req, res) => {
    const { nombre, descripcion, area_id, activo } = req.body;

    try {
        const result = await sql`
            INSERT INTO ticket_categorias (nombre, descripcion, area_id, activo)
            VALUES (${nombre}, ${descripcion}, ${area_id}, ${activo ?? true})
            RETURNING *
        `;

        res.status(201).json(result[0]);
    } catch (error) {
        // Manejo de error de índice único (misma área y mismo nombre)
        if (error.code === '23505') {
            return res.status(400).json({ message: "Ya existe una categoría con ese nombre en esta área." });
        }
        console.error("Error creando categoría:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// =========================
// ACTUALIZAR CATEGORÍA
// =========================
exports.updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, area_id, activo } = req.body;

    try {
        const result = await sql`
            UPDATE ticket_categorias
            SET nombre = ${nombre},
                descripcion = ${descripcion},
                area_id = ${area_id},
                activo = ${activo}
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        res.json(result[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: "Ya existe una categoría con ese nombre en esta área." });
        }
        console.error("Error actualizando categoría:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// =========================
// ELIMINAR CATEGORÍA
// =========================
exports.deleteCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql`
            DELETE FROM ticket_categorias
            WHERE id = ${id}
            RETURNING id
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        res.json({ message: "Categoría eliminada con éxito", id: result[0].id });
    } catch (error) {
        // Protección empresarial: Si hay error de llave foránea (23503), significa que la categoría ya tiene tickets asignados.
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "No se puede eliminar la categoría porque ya tiene tickets asociados. Por favor, desactívala en su lugar." 
            });
        }
        console.error("Error eliminando categoría:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};