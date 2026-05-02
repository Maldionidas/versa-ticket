const express = require('express');
const router = express.Router();

// Importamos del nuevo middleware unificado
const { verifyToken, hasPermission } = require('../middlewares/authMiddleware');
const camposController = require('../controllers/camposController');

// CAPA 1: Protegemos todas las rutas requeridas exigiendo que el usuario haya iniciado sesión (Token válido)
router.use(verifyToken);

// RUTAS PARA EL PANEL DE ADMINISTRACIÓN (Requieren permisos de 'campos')
router.get('/', hasPermission('campos', 'read'), camposController.getAllCamposAdmin);
router.post('/', hasPermission('campos', 'create'), camposController.createCampo);
router.put('/:id', hasPermission('campos', 'update'), camposController.updateCampo);
router.delete('/:id', hasPermission('campos', 'delete'), camposController.deleteCampo);

// RUTA ABIERTA PARA EL FORMULARIO DE TICKETS 
// Al estar debajo de router.use(verifyToken), ya exige estar logueado.
// Al no tener hasPermission, cualquier usuario autenticado puede consumirla.
router.get('/area/:area_id', camposController.getCamposByArea);

module.exports = router;