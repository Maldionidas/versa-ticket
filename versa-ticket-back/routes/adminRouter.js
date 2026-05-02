// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

// Importar controladores
const usersController = require('../controllers/usersController');
const areasController = require('../controllers/areasController');
const rolesController = require('../controllers/rolesController');

// ==================== USUARIOS ====================
if (usersController) {
  router.get('/users', usersController.getUsers);
  router.get('/users/:id', usersController.getUserById);
  router.post('/users', usersController.createUser);
  router.put('/users/:id', usersController.updateUser);
  router.delete('/users/:id', usersController.deleteUser);
}

// ==================== ÁREAS ====================
if (areasController) {
  router.get('/areas', areasController.getAreas);
  router.post('/areas', areasController.createArea);
  router.put('/areas/:id', areasController.updateArea);
  router.delete('/areas/:id', areasController.deleteArea);
}

// ==================== ROLES ====================
if (rolesController) {
  router.get('/roles', rolesController.getRoles);
  router.get('/roles/:id', rolesController.getRoleById);
  router.post('/roles', rolesController.createRole);
  router.put('/roles/:id', rolesController.updateRole);
  router.delete('/roles/:id', rolesController.deleteRole);
}

// ==================== ESTADÍSTICAS ====================
router.get('/stats', async (req, res) => {
  try {
    const db = require('../config/db');
    
    const totalUsers = await db.query("SELECT COUNT(*) FROM users");
    const totalAreas = await db.query("SELECT COUNT(*) FROM areas");
    const totalTickets = await db.query("SELECT COUNT(*) FROM tickets");
    const ticketsAbiertos = await db.query("SELECT COUNT(*) FROM tickets WHERE estado_id = 1");
    const totalAdmins = await db.query("SELECT COUNT(*) FROM users WHERE rol_id = 2");
    
    res.json({
      totalUsuarios: parseInt(totalUsers[0].count),
      totalAreas: parseInt(totalAreas[0].count),
      totalTickets: parseInt(totalTickets[0].count),
      ticketsAbiertos: parseInt(ticketsAbiertos[0].count),
      totalAdministradores: parseInt(totalAdmins[0].count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
});

module.exports = router;