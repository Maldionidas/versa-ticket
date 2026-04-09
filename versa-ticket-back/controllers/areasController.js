// controllers/areasController.js
const db = require("../config/db");

const getAreas = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM areas ORDER BY id");
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo áreas" });
  }
};

const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM areas WHERE id = $1", [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Área no encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo área" });
  }
};

const createArea = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    // Incluir activo con valor por defecto true
    const result = await db.query(
      "INSERT INTO areas (nombre, descripcion, activo) VALUES ($1, $2, $3) RETURNING *",
      [nombre, descripcion || null, true]
    );

    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando área" });
  }
};

const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    
    // Incluir todos los campos necesarios, incluyendo activo
    const result = await db.query(
      "UPDATE areas SET nombre = $1, descripcion = $2, activo = $3 WHERE id = $4 RETURNING *",
      [nombre, descripcion || null, activo !== undefined ? activo : true, id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Área no encontrada" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando área" });
  }
};

const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query("DELETE FROM areas WHERE id = $1 RETURNING id", [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Área no encontrada" });
    }
    
    res.json({ message: "Área eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando área" });
  }
};

module.exports = {
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea
};