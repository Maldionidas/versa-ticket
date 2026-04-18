const express = require('express');
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const statusController = require("../controllers/statusController");

router.use(verifyToken);

router.get('/', statusController.getAllStatuses);
router.put('/ticket/:id', statusController.updateTicketStatus);

module.exports = router;