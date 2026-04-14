// usersRoutes.js
const express = require('express');
const router = express.Router();
const getUsers = require('../controllers/usersController');
const {hasPermission, isAdmin} = require("../middleware/authMiddleware")

// users
router.get('/admin', hasPermission("users", "read"), getUsers.getUserAdmin);
router.put('/:id', hasPermission("users", "update"), getUsers.updateUser);
router.delete('/:id', hasPermission("users", "delete"), getUsers.deleteUser);
router.post("/crear", hasPermission("users", "create"), getUsers.createUser)


module.exports = router;