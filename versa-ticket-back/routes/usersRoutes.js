// routes/usersRoutes.js
const express = require("express");
const router = express.Router();

const usersController = require("../controllers/usersController");
// Importamos desde nuestro nuevo middleware unificado
const { verifyToken, hasPermission } = require("../middlewares/auth");

// Capa de seguridad 1: Todos deben estar logueados
router.use(verifyToken);

// Capa de seguridad 2: Permisos granulares por modulo

// Obtener todos los usuarios (Lista del Admin)
router.get("/", hasPermission("users", "read"), usersController.getUsers);

// Obtener un usuario especifico (Ver perfil)
// Nota: El controlador ya permite que un usuario vea su propio ID sin ser admin
router.get("/:id", usersController.getUserById);

// Crear usuario
router.post("/", hasPermission("users", "create"), usersController.createUser);

// Actualizar usuario
router.put("/:id", hasPermission("users", "update"), usersController.updateUser);

// Eliminar usuario
router.delete("/:id", hasPermission("users", "delete"), usersController.deleteUser);

module.exports = router;