const express = require("express");
const router = express.Router();
const rolesController = require("../controllers/rolesController");
const { hasPermission } = require("../middleware/authMiddleware");

router.get("/", hasPermission("roles", "read"), rolesController.getRoles);
router.post("/", hasPermission("roles", "create"), rolesController.createRole);
router.put("/:id", hasPermission("roles", "update"), rolesController.updateRole);
router.delete("/:id", hasPermission("roles", "delete"), rolesController.deleteRole);

module.exports = router;