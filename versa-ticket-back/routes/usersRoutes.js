// routes/usersRoutes.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { verifyToken } = require("../middlewares/auth");

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get("/", usersController.getUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;