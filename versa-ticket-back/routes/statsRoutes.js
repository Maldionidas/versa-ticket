// routes/statsRoutes.js
const express = require('express');
const router = express.Router();

const statsController = require("../controllers/statsController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Capa de seguridad general
router.use(verifyToken);

// Rutas apuntando al controlador
router.get('/', statsController.getGeneralStats);
router.get('/dashboard', statsController.getDashboardStats);

module.exports = router;