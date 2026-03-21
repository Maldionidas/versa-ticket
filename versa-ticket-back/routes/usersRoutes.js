const express = require('express');
const router = express.Router();
const getUsers = require('../controllers/usersController');

// users
router.get('/admin', getUsers.getUserAdmin);
router.put('/:id', getUsers.updateUser);
module.exports = router;