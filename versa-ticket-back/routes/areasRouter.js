const express = require("express");
const router = express.Router();
const areasController = require("../controllers/areasController");
const { verifyToken, hasPermission } = require("../middlewares/auth");

// CAPA 1: Todas las rutas de aquí para abajo requieren un Token JWT válido
router.use(verifyToken);

// CAPA 2: Permisos granulares (RBAC) para cada acción
router.get("/", hasPermission("areas", "read"), areasController.getAreas);
router.get("/:id", hasPermission("areas", "read"), areasController.getAreaById);
router.post("/", hasPermission("areas", "create"), areasController.createArea);
router.put("/:id", hasPermission("areas", "update"), areasController.updateArea);
router.delete("/:id", hasPermission("areas", "delete"), areasController.deleteArea);

module.exports = router;