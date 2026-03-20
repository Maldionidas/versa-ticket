const express = require("express");
const router = express.Router();

const catalogosController = require("../controllers/catalogosController");

// endpoints
router.get("/areas", catalogosController.getAreas);
router.get("/prioridades", catalogosController.getPrioridades);
router.get("/estados", catalogosController.getEstados);
router.get("/categorias", catalogosController.getCategorias);
router.get("/categorias/:area_id", catalogosController.getCategoriasByArea);
router.get("/roles", catalogosController.getRoles);

module.exports = router;