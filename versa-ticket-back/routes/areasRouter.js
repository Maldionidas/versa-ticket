// areasRouter.js
const express = require("express")
const router = express.Router()

const areasController = require("../controllers/areasController")
const { hasPermission } = require("../middleware/authMiddleware")

router.get("/", hasPermission("areas", "read"), areasController.getAreas)
router.post("/", hasPermission("areas", "create"), areasController.createArea)
router.put("/:id", hasPermission("areas", "update"), areasController.updateArea)
router.delete("/:id", hasPermission("areas", "delete"), areasController.deleteArea)

module.exports = router