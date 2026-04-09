// routes/estadosRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middlewares/auth");

router.use(verifyToken);

// GET /api/estados
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, nombre, descripcion, activo
      FROM ticket_estados 
      WHERE activo = true
      ORDER BY id
    `);
    res.json(result);
  } catch (error) {
    console.error('Error obteniendo estados:', error);
    res.status(500).json({ message: "Error obteniendo estados" });
  }
});

// GET /api/estados/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT id, nombre, descripcion, activo
      FROM ticket_estados 
      WHERE id = $1
    `, [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo estado" });
  }
});

module.exports = router;