// routes/commentsRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const commentsController = require("../controllers/commentsController");


// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Definir rutas
router.get('/ticket/:ticketId', commentsController.getCommentsByTicket);
router.post('/', commentsController.createComment);
router.delete('/:id', commentsController.deleteComment);

module.exports = router;