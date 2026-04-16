const { sql } = require("../config/db");

// =========================
// OBTENER TODAS (Admin) - De tu versión
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
        
        res.json(categorias);
    } catch (error) {
        console.error("Error obteniendo categorías admin:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// =========================
// OBTENER TODAS (Público) - Rescatado de tu compañero pero mejorado
// =========================
exports.getCategorias = async (req, res) => {
  try {
    // Solo devolvemos las categorías activas para los usuarios normales
    const result = await sql`
      SELECT id, nombre, descripcion, area_id 
      FROM ticket_categorias 
      WHERE activo = true
      ORDER BY id
    `;
    res.json(result);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ message: "Error obteniendo categorías" });
  }
};

// =========================
// OBTENER POR ID - Rescatado de tu compañero
// =========================
exports.getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      SELECT id, nombre, descripcion, area_id, activo
      FROM ticket_categorias 
      WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo categoría" });
  }
};

// =========================
// CREAR CATEGORÍA - De tu versión (Avanzada)
// =========================
exports.createCategoria = async (req, res) => {
    const { nombre, descripcion, area_id, activo } = req.body;

    // Validación extra que tenía tu compañero
    if (!nombre) {
        return res.status(400).json({ message: "El nombre es requerido" });
    }

    try {
        const result = await sql`
            INSERT INTO ticket_categorias (nombre, descripcion, area_id, activo)
            VALUES (${nombre}, ${descripcion}, ${area_id}, ${activo ?? true})
            RETURNING *
        `;

        res.status(201).json(result[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: "Ya existe una categoría con ese nombre en esta área." });
        }
        console.error("Error creando categoría:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// =========================
// ACTUALIZAR CATEGORÍA - De tu versión 
// =========================
exports.updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, area_id, activo } = req.body;

    try {
        // Implementamos el COALESCE de tu compa en tu sintaxis para no borrar datos si no se envían
        const result = await sql`
            UPDATE ticket_categorias
            SET nombre = COALESCE(${nombre}, nombre),
                descripcion = COALESCE(${descripcion}, descripcion),
                area_id = COALESCE(${area_id}, area_id),
                activo = COALESCE(${activo}, activo)
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
// ELIMINAR CATEGORÍA - De tu versión (Con escudo protector)
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
        // Protección empresarial de las claves foráneas
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "No se puede eliminar la categoría porque ya tiene tickets asociados. Por favor, desactívala en su lugar." 
            });
        }
        console.error("Error eliminando categoría:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};