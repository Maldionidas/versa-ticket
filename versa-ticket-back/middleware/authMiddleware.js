export const isAdmin = (req, res, next) => {
  const rol = req.headers["x-role"]

  if (!rol) {
    return res.status(401).json({ message: "No autorizado" })
  }

  if (rol !== "Admin") {
    return res.status(403).json({ message: "Acceso denegado" })
  }

  next()
}