const Photo = require("../models/Photo");
const User = require("../models/User");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

/**
 * Función auxiliar para asegurar que las carpetas existan
 */
const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/* =====================================================
    🔓 GALERÍA PÚBLICA
===================================================== */
const getPhotosByPhotographer = async (req, res) => {
  try {
    const { slug } = req.params;
    const photographer = await User.findOne({ slug });
    if (!photographer)
      return res.status(404).json({ message: "Fotógrafo no encontrado" });

    const photos = await Photo.find({
      photographer: photographer._id,
      isPublic: true,
    })
      .select("_id thumbUrl imageUrl sessionDate")
      .sort({ sessionDate: -1, createdAt: -1 });

    res.json(photos);
  } catch (error) {
    console.error("❌ Error en getPhotosByPhotographer:", error);
    res.status(500).json({ message: "Error al obtener fotos" });
  }
};

/* =====================================================
    🔓 PREVIEW PÚBLICO
===================================================== */
const getPhotoPreview = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id).select("imageUrl");
    if (!photo)
      return res.status(404).json({ message: "Foto no encontrada" });

    res.json({ imageUrl: photo.imageUrl });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener preview" });
  }
};

/* =====================================================
    🔐 MIS FOTOS
===================================================== */
const getMyPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({
      photographer: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener mis fotos" });
  }
};

/* =====================================================
    🔐 SUBIDA LOCAL CON PROCESAMIENTO (SHARP)
===================================================== */
const createPhoto = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Se requieren imágenes" });
    }

    const { title, price, sessionDate } = req.body;

    const fixedSessionDate = sessionDate
      ? new Date(`${sessionDate}T12:00:00`)
      : new Date();

    const watermarkPath = path.join(
      process.cwd(),
      "assets",
      "watermark.png"
    );

    const photosToInsert = [];
    const slug = req.user.slug;

    for (const file of req.files) {
      const timestamp = Date.now();
      const filenameBase = `${timestamp}-${Math.round(
        Math.random() * 1e4
      )}`;

      const baseDir = path.join(process.cwd(), "uploads", slug);
      const paths = {
        original: path.join(baseDir, "original"),
        thumb: path.join(baseDir, "thumb"),
        preview: path.join(baseDir, "preview"),
      };

      Object.values(paths).forEach(ensureDirectory);

      /* ---------- 1. MOVER ORIGINAL ---------- */
      const originalExt = path.extname(file.originalname);
      const originalFileName = `${filenameBase}${originalExt}`;
      const originalFinalPath = path.join(
        paths.original,
        originalFileName
      );

      fs.renameSync(file.path, originalFinalPath);

      /* ---------- 2. GENERAR THUMB ---------- */
      const thumbFileName = `${filenameBase}.webp`;
      const thumbFinalPath = path.join(
        paths.thumb,
        thumbFileName
      );

      await sharp(originalFinalPath)
        .resize({ width: 500 })
        .webp({ quality: 80 })
        .toFile(thumbFinalPath);

      /* ---------- 3. PREVIEW PROTEGIDO */
      const previewFileName = `${filenameBase}.jpg`;
      const previewFinalPath = path.join(
        paths.preview,
        previewFileName
      );

      try {
        const baseBuffer = await sharp(originalFinalPath)
          .rotate() // 👈 ESTO LEE Y APLICA LA ORIENTACIÓN EXIF
          .resize({ width: 800 })
          .jpeg({ quality: 25, chromaSubsampling: "4:2:0" })
          .toBuffer();

        if (fs.existsSync(watermarkPath)) {
          const baseMeta = await sharp(baseBuffer).metadata();
          const imageWidth = baseMeta.width;
          const imageHeight = baseMeta.height;

          // 🔥 ESCALADO CORRECTO (lado más corto)
          // 🔥 Queremos que ocupe hasta 90% pero sin romper dimensiones
const maxWatermarkWidth = Math.floor(imageWidth * 0.99);
const maxWatermarkHeight = Math.floor(imageHeight * 0.99);

const watermarkBuffer = await sharp(watermarkPath)
  .resize({
    width: maxWatermarkWidth,
    height: maxWatermarkHeight,
    fit: "inside", // 👈 NUNCA excede dimensiones
  })
  .ensureAlpha()
  .modulate({ opacity: 0.45 })
  .png()
  .toBuffer();

          const watermarkMeta = await sharp(
            watermarkBuffer
          ).metadata();

          const left = Math.floor(
            (imageWidth - watermarkMeta.width) / 2
          );
          const top = Math.floor(
            (imageHeight - watermarkMeta.height) / 2
          );

          await sharp(baseBuffer)
            .composite([
              {
                input: watermarkBuffer,
                top,
                left,
                blend: "over",
              },
            ])
            .jpeg({ quality: 25, chromaSubsampling: "4:2:0" })
            .toFile(previewFinalPath);
        } else {
          await sharp(baseBuffer).toFile(previewFinalPath);
        }
      } catch (sharpError) {
        console.error(
          "❌ Error en Sharp Composite:",
          sharpError.message
        );

        await sharp(originalFinalPath)
          .resize({ width: 600 })
          .jpeg({ quality: 20 })
          .toFile(previewFinalPath);
      }

      photosToInsert.push({
        photographer: req.user.id,
        thumbUrl: `/uploads/${slug}/thumb/${thumbFileName}`,
        imageUrl: `/uploads/${slug}/preview/${previewFileName}`,
        originalUrl: `/uploads/${slug}/original/${originalFileName}`,
        title: title || "",
        price: Number(price) || 0,
        sessionDate: fixedSessionDate,
        isPublic: true,
      });
    }

    const createdPhotos = await Photo.insertMany(
      photosToInsert
    );

    res.status(201).json({
      message: "Fotos procesadas correctamente",
      photos: createdPhotos,
    });
  } catch (error) {
    console.error("❌ createPhoto Error Crítico:", error);
    res
      .status(500)
      .json({ message: "Error al procesar las imágenes" });
  }
};

/* =====================================================
    🗑️ ELIMINAR FOTO
===================================================== */
const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo)
      return res.status(404).json({ message: "Foto no encontrada" });

    if (photo.photographer.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const fileUrls = [
      photo.thumbUrl,
      photo.imageUrl,
      photo.originalUrl,
    ];

    fileUrls.forEach((url) => {
      if (url) {
        const relativePath = url.startsWith("/")
          ? url.substring(1)
          : url;

        const fullPath = path.join(
          process.cwd(),
          relativePath
        );

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    });

    await photo.deleteOne();

    res.json({
      message: "Foto y archivos eliminados correctamente",
    });
  } catch (error) {
    console.error("❌ Error al eliminar foto:", error);
    res.status(500).json({ message: "Error al eliminar foto" });
  }
};

module.exports = {
  getPhotosByPhotographer,
  getPhotoPreview,
  getMyPhotos,
  createPhoto,
  deletePhoto,
};