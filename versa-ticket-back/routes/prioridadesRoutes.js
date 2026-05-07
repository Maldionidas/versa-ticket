const express = require("express");
const router = express.Router();

const sql = require("../config/db");
const { verifyToken } = require("../middlewares/authMiddleware");

// Capa de seguridad: Todas las rutas requieren un token valido
router.use(verifyToken);

// ==========================================
// OBTENER TODAS LAS PRIORIDADES
// ==========================================
router.get("/", async (req, res) => {
  try {
    const result = await sql`
      SELECT id, nombre, nivel, tiempo_sla
      FROM ticket_prioridades 
      ORDER BY nivel
    `;
    res.json(result);
  } catch (error) {
    console.error("Error obteniendo prioridades:", error);
    res.status(500).json({ message: "Error obteniendo prioridades" });
  }
});

// ==========================================
// OBTENER PRIORIDAD POR ID
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      SELECT id, nombre, nivel, tiempo_sla
      FROM ticket_prioridades 
      WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Prioridad no encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Error obteniendo prioridad por ID:", error);
    res.status(500).json({ message: "Error obteniendo prioridad" });
  }
});

module.exports = router;