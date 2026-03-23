module.exports = (req, res, next) => {
  req.user = {
    id: 1,
    nombre: "Admin",
    permisos: {
      admin: true,
      users: { read: true, create: true, update: true, delete: true }
    }
  }

  next()
}