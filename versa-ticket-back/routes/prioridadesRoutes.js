// routes/prioridadesRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middlewares/auth");

router.use(verifyToken);

// GET /api/prioridades
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, nombre, nivel, tiempo_sla
      FROM ticket_prioridades 
      ORDER BY nivel
    `);
    res.json(result);
  } catch (error) {
    console.error('Error obteniendo prioridades:', error);
    res.status(500).json({ message: "Error obteniendo prioridades" });
  }
});

// GET /api/prioridades/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT id, nombre, nivel, tiempo_sla
      FROM ticket_prioridades 
      WHERE id = $1
    `, [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Prioridad no encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo prioridad" });
  }
});

module.exports = router;