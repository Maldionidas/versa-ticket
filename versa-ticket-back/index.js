require("dotenv").config();

const express = require("express");
const ticketsRoutes = require("./routes/ticketsRoutes");
const catalogosRoutes = require("./routes/catalogosRoutes");
const usersRoutes = require("./routes/usersRoutes");
const fakeAuth = require("./middleware/fakeAuth");
const areasRoutes = require("./routes/areasRouter");
const rolesRoutes = require("./routes/rolesRouter");

const app = express();
const cors = require("cors");

app.use(fakeAuth);
app.use(express.json());
app.use(cors());
//endpoints
app.use("/api/tickets", ticketsRoutes);
app.use("/api/catalogos", catalogosRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/areas", areasRoutes);
app.use("/api/roles", rolesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});