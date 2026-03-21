const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares con logs
app.use(cors());
app.use(express.json());

// Logging de todas las peticiones
app.use((req, res, next) => {
    console.log(`\n🚀 ${req.method} ${req.url}`);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    next();
});

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const ticketsRoutes = require("./routes/ticketsRoutes");
const catalogosRoutes = require("./routes/catalogosRoutes");

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ message: "API Versa Ticket funcionando" });
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/catalogos", catalogosRoutes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});