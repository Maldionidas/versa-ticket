// controllers/rolesController.js
const db = require("../config/db");

const getRoles = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM roles ORDER BY id");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo roles" });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (result.length === 0) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo rol" });
  }
};

const createRole = async (req, res) => {
  try {
    const { nombre, nivel } = req.body;
    const result = await db.query(
      "INSERT INTO roles (nombre, nivel) VALUES ($1, $2) RETURNING *",
      [nombre, nivel]
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando rol" });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nivel } = req.body;
    const result = await db.query(
      "UPDATE roles SET nombre = $1, nivel = $2 WHERE id = $3 RETURNING *",
      [nombre, nivel, id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando rol" });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM roles WHERE id = $1", [id]);
  } catch (error) {
    console.error(error);
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