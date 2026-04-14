const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ==========================================
// IMPORTACIÓN DE RUTAS
// ==========================================
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const ticketsRoutes = require("./routes/ticketsRoutes");
const catalogosRoutes = require("./routes/catalogosRoutes");
const areasRoutes = require("./routes/areasRouter");
const rolesRoutes = require("./routes/rolesRouter");
const categoriasRoutes = require("./routes/categoriasRoutes");
const camposRoutes = require("./routes/camposRoutes");

const app = express();

// MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

// Logging de todas las peticiones (El de tu compa, que es muy útil para debuggear)
app.use((req, res, next) => {
    console.log(`\n ${req.method} ${req.url}`);
    next();
});

// ENDPOINTS DE LA API
// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ message: "API Versa Ticket funcionando" });
});

// Autenticación (Pública)
app.use("/api/auth", authRoutes);

// Módulos protegidos con JWT (La protección está dentro de cada archivo de rutas)
app.use("/api/users", usersRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/catalogos", catalogosRoutes);
app.use("/api/areas", areasRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/campos", camposRoutes);


// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

// servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n Servidor corriendo en puerto ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
});