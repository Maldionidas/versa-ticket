//authMiddleware.js
const isAdmin = (req, res, next) => {
  if (!req.user?.permisos?.admin) {
    return res.status(403).json({ message: "Solo administradores" })
  }

  next()
}

const hasPermission = (module, action) => {
  return (req, res, next) => {

    // usr TEMPORAL
    req.user = {
      permisos: {
        admin: true,
        users: { create: true, read: true, update: true, delete: true },
        roles: { create: true, read: true, update: true, delete: true },
        areas: { create: true, read: true, update: true, delete: true }
      }
    }

    //  Validación
    if (!req.user || !req.user.permisos) {
      return res.status(401).json({ message: "No autenticado" })
    }

    const permisos = req.user.permisos

    if (permisos.admin) return next()

    if (!permisos?.[module]?.[action]) {
      return res.status(403).json({ message: "No autorizado" })
    }

    next()
  }
}
//esto para cuando meta login
/**const hasPermission = (module, action) => {
  return (req, res, next) => {

    if (!req.user || !req.user.permisos) {
      return res.status(401).json({ message: "Usuario no autenticado" })
    }

    const permisos = req.user.permisos

    if (permisos.admin) {
      return next()
    }

    if (!permisos?.[module]?.[action]) {
      return res.status(403).json({ message: "No autorizado" })
    }

    next()
  }
}*/

module.exports = { isAdmin, hasPermission };
