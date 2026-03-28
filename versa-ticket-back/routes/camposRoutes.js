const express = require('express');
const router = express.Router();

const { authenticateToken, hasPermission } = require('../middleware/authMiddleware');
const camposController = require('../controllers/camposController');

// Protegemos todas las rutas con el token
//router.use(authenticateToken);

// ----------------------------------------------------------------------
// RUTAS PARA EL PANEL DE ADMINISTRACIÓN (Requieren permisos de 'campos')
// ----------------------------------------------------------------------
router.get('/', hasPermission('campos', 'read'), camposController.getAllCamposAdmin);
router.post('/', hasPermission('campos', 'create'), camposController.createCampo);
router.put('/:id', hasPermission('campos', 'update'), camposController.updateCampo);
router.delete('/:id', hasPermission('campos', 'delete'), camposController.deleteCampo);

// ----------------------------------------------------------------------
// RUTA ABIERTA PARA EL FORMULARIO DE TICKETS (Solo lectura, sin permiso especial de admin)
// ----------------------------------------------------------------------
// Nota: Solo necesita estar logueado (authenticateToken), cualquier usuario puede leer los campos de un área para poder crear su ticket.
router.get('/area/:area_id', camposController.getCamposByArea);

module.exports = router;