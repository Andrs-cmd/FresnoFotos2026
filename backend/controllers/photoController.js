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
    🔓 GALERÍA PÚBLICA (Incluye imageUrl)
===================================================== */
const getPhotosByPhotographer = async (req, res) => {
  try {
    const { slug } = req.params;
    const photographer = await User.findOne({ slug });
    if (!photographer) return res.status(404).json({ message: "Fotógrafo no encontrado" });

    const photos = await Photo.find({ photographer: photographer._id, isPublic: true })
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
    if (!photo) return res.status(404).json({ message: "Foto no encontrada" });
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
    const photos = await Photo.find({ photographer: req.user.id }).sort({ createdAt: -1 });
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
    const fixedSessionDate = sessionDate ? new Date(`${sessionDate}T12:00:00`) : new Date();
    
    const watermarkPath = path.join(process.cwd(), "assets", "watermark.png");
    const photosToInsert = [];
    const slug = req.user.slug;

    for (const file of req.files) {
      const timestamp = Date.now();
      const filenameBase = `${timestamp}-${Math.round(Math.random() * 1e4)}`;

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
      const originalFinalPath = path.join(paths.original, originalFileName);
      fs.renameSync(file.path, originalFinalPath);

      /* ---------- 2. GENERAR THUMB ---------- */
      const thumbFileName = `${filenameBase}.webp`;
      const thumbFinalPath = path.join(paths.thumb, thumbFileName);
      
      await sharp(originalFinalPath)
        .resize({ width: 500 })
        .webp({ quality: 80 })
        .toFile(thumbFinalPath);

      /* ---------- 3. PREVIEW PROTEGIDO (PIXELADO + MOSAICO WATERMARK) ---------- */
      const previewFileName = `${filenameBase}.jpg`;
      const previewFinalPath = path.join(paths.preview, previewFileName);

      // Mantenemos el tamaño pequeño para forzar el pixelado en el modal
      const baseSharp = sharp(originalFinalPath).resize({ width: 800 });
      
      try {
        if (fs.existsSync(watermarkPath)) {
          // Redimensionamos la marca de agua a un tamaño pequeño para que al repetirse
          // cree un patrón de rejilla tupido
          const watermarkBuffer = await sharp(watermarkPath)
            .resize({ width: 200 }) 
            .toBuffer();

          await baseSharp
            .composite([{ 
                input: watermarkBuffer, 
                tile: true,        // 🚩 ESTO HACE QUE SE REPITA POR TODA LA IMAGEN
                blend: "over", 
                opacity: 0.6       // 🚩 Opacidad visible pero que deja ver la foto abajo
            }])
            // Bajamos calidad para mantener el pixelado y ruido
            .jpeg({ quality: 25, chromaSubsampling: '4:2:0' })
            .toFile(previewFinalPath);
        } else {
          await baseSharp.jpeg({ quality: 20 }).toFile(previewFinalPath);
        }
      } catch (sharpError) {
        console.error("❌ Error en Sharp Composite:", sharpError.message);
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
        isPublic: true
      });
    }

    const createdPhotos = await Photo.insertMany(photosToInsert);
    res.status(201).json({ message: "Fotos procesadas con protección visual total", photos: createdPhotos });

  } catch (error) {
    console.error("❌ createPhoto Error Crítico:", error);
    res.status(500).json({ message: "Error al procesar las imágenes" });
  }
};

/* =====================================================
    🗑️ ELIMINAR FOTO (LOCAL)
===================================================== */
const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Foto no encontrada" });

    if (photo.photographer.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const fileUrls = [photo.thumbUrl, photo.imageUrl, photo.originalUrl];
    fileUrls.forEach(url => {
      if (url) {
        const relativePath = url.startsWith('/') ? url.substring(1) : url;
        const fullPath = path.join(process.cwd(), relativePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    });

    await photo.deleteOne();
    res.json({ message: "Foto y archivos eliminados correctamente" });
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
  deletePhoto
};