const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ticketsController = require("../controllers/ticketsController");
const { verifyToken, hasPermission } = require("../middlewares/authMiddleware");

// 1. Configuramos Multer para guardar físicamente en la carpeta 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 🔒 2. EL CANDADO PRINCIPAL DEBE IR PRIMERO
// Al ponerlo aquí, TODAS las rutas de abajo exigirán que el usuario tenga un token válido.
router.use(verifyToken);

// RUTAS DE LECTURA 
router.get("/assigned", ticketsController.getAssignedTickets);
router.get("/", ticketsController.getTickets);
router.get("/:id", ticketsController.getTicketById);

// 🚀 3. CREACIÓN DE TICKETS (Fusionada)
// Agregamos el middleware de Multer a tu ruta original
router.post("/", upload.array('archivos', 5), ticketsController.createTicket); 

// ACTUALIZACIÓN Y ELIMINACIÓN DE TICKETS (Requieren permisos específicos)
router.put("/:id", hasPermission("tickets", "update"), ticketsController.updateTicket);
router.delete("/:id", hasPermission("tickets", "delete"), ticketsController.deleteTicket);

module.exports = router;