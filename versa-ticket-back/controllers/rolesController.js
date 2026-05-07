const { sql } = require("../config/db");

const getRoles = async (req, res) => {
  try {
    const result = await sql`SELECT * FROM roles ORDER BY id`;
    // Neon devuelve el arreglo directamente, no necesitamos .rows
    res.json(result);
  } catch (error) {
    console.error("Error obteniendo roles:", error);
    res.status(500).json({ message: "Error obteniendo roles" });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
        return res.status(400).json({ message: "ID de rol inválido" });
    }

    const result = await sql`SELECT * FROM roles WHERE id = ${id}`;
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error("Error obteniendo rol:", error);
    res.status(500).json({ message: "Error obteniendo rol" });
  }
};

const createRole = async (req, res) => {
  try {
    const { nombre, descripcion, permisos } = req.body;
    
    const result = await sql`
      INSERT INTO roles (nombre, descripcion, permisos) 
      VALUES (${nombre}, ${descripcion}, ${permisos}) 
      RETURNING *
    `;
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creando rol:", error);
    res.status(500).json({ message: "Error creando rol" });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisos } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: "ID de rol inválido" });
    }
    
    const result = await sql`
      UPDATE roles 
      SET nombre = ${nombre}, 
          descripcion = ${descripcion}, 
          permisos = ${permisos} 
      WHERE id = ${id} 
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error("Error actualizando rol:", error);
    res.status(500).json({ message: "Error actualizando rol" });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ message: "ID de rol inválido" });
    }
    
    const result = await sql`DELETE FROM roles WHERE id = ${id} RETURNING id`;
    
    if (result.length === 0) {
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