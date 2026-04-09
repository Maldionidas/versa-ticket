// routes/rolesRoutes.js
const express = require("express");
const router = express.Router();
const sql = require("../config/db");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No autorizado" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "mi-secreto");
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// GET /api/roles
router.get("/", verifyToken, async (req, res) => {
  try {
    const roles = await sql`SELECT id, nombre, descripcion FROM roles ORDER BY id`;
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener roles" });
  }
});

module.exports = router;