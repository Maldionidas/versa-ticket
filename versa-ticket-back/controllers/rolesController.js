//rolesController.js
const db = require("../config/db");

const getRoles = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM roles");

    console.log("RESULT:", result);

    res.json(result)

  } catch (error) {
    console.error("ERROR EN DB:", error);
    res.status(500).json({ error: "Error obteniendo roles" });
  }
};

const createRole = async (req, res) => {
  const { nombre, descripcion, permisos } = req.body;

  const result = await db.query(
    "INSERT INTO roles (nombre, descripcion, permisos) VALUES ($1,$2,$3) RETURNING *",
    [nombre, descripcion, permisos]
  );

  res.json(result.rows[0]);
};

const updateRole = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, permisos } = req.body;

  const result = await db.query(
    "UPDATE roles SET nombre=$1, descripcion=$2, permisos=$3 WHERE id=$4 RETURNING *",
    [nombre, descripcion, permisos, id]
  );

  res.json(result.rows[0]);
};

const deleteRole = async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM roles WHERE id=$1", [id]);

  res.json({ message: "Rol eliminado" });
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};