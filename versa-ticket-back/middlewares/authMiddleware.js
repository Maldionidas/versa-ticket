const jwt = require("jsonwebtoken");

// 1. Verificacion de Token JWT
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

// 2. Verificacion de Administrador Global
const isAdmin = (req, res, next) => {
  if (req.user?.rol_id !== 2) {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

// 3. Verificacion de Permisos Granulares (RBAC)
const hasPermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permisos) {
      return res.status(401).json({ message: "No autenticado o sin permisos definidos." });
    }

    const permisos = req.user.permisos;

    // Si es administrador general, tiene acceso total
    if (req.user.rol_id === 2 || permisos.admin) {
      return next();
    }

    // Validacion de permiso especifico en el modulo
    if (!permisos?.[module]?.[action]) {
      return res.status(403).json({ message: "No autorizado para esta accion" });
    }

    next();
  };
};

module.exports = { verifyToken, isAdmin, hasPermission };