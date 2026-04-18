// middlewares/auth.js
const jwt = require("jsonwebtoken");

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No autorizado. Token requerido." });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mi-secreto");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Middleware para verificar si es administrador
const isAdmin = (req, res, next) => {
  if (req.user?.rol_id !== 2) {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

// Middleware para verificar si es agente o admin
const isAgentOrAdmin = (req, res, next) => {
  if (req.user?.rol_id !== 2 && req.user?.rol_id !== 3) {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de agente o administrador." });
  }
  next();
};

// Middleware para verificar si es el mismo usuario o admin
const isSameUserOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.userId) || parseInt(req.params.id);
  if (req.user?.rol_id !== 2 && req.user?.id !== userId) {
    return res.status(403).json({ message: "Acceso denegado. No tienes permiso para esta acción." });
  }
  next();
};

// Middleware opcional: solo verificar token (para comentarios públicos)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "mi-secreto");
      req.user = decoded;
    } catch (error) {
      // Si el token es inválido, simplemente no hay usuario
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { 
  verifyToken, 
  isAdmin, 
  isAgentOrAdmin, 
  isSameUserOrAdmin,
  optionalAuth 
};