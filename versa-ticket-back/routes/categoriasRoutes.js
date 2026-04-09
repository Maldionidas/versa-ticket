// routes/categoriasRoutes.js
const express = require("express");
const router = express.Router();
const categoriasController = require("../controllers/categoriasController");
// ✅ CORREGIR: La ruta correcta es ../middlewares/auth
const { verifyToken, isAdmin } = require("../middlewares/auth");

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas de categorías
router.get("/", categoriasController.getCategorias);
router.get("/:id", categoriasController.getCategoriaById);
router.post("/", isAdmin, categoriasController.createCategoria);
router.put("/:id", isAdmin, categoriasController.updateCategoria);
router.delete("/:id", isAdmin, categoriasController.deleteCategoria);

module.exports = router;