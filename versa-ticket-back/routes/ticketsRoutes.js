// routes/ticketsRoutes.js
const express = require("express");
const router = express.Router();
const ticketsController = require("../controllers/ticketsController");
// ✅ CORREGIR
const { verifyToken } = require("../middlewares/auth");

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get("/assigned", ticketsController.getAssignedTickets);

router.get("/", ticketsController.getTickets);
router.get("/:id", ticketsController.getTicketById);
router.post("/", ticketsController.createTicket);
router.put("/:id", ticketsController.updateTicket);
router.delete("/:id", ticketsController.deleteTicket);


module.exports = router;