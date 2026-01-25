import express from "express";
import Photo from "../models/Photo.js";
import User from "../models/User.js";
import verifyToken from "../middlewares/verifyToken.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* =====================================================
   🔓 GALERÍA PÚBLICA POR FOTÓGRAFO
===================================================== */
router.get("/by-photographer/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const photographer = await User.findOne({ slug });
    if (!photographer) {
      return res.status(404).json({ message: "Fotógrafo no encontrado" });
    }

    const photos = await Photo.find({
      photographer: photographer._id,
      isPublic: true
    }).sort({
      sessionDate: -1,
      createdAt: -1
    });

    res.json(photos);
  } catch (error) {
    console.error("❌ Public gallery:", error);
    res.status(500).json({ message: "Error al obtener fotos" });
  }
});

/* =====================================================
   🔐 SUBIR UNA O VARIAS FOTOS (FOTÓGRAFO)
===================================================== */
router.post(
  "/",
  verifyToken,
  upload.array("images", 50), // 👈 subida múltiple
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Se requieren imágenes" });
      }

      const { title, price, sessionDate } = req.body;

      if (!sessionDate) {
        return res
          .status(400)
          .json({ message: "La fecha de la sesión es obligatoria" });
      }

      const fixedSessionDate = new Date(`${sessionDate}T12:00:00`);

      const photosToInsert = req.files.map((file) => ({
        photographer: req.user.id,
        imageUrl: `/uploads/${req.user.slug}/original/${file.filename}`,
        thumbUrl: `/uploads/${req.user.slug}/thumbs/${file.filename}`,
        title: title || "",
        price: price || 0,
        sessionDate: fixedSessionDate,
        isPublic: true
      }));

      const createdPhotos = await Photo.insertMany(photosToInsert);

      res.status(201).json({
        message: "📸 Fotos subidas correctamente",
        photos: createdPhotos
      });
    } catch (error) {
      console.error("❌ Upload photos:", error);
      res.status(500).json({ message: "Error al subir fotos" });
    }
  }
);

/* =====================================================
   🔐 MIS FOTOS (FOTÓGRAFO LOGUEADO)
===================================================== */
router.get("/my", verifyToken, async (req, res) => {
  try {
    const photos = await Photo.find({
      photographer: req.user.id
    }).sort({
      sessionDate: -1,
      createdAt: -1
    });

    res.json(photos);
  } catch (error) {
    console.error("❌ My photos:", error);
    res.status(500).json({ message: "Error al obtener fotos" });
  }
});

/* =====================================================
   🔐 ELIMINAR FOTO
===================================================== */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    if (photo.photographer.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await photo.deleteOne();
    res.json({ message: "🗑️ Foto eliminada" });
  } catch (error) {
    console.error("❌ Delete photo:", error);
    res.status(500).json({ message: "Error al eliminar foto" });
  }
});

export default router;
