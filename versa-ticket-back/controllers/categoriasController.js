// controllers/categoriesController.js
const db = require("../config/db");

const getCategorias = async (req, res) => {
  try {
    // ✅ Usar el nombre correcto: ticket_categorias
    const result = await db.query(`
      SELECT id, nombre, descripcion 
      FROM ticket_categorias 
      ORDER BY id
    `);
    res.json(result);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ message: "Error obteniendo categorías" });
  }
};

const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ Usar el nombre correcto: ticket_categorias
    const result = await db.query(`
      SELECT id, nombre, descripcion 
      FROM ticket_categorias 
      WHERE id = $1
    `, [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo categoría" });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }
    
    const result = await db.query(`
      INSERT INTO ticket_categorias (nombre, descripcion) 
      VALUES ($1, $2) 
      RETURNING *
    `, [nombre, descripcion || null]);
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({ message: "Error creando categoría" });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    const result = await db.query(`
      UPDATE ticket_categorias 
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion)
      WHERE id = $3
      RETURNING *
    `, [nombre, descripcion, id]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando categoría" });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      "DELETE FROM ticket_categorias WHERE id = $1 RETURNING id",
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    
    res.json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando categoría" });
  }
};

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
};