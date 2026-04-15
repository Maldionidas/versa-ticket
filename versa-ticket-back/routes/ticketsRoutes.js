const express = require("express");
const router = express.Router();

const ticketsController = require("../controllers/ticketsController");
const { verifyToken, hasPermission } = require("../middlewares/auth");

//equieren autenticación
router.use(verifyToken);

// RUTAS DE LECTURA 
router.get("/assigned", ticketsController.getAssignedTickets);
router.get("/", ticketsController.getTickets);
router.get("/:id", ticketsController.getTicketById);

// CREACIÓN DE TICKETS
router.post("/", ticketsController.createTicket); 
// RUTAS PROTEGIDAS CON RBAC (Solo personal autorizado)
router.put("/:id", hasPermission("tickets", "update"), ticketsController.updateTicket);
router.delete("/:id", hasPermission("tickets", "delete"), ticketsController.deleteTicket);

module.exports = router;