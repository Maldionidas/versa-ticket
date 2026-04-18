// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const ticketsRoutes = require("./routes/ticketsRoutes");
const catalogosRoutes = require("./routes/categoriasRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const statsRoutes = require("./routes/statsRoutes");  // ✅ CORREGIDO: statsRoutes no statusRoutes
const rolesRoutes = require("./routes/rolesRoutes");
const areasRouter = require("./routes/areasRouter");
const categoriasRouter = require("./routes/categoriasRoutes");
const estadosRoutes = require("./routes/estadosRoutes");
const prioridadesRoutes = require("./routes/prioridadesRoutes");
const commentsRoutes = require('./routes/commentsRoutes');

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ message: "API Versa Ticket funcionando" });
});

// Rutas de la API
app.use("/api/prioridades", prioridadesRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/areas", areasRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/roles", rolesRoutes); 
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/catalogos", catalogosRoutes);
app.use("/api/stats", statsRoutes);  // ✅ CORREGIDO
app.use("/api/comments", commentsRoutes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});