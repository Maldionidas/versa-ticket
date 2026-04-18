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

// Middleware dinámico basado en tu JSON de permisos
const hasPermission = (module, action) => {
  return (req, res, next) => {
    const user = req.user;

    // Salvavidas: Si es el Admin principal, pasa directo
    if (user?.rol_id === 2 || user?.permisos?.admin === true) {
      return next();
    }

    try {
      // Parseamos los permisos si vienen como string desde el token
      const permisos = typeof user?.permisos === 'string' ? JSON.parse(user.permisos) : (user?.permisos || {});

      if (permisos?.[module]?.[action] === true) {
        return next();
      }

      return res.status(403).json({ 
        message: `Acceso denegado. Requieres permiso para ${action} en el módulo ${module}.` 
      });
    } catch (error) {
      console.error("Error leyendo permisos:", error);
      return res.status(403).json({ message: "Error validando permisos de acceso." });
    }
  };
};

// Funciones heredadas (mantenidas por compatibilidad con código viejo)
const isAdmin = (req, res, next) => {
  if (req.user?.rol_id !== 2) {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

const isAgentOrAdmin = (req, res, next) => {
  if (req.user?.rol_id !== 2 && req.user?.rol_id !== 3) {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de agente o administrador." });
  }
  next();
};

const isSameUserOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.userId) || parseInt(req.params.id);
  if (req.user?.rol_id !== 2 && req.user?.id !== userId) {
    return res.status(403).json({ message: "Acceso denegado. No tienes permiso para esta acción." });
  }
  next();
};

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "mi-secreto");
      req.user = decoded;
    } catch (error) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { 
  verifyToken, 
  hasPermission,
  isAdmin, 
  isAgentOrAdmin, 
  isSameUserOrAdmin,
  optionalAuth 
};