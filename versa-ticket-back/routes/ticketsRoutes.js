const express = require("express");
const router = express.Router();
const ticketsController = require("../controllers/ticketsController");

router.get("/ticket", ticketsController.getTickets);
router.post("/", ticketsController.createTicket);

module.exports = router;