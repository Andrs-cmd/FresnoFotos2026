const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const path = require("path");

// 🔧 Configuración de S3 usando variables del .env
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

// 🔧 Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
  }
};

// 🔧 Storage de multer con S3
const storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    try {
      if (!req.user || !req.user.slug) {
        return cb(new Error("Usuario no autorizado"), false);
      }

      // 🔥 Elegir subcarpeta según tipo si viene en req.body.type
      // Si no viene, por defecto "original"
      const type = req.body.type || "original"; // puede ser original, thumb, preview
      const ext = path.extname(file.originalname);

      const filename =
        `${req.user.slug}/${type}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      cb(null, filename);
    } catch (error) {
      cb(error, false);
    }
  },
});

// 🔧 Configuración final de multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

module.exports = { upload };
