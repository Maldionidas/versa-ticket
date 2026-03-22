const express = require('express');
const router = express.Router();
const getUsers = require('../controllers/usersController');
const { isAdmin } = require('../middleware/authMiddleware');

// users
router.get('/admin', isAdmin, getUsers.getUserAdmin);
router.put('/:id', isAdmin, getUsers.updateUser);
router.delete('/:id', getUsers.deleteUser)
module.exports = router;