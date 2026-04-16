// routes/estadosRoutes.js
const express = require("express");
const router = express.Router();

const sql = require("../config/db");
const { verifyToken } = require("../middlewares/authMiddleware");

// Capa de seguridad: Todas las rutas requieren un token válido
router.use(verifyToken);

// ==========================================
// OBTENER TODOS LOS ESTADOS ACTIVOS
// ==========================================
router.get("/", async (req, res) => {
  try {
    const result = await sql`
      SELECT id, nombre, descripcion, activo
      FROM ticket_estados 
      WHERE activo = true
      ORDER BY id
    `;
    res.json(result);
  } catch (error) {
    console.error("Error obteniendo estados:", error);
    res.status(500).json({ message: "Error obteniendo estados" });
  }
});

// ==========================================
// OBTENER ESTADO POR ID
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      SELECT id, nombre, descripcion, activo
      FROM ticket_estados 
      WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Error obteniendo estado por ID:", error);
    res.status(500).json({ message: "Error obteniendo estado" });
  }
});

module.exports = router;