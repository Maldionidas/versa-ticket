// routes/ticketsRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { checkTicketNotClosed, checkTicketIsClosed } = require("../middlewares/ticketStatus");
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
} = require("../controllers/ticketsController");

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Rutas
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.put('/:id', checkTicketNotClosed, updateTicket);
router.delete('/:id', checkTicketIsClosed, deleteTicket);

module.exports = router;