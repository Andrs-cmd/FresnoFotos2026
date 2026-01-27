const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔧 Filtro de archivos (Mantenemos tu lógica original)
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

// 🔧 Configuración de almacenamiento local (DiskStorage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Verificamos que el usuario esté autenticado para usar su slug
      if (!req.user || !req.user.slug) {
        return cb(new Error("Usuario no autorizado para subir archivos"), false);
      }

      const photographerSlug = req.user.slug;
      const type = req.body.type || "original"; // original, thumb, preview
      
      // Definimos la ruta: uploads/slug/tipo
      const uploadPath = path.join(__dirname, "../uploads", photographerSlug, type);

      // 🔥 Crear la carpeta recursivamente si no existe
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // Generamos el nombre igual que antes para no romper la lógica de tu DB
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// 🔧 Configuración final de multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

module.exports = { upload };