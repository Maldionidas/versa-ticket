require("dotenv").config();

const express = require("express");
const cors = require("cors");  // <-- 1. IMPORTAR CORS
const ticketsController = require("./controllers/ticketsController");
const authRoutes = require("./routes/authRoutes");

const app = express();

// 2. MIDDLEWARES (el orden importa)
app.use(cors());  // <-- HABILITA CORS (permite peticiones desde otros puertos)
app.use(express.json()); // Para parsear JSON

// 3. RUTAS
app.use("/api/auth", authRoutes);
app.get("/tickets", ticketsController.getTickets);
app.post("/tickets", ticketsController.createTicket);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});