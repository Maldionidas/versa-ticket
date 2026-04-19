// routes/categoriasRoutes.js
const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// 1. RUTAS ESPECÍFICAS PRIMERO
router.get('/ticket/:ticketId', commentsController.getCommentsByTicket);
router.post('/', commentsController.createComment);
router.delete('/:id', commentsController.deleteComment);


module.exports = router;