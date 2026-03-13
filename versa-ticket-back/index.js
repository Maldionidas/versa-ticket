require("dotenv").config();

const express = require("express");
const ticketsController = require("./controllers/ticketsController");
  
const app = express();
app.use(express.json());

app.get("/tickets", ticketsController.getTickets);
app.post("/tickets", ticketsController.createTicket);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});