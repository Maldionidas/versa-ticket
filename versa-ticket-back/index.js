require("dotenv").config();

const express = require("express");
const ticketsRoutes = require("./routes/ticketsRoutes");
const catalogosRoutes = require("./routes/catalogosRoutes");
const usersRoutes = require("./routes/usersRoutes");
  
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());
//endpoints
app.use("/api/tickets", ticketsRoutes);
app.use("/api/catalogos", catalogosRoutes);
app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});