const Photo = require("../models/Photo");
const path = require("path");
const fs = require("fs");

/* =========================================
   📸 OBTENER TODAS LAS FOTOS (ADMIN)
========================================= */
const getAllPhotos = async (req, res) => {
  try {
    const photos = await Photo.find()
      .populate("photographer", "name email slug")
      .sort({ createdAt: -1 });

    const mapped = photos.map((photo) => ({
      _id: photo._id,
      title: photo.title,
      photographer: photo.photographer,

      imageUrl: photo.imageUrl,       // preview
      thumbUrl: photo.thumbUrl,
      originalUrl: photo.originalUrl, // 🔥 fuente única de verdad

      createdAt: photo.createdAt
    }));

    res.json(mapped);
  } catch (error) {
    console.error("❌ Error fotos admin:", error);
    res.status(500).json({ message: "Error obteniendo fotos" });
  }
};

/* =========================================
   🖼️ OBTENER ORIGINAL (ADMIN – SEGURO)
========================================= */
const getOriginalPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo || !photo.originalUrl) {
      return res.status(404).json({
        message: "Foto original no encontrada"
      });
    }

    // quitar "/" inicial
    const safeRelativePath = photo.originalUrl.replace(/^\/+/, "");

    const absolutePath = path.resolve(
      __dirname,
      "..",
      safeRelativePath
    );

    if (!fs.existsSync(absolutePath)) {
      console.error("❌ Archivo no existe:", absolutePath);
      return res.status(404).json({
        message: "Archivo original no existe"
      });
    }

    // headers correctos
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(absolutePath)}"`
    );
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.sendFile(absolutePath);
  } catch (error) {
    console.error("❌ Error obteniendo original:", error);
    res.status(500).json({ message: "Error obteniendo original" });
  }
};

/* =========================================
   ❌ ELIMINAR FOTO (ADMIN)
========================================= */
const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    const files = [
      photo.imageUrl,
      photo.originalUrl,
      photo.thumbUrl
    ].filter(Boolean);

    for (const file of files) {
      const rel = file.replace(/^\/+/, "");
      const abs = path.resolve(__dirname, "..", rel);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }

    await photo.deleteOne();

    res.json({ message: "Foto eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error eliminando foto:", error);
    res.status(500).json({ message: "Error al eliminar foto" });
  }
};

module.exports = {
  getAllPhotos,
  getOriginalPhoto,
  deletePhoto
};
