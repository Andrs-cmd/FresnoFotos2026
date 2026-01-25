const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/isAdmin");

const {
  getAllPhotos,
  deletePhoto,
  getOriginalPhoto, // ✅ controller correcto
} = require("../controllers/admin.photos.controller");

/* ===============================
   📸 TODAS LAS FOTOS (ADMIN)
=============================== */
router.get("/", protect, isAdmin, getAllPhotos);

/* ===============================
   🖼️ OBTENER IMAGEN ORIGINAL (ADMIN)
   👉 sirve para preview + descarga
=============================== */
router.get("/:id/original", protect, isAdmin, getOriginalPhoto);

/* ===============================
   🗑️ ELIMINAR FOTO (ADMIN)
=============================== */
router.delete("/:id", protect, isAdmin, deletePhoto);

module.exports = router;
