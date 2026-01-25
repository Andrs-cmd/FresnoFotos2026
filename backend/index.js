const path = require("path");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");

const authRoutes = require("./routes/auth.routes");
const photoRoutes = require("./routes/photoRoutes");
const { protect } = require("./middleware/auth.middleware");
const isAdmin = require("./middleware/isAdmin");

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================
   VALIDACIÓN ENV
===================== */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI no definido");
  process.exit(1);
}

/* =====================
   CORS (PRODUCCIÓN)
   ✔️ Frontend real
   ✔️ Uploads
   ✔️ Auth
===================== */
const allowedOrigins = [
  "https://fresnofotos.com",
  "https://www.fresnofotos.com"
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ]
}));

// ✅ PRE-FLIGHT (clave para uploads)
app.options("*", cors());

/* =====================
   MIDDLEWARES
===================== */
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

/* =====================
   STATIC FILES
===================== */
app.use("/images", express.static(path.join(__dirname, "public/images")));

/* =====================
   ROUTES
===================== */
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);

/* =====================
   HEALTH CHECK
===================== */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
});

/* =====================
   ADMIN DOWNLOAD
===================== */
app.get(
  "/api/admin/photos/image/original/:filename",
  protect,
  isAdmin,
  (req, res) => {
    const filePath = path.join(
      __dirname,
      "uploads",
      "original",
      req.params.filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    res.download(filePath);
  }
);

/* =====================
   404
===================== */
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

/* =====================
   MONGODB + SERVER
===================== */
const safeUri = process.env.MONGO_URI.replace(/\/\/.*@/, "//<user>:<pass>@");
console.log("🔗 Conectando a MongoDB:", safeUri);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🟢 MongoDB conectado");

    // ⚠️ localhost → SOLO accesible por Nginx
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`🚀 Backend corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error MongoDB:", err.message);
    process.exit(1);
  });
