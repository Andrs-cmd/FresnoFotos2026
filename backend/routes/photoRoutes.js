console.log("📸 photoRoutes.js CARGADO");

const express = require("express");
const router = express.Router();

/* =====================================================
   📦 CONTROLLER
===================================================== */
const photoController = require("../controllers/photoController");

// 🔒 Handlers seguros (EVITA undefined)
const {
  getPhotosByPhotographer,
  getPhotoPreview,
  getMyPhotos,
  createPhoto,
  deletePhoto
} = photoController;

/* =====================================================
   🔐 MIDDLEWARES
===================================================== */
const { protect, onlyFotografo } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload");

/* =====================================================
   🛡️ GUARD (ANTI-CRASH)
===================================================== */
function ensureFn(fn, name) {
  if (typeof fn !== "function") {
    console.error(`❌ photoController.${name} NO está definido`);
    return (req, res) =>
      res.status(501).json({
        error: `Handler ${name} no implementado`
      });
  }
  return fn;
}

/* =====================================================
   🔍 RUTAS DE PRUEBA
===================================================== */

router.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "Ruta /api/photos funcionando"
  });
});

router.get("/test-protect", protect, (req, res) => {
  res.json({
    ok: true,
    user: req.user
  });
});

/* =====================================================
   🔓 RUTAS PÚBLICAS
===================================================== */

/**
 * Galería pública (solo thumbnails)
 */
router.get(
  "/by-photographer/:slug",
  ensureFn(getPhotosByPhotographer, "getPhotosByPhotographer")
);

/**
 * Preview grande con watermark
 */
router.get(
  "/preview/:id",
  ensureFn(getPhotoPreview, "getPhotoPreview")
);

/* =====================================================
   🔐 RUTAS PRIVADAS (FOTÓGRAFO)
===================================================== */

/**
 * Mis fotos (dashboard)
 */
router.get(
  "/my",
  protect,
  ensureFn(getMyPhotos, "getMyPhotos")
);

/**
 * Subida múltiple de fotos
 */
router.post(
  "/",
  protect,
  onlyFotografo,
  upload.array("images", 50),
  ensureFn(createPhoto, "createPhoto")
);

/**
 * Eliminar foto
 */
router.delete(
  "/:id",
  protect,
  ensureFn(deletePhoto, "deletePhoto")
);

module.exports = router;
