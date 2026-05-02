const { sql } = require("../config/db");

// ==========================================
// OBTENER TODOS LOS CAMPOS (Para el Admin Panel)
// ==========================================
exports.getAllCamposAdmin = async (req, res) => {
    try {
        const result = await sql`
            SELECT c.id, c.area_id, c.nombre_campo, c.tipo_dato, 
                   c.requerido, c.opciones, c.activo, a.nombre AS area_nombre
            FROM campos_personalizados c
            JOIN areas a ON c.area_id = a.id
            ORDER BY c.area_id, c.id DESC
        `;
        res.json(result);
    } catch (error) {
        console.error("Error obteniendo campos personalizados:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ==========================================
// OBTENER CAMPOS POR ÁREA (Para CreateTicketForm)
// ==========================================
exports.getCamposByArea = async (req, res) => {
    const { area_id } = req.params;

    try {
        const result = await sql`
            SELECT id, nombre_campo, tipo_dato, requerido, opciones
            FROM campos_personalizados
            WHERE area_id = ${area_id} AND activo = true
            ORDER BY id ASC
        `;
        res.json(result);
    } catch (error) {
        console.error("Error obteniendo campos por área:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ==========================================
// CREAR NUEVO CAMPO
// ==========================================
exports.createCampo = async (req, res) => {
    const { area_id, nombre_campo, tipo_dato, requerido, opciones, activo } = req.body;

    try {
        // Validación: Si es select, asegurarnos de que opciones sea un JSON válido
        const opcionesJson = (tipo_dato === 'select' || tipo_dato === 'radio') && opciones 
            ? JSON.stringify(opciones) 
            : null;

        const result = await sql`
            INSERT INTO campos_personalizados 
            (area_id, nombre_campo, tipo_dato, requerido, opciones, activo)
            VALUES 
            (${area_id}, ${nombre_campo}, ${tipo_dato}, ${requerido ?? false}, ${opcionesJson}, ${activo ?? true})
            RETURNING *
        `;

        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error creando campo personalizado:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ==========================================
// ACTUALIZAR CAMPO
// ==========================================
exports.updateCampo = async (req, res) => {
    const { id } = req.params;
    const { area_id, nombre_campo, tipo_dato, requerido, opciones, activo } = req.body;

    try {
        const opcionesJson = (tipo_dato === 'select' || tipo_dato === 'radio') && opciones 
            ? JSON.stringify(opciones) 
            : null;

        const result = await sql`
            UPDATE campos_personalizados
            SET area_id = ${area_id},
                nombre_campo = ${nombre_campo},
                tipo_dato = ${tipo_dato},
                requerido = ${requerido},
                opciones = ${opcionesJson},
                activo = ${activo}
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Campo no encontrado" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Error actualizando campo personalizado:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ==========================================
// ELIMINAR CAMPO
// ==========================================
exports.deleteCampo = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await sql`
            DELETE FROM campos_personalizados
            WHERE id = ${id}
            RETURNING id
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Campo no encontrado" });
        }

        res.json({ message: "Campo eliminado con éxito", id: result[0].id });
    } catch (error) {
        // Fail-safe: Si ya hay tickets usando este campo, no dejamos borrarlo para no romper la integridad referencial.
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "No se puede eliminar este campo porque ya tiene respuestas guardadas en algunos tickets. Por favor, desactívalo en su lugar." 
            });
        }
        console.error("Error eliminando campo personalizado:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};