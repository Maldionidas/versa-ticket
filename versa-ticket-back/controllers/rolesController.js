// controllers/rolesController.js
const db = require("../config/db");

const getRoles = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM roles ORDER BY id");
    // En pg, los datos vienen dentro de result.rows
    res.json(result.rows || result);
  } catch (error) {
    console.error("Error obteniendo roles:", error);
    res.status(500).json({ message: "Error obteniendo roles" });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM roles WHERE id = $1", [id]);
    
    const rows = result.rows || result;
    if (rows.length === 0) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error obteniendo rol:", error);
    res.status(500).json({ message: "Error obteniendo rol" });
  }
};

const createRole = async (req, res) => {
  try {
    // 🛡️ MANTENEMOS TUS PERMISOS, NADA DE "NIVELES"
    const { nombre, descripcion, permisos } = req.body;
    
    const result = await db.query(
      "INSERT INTO roles (nombre, descripcion, permisos) VALUES ($1, $2, $3) RETURNING *",
      [nombre, descripcion, permisos]
    );
    
    const rows = result.rows || result;
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creando rol:", error);
    res.status(500).json({ message: "Error creando rol" });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisos } = req.body;
    
    const result = await db.query(
      "UPDATE roles SET nombre=$1, descripcion=$2, permisos=$3 WHERE id=$4 RETURNING *",
      [nombre, descripcion, permisos, id]
    );
    
    const rows = result.rows || result;
    if (rows.length === 0) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error actualizando rol:", error);
    res.status(500).json({ message: "Error actualizando rol" });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query("DELETE FROM roles WHERE id = $1 RETURNING id", [id]);
    const rows = result.rows || result;
    
    if (rows.length === 0) {
        return res.status(404).json({ message: "Rol no encontrado" });
    }
    
    res.json({ message: "Rol eliminado exitosamente" });
  } catch (error) {
    if (error.code === '23503') {
        return res.status(400).json({ 
            message: "No se puede eliminar este rol porque hay usuarios que lo están usando." 
        });
    }
    console.error("Error eliminando rol:", error);
    res.status(500).json({ message: "Error eliminando rol" });
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};