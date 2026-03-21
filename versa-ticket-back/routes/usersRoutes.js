const express = require('express');
const router = express.Router();
const getUsers = require('../controllers/usersController');
import { isAdmin } from '../middleware/authMiddleware';

// users
router.get('/admin', isAdmin, getUsers.getUserAdmin);
router.put('/:id', isAdmin, getUsers.updateUser);
module.exports = router;