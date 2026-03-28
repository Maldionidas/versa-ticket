const express = require('express');
const router = express.Router();

// Importamos los middlewares de seguridad que blindamos en fases anteriores
const { hasPermission } = require('../middleware/authMiddleware');

// Importamos el controlador CRUD de categorías
const categoriasController = require('../controllers/categoriasController');

// ==========================================
// MIDDLEWARE GLOBAL PARA ESTE ROUTER
// ==========================================
// Exigimos que haya un token válido para CUALQUIER petición a /api/categorias
//router.use(authenticateToken);

// ==========================================
// ENDPOINTS Y PERMISOS (RBAC)
// ==========================================

// GET /api/categorias - Requiere permiso de lectura
router.get('/', hasPermission('categorias', 'read'), categoriasController.getAllCategoriasAdmin);

// POST /api/categorias - Requiere permiso de creación
router.post('/', hasPermission('categorias', 'create'), categoriasController.createCategoria);

// PUT /api/categorias/:id - Requiere permiso de actualización
router.put('/:id', hasPermission('categorias', 'update'), categoriasController.updateCategoria);

// DELETE /api/categorias/:id - Requiere permiso de eliminación
router.delete('/:id', hasPermission('categorias', 'delete'), categoriasController.deleteCategoria);

module.exports = router;