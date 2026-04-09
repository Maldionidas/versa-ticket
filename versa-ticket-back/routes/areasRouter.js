// routes/areasRoutes.js
const express = require("express");
const router = express.Router();
const areasController = require("../controllers/areasController");
// ✅ CORREGIR: La ruta correcta es ../middlewares/auth (no ../middleware/authMiddleware)
const { verifyToken, isAdmin } = require("../middlewares/auth");

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas de áreas
router.get("/", areasController.getAreas);
router.get("/:id", areasController.getAreaById);
router.post("/", isAdmin, areasController.createArea);
router.put("/:id", isAdmin, areasController.updateArea);
router.delete("/:id", isAdmin, areasController.deleteArea);

module.exports = router;