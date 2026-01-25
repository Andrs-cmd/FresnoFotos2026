const Photo = require("../models/Photo");
const User = require("../models/User");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const s3 = require("../middleware/s3"); // configuración AWS S3

/* =====================================================
   🔓 GALERÍA PÚBLICA (SOLO THUMB)
===================================================== */
const getPhotosByPhotographer = async (req, res) => {
  try {
    const { slug } = req.params;

    const photographer = await User.findOne({ slug });
    if (!photographer) {
      return res.status(404).json({ message: "Fotógrafo no encontrado" });
    }

    const photos = await Photo.find({
      photographer: photographer._id,
      isPublic: true
    })
      .select("_id thumbUrl sessionDate")
      .sort({ sessionDate: -1, createdAt: -1 });

    res.json(photos);
  } catch (error) {
    console.error("❌ getPhotosByPhotographer:", error);
    res.status(500).json({ message: "Error al obtener fotos" });
  }
};

/* =====================================================
   🔓 PREVIEW PÚBLICO (CON WATERMARK)
===================================================== */
const getPhotoPreview = async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await Photo.findById(id).select("imageUrl");
    if (!photo) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    res.json({
      imageUrl: photo.imageUrl
    });
  } catch (error) {
    console.error("❌ getPhotoPreview:", error);
    res.status(500).json({ message: "Error al obtener preview" });
  }
};

/* =====================================================
   🔐 MIS FOTOS
===================================================== */
const getMyPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({
      photographer: req.user.id
    }).sort({ createdAt: -1 });

    res.json(photos);
  } catch (error) {
    console.error("❌ getMyPhotos:", error);
    res.status(500).json({ message: "Error al obtener mis fotos" });
  }
};

/* =====================================================
   🔐 SUBIDA DIRECTA A S3
===================================================== */
const createPhoto = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Se requieren imágenes" });
    }

    const { title, price, sessionDate } = req.body;
    if (!sessionDate) {
      return res.status(400).json({ message: "Fecha requerida" });
    }

    const fixedSessionDate = new Date(`${sessionDate}T12:00:00`);

    const watermarkPath = path.join(process.cwd(), "assets", "watermark.png");
    if (!fs.existsSync(watermarkPath)) {
      throw new Error("❌ Watermark no encontrada");
    }

    const photosToInsert = [];

    for (const file of req.files) {
      const timestamp = Date.now();

      /* ---------- ORIGINAL ---------- */
      const originalKey = `${req.user.slug}/original/${timestamp}-${file.originalname}`;

      await s3.putObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: originalKey,
        Body: file.buffer,
        ACL: "public-read",
        ContentType: file.mimetype
      }).promise();

      /* ---------- THUMB ---------- */
      const thumbBuffer = await sharp(file.buffer)
        .resize({ width: 500 })
        .webp({ quality: 65 })
        .toBuffer();

      const thumbKey = `${req.user.slug}/thumb/${timestamp}.webp`;

      await s3.putObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: thumbKey,
        Body: thumbBuffer,
        ACL: "public-read",
        ContentType: "image/webp"
      }).promise();

      /* ---------- PREVIEW CON WATERMARK ---------- */
      const baseBuffer = await sharp(file.buffer)
        .resize({ width: 600, kernel: "nearest" })
        .jpeg({ quality: 45 })
        .toBuffer();

      const watermarkBuffer = await sharp(watermarkPath)
        .resize({ width: 300 })
        .toBuffer();

      const previewBuffer = await sharp(baseBuffer)
        .composite([
          {
            input: watermarkBuffer,
            tile: true,
            blend: "over",
            opacity: 0.4
          }
        ])
        .jpeg({ quality: 45 })
        .toBuffer();

      const previewKey = `${req.user.slug}/preview/${timestamp}.jpg`;

      await s3.putObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: previewKey,
        Body: previewBuffer,
        ACL: "public-read",
        ContentType: "image/jpeg"
      }).promise();

      photosToInsert.push({
        photographer: req.user.id,
        thumbUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${thumbKey}`,
        imageUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${previewKey}`,
        originalUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${originalKey}`,
        title: title || "",
        price: price || 0,
        sessionDate: fixedSessionDate,
        isPublic: true
      });
    }

    const createdPhotos = await Photo.insertMany(photosToInsert);

    res.status(201).json({
      message: "Fotos subidas correctamente a S3",
      photos: createdPhotos
    });
  } catch (error) {
    console.error("❌ createPhoto:", error);
    res.status(500).json({ message: "Error al subir fotos" });
  }
};

/* =====================================================
   🗑️ ELIMINAR FOTO DE S3
===================================================== */
const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    if (photo.photographer.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const extractKey = (url) =>
      url.split(`${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/`)[1];

    const keysToDelete = [
      photo.thumbUrl,
      photo.imageUrl,
      photo.originalUrl
    ]
      .filter(Boolean)
      .map(extractKey);

    if (keysToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: process.env.AWS_BUCKET_NAME,
        Delete: {
          Objects: keysToDelete.map((Key) => ({ Key }))
        }
      }).promise();
    }

    await photo.deleteOne();

    res.json({ message: "Foto eliminada correctamente de S3" });
  } catch (error) {
    console.error("❌ deletePhoto:", error);
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
