const express = require("express");
const router = express.Router();

const rolesController = require("../controllers/rolesController");

// Importamos del middleware unificado
const { verifyToken, hasPermission } = require("../middlewares/authMiddleware");

// CAPA 1: Todas las rutas requieren un token valido
router.use(verifyToken);

// CAPA 2: Permisos granulares (RBAC) para el panel de administracion
router.get("/", hasPermission("roles", "read"), rolesController.getRoles);
router.post("/", hasPermission("roles", "create"), rolesController.createRole);
router.put("/:id", hasPermission("roles", "update"), rolesController.updateRole);
router.delete("/:id", hasPermission("roles", "delete"), rolesController.deleteRole);

module.exports = router;