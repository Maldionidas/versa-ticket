// controllers/usersController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Obtener todos los usuarios (con filtro por rol)
const getUsers = async (req, res) => {
  try {
    const { rol } = req.query;
    const userRole = req.user?.rol_id;
    
    let query = `
      SELECT id, nombre, apellido, email, rol_id, area_id, activo, fecha_registro
      FROM users 
      WHERE activo = true
    `;
    let params = [];
    
    // Si se pide un rol específico (ej: agentes rol_id=3)
    if (rol === '3') {
      query += ` AND rol_id = 3`;
    }
    
    // Si NO es administrador, solo puede ver usuarios normales, agentes e invitados
    if (userRole !== 2) {
      query += ` AND rol_id IN (1, 3, 4)`;
    }
    
    query += ` ORDER BY id`;
    
    const users = await db.query(query, params);
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.rol_id;
    
    // Si no es admin, solo puede ver su propio perfil
    if (userRole !== 2 && parseInt(id) !== req.user?.id) {
      return res.status(403).json({ message: "No tienes permiso para ver este usuario" });
    }
    
    const users = await db.query(`
      SELECT id, nombre, apellido, email, rol_id, area_id, activo, fecha_registro
      FROM users 
      WHERE id = $1
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo usuario" });
  }
};

// Crear nuevo usuario (solo admin)
const createUser = async (req, res) => {
  try {
    const { email, nombre, apellido, rol_id, area_id } = req.body;
    const userRole = req.user?.rol_id;
    
    // Solo administradores pueden crear usuarios
    if (userRole !== 2) {
      return res.status(403).json({ message: "No tienes permiso para crear usuarios" });
    }
    
    // Verificar si ya existe
    const existing = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    
    // Contraseña temporal
    const tempPassword = await bcrypt.hash("123456", 10);
    
    const newUser = await db.query(`
      INSERT INTO users (email, password_hash, nombre, apellido, rol_id, area_id, activo)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, nombre, apellido, email, rol_id, area_id, activo
    `, [email, tempPassword, nombre, apellido, rol_id, area_id]);
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ message: "Error creando usuario" });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, rol_id, area_id, activo } = req.body;
    const userRole = req.user?.rol_id;
    const currentUserId = req.user?.id;
    
    // Verificar permisos
    if (userRole !== 2 && parseInt(id) !== currentUserId) {
      return res.status(403).json({ message: "No tienes permiso para modificar este usuario" });
    }
    
    // Construir query dinámicamente según permisos
    let updateQuery = `UPDATE users SET nombre = $1, apellido = $2, area_id = $3, activo = $4`;
    let params = [nombre, apellido, area_id, activo];
    
    // Solo admin puede cambiar el rol
    if (userRole === 2 && rol_id !== undefined) {
      updateQuery += `, rol_id = $5`;
      params.push(rol_id);
      params.push(id);
    } else {
      params.push(id);
    }
    
    updateQuery += ` WHERE id = $${params.length} RETURNING id, nombre, apellido, email, rol_id, area_id, activo`;
    
    const updated = await db.query(updateQuery, params);
    
    if (updated.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json(updated[0]);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: "Error actualizando usuario" });
  }
};

// Eliminar usuario (solo admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.rol_id;
    
    if (userRole !== 2) {
      return res.status(403).json({ message: "No tienes permiso para eliminar usuarios" });
    }
    
    // No permitir eliminar a sí mismo
    if (parseInt(id) === req.user?.id) {
      return res.status(400).json({ message: "No puedes eliminar tu propio usuario" });
    }
    
    const deleted = await db.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
    
    if (deleted.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};