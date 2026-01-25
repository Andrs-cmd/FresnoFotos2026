const express = require("express");
const router = express.Router();

/* 🔐 Middlewares */
const { protect } = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/isAdmin");

/* 📊 Controller */
const { getDashboardStats } = require("../controllers/admin.controller");

/* =========================================
   📊 DASHBOARD ADMIN (REAL)
========================================= */
router.get(
  "/dashboard",
  protect,
  isAdmin,
  getDashboardStats
);

module.exports = router;
