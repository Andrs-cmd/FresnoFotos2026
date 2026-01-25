const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/isAdmin");

const {
  createSale,
  getAllSales
} = require("../controllers/sale.controller");

/* 🛒 CREAR VENTA (PÚBLICO / CLIENTE)
   Se usa cuando el cliente toca "Comprar" en la galería
*/
router.post("/", createSale);

/* 📊 VER TODAS LAS VENTAS (ADMIN)
   Panel de administración
*/
router.get("/", protect, isAdmin, getAllSales);

module.exports = router;
