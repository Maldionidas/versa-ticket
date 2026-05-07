const { sql } = require("../config/db");

// =========================
// OBTENER TODAS (Admin)
// =========================
exports.getAllCategoriasAdmin = async (req, res) => {
    try {
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
// OBTENER ACTIVAS (General)
// =========================
exports.getCategorias = async (req, res) => {
  try {
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
// OBTENER POR ÁREA (Faltaba esta función)
// =========================
exports.getCategoriasPorArea = async (req, res) => {
    try {
        const { areaId } = req.params;
        
        if (isNaN(areaId)) {
            return res.status(400).json({ message: "El ID del área proporcionado no es válido" });
        }

        const result = await sql`
            SELECT id, nombre, descripcion, area_id 
            FROM ticket_categorias 
            WHERE area_id = ${areaId} AND activo = true
            ORDER BY id
        `;
        res.json(result);
    } catch (error) {
        console.error('Error obteniendo categorías por área:', error);
        res.status(500).json({ message: "Error obteniendo categorías por área" });
    }
};

// =========================
// OBTENER POR ID (Blindado)
// =========================
exports.getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validación anti-crashes
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID proporcionado no es válido" });
    }

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
// CREAR CATEGORÍA
// =========================
exports.createCategoria = async (req, res) => {
    const { nombre, descripcion, area_id, activo } = req.body;

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
// ACTUALIZAR CATEGORÍA (Blindado)
// =========================
exports.updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, area_id, activo } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID proporcionado no es válido" });
    }

    try {
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
// ELIMINAR CATEGORÍA (Blindado)
// =========================
exports.deleteCategoria = async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID proporcionado no es válido" });
    }

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
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "No se puede eliminar la categoría porque ya tiene tickets asociados. Por favor, desactívala en su lugar." 
            });
        }
        console.error("Error eliminando categoría:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};