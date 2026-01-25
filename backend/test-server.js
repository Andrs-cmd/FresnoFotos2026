const path = require("path");

// 🔧 Solo cargar dotenv en desarrollo
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.join(__dirname, ".env.development") });
}

console.log(">>> MONGO_URI:", process.env.MONGO_URI);
console.log("🚨 NODE_ENV:", process.env.NODE_ENV);
console.log("🚨 API_URL:", process.env.API_URL);
console.log("🚨 FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("🚨 CORS_ORIGIN:", process.env.CORS_ORIGIN);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const config = require("./config/config");

const authRoutes = require("./routes/auth.routes");
const photoRoutes = require("./routes/photoRoutes");
const adminRoutes = require("./routes/admin.routes");
const adminPhotosRoutes = require("./routes/admin.photos.routes");
const saleRoutes = require("./routes/sale.routes");

const app = express();

console.log("🚀 TEST SERVER LEVANTADO");

/* =====================================================
   🔧 CORS DEFINITIVO PRODUCCIÓN
   Solo permite tu dominio real y la IP del backend
===================================================== */
const allowedOrigins = [
  process.env.CORS_ORIGIN,                               // http://fresnofotos.com
  process.env.FRONTEND_URL,                              // http://fresnofotos.com
  `http://www.${process.env.CORS_ORIGIN?.split("://")[1]}`, // http://www.fresnofotos.com
  "http://18.228.87.21:3000"                             // IP backend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // permite curl/Postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log("❌ CORS bloqueado:", origin);
    return callback(new Error("CORS bloqueado: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

/* =====================================================
   🔧 MIDDLEWARES
===================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   📁 SERVIR IMÁGENES SOLO EN DEV
===================================================== */
if (process.env.NODE_ENV !== "production") {
  const uploadsPath = path.join(__dirname, "uploads");
  console.log("📂 Sirviendo imágenes desde:", uploadsPath);
  app.use("/uploads", express.static(uploadsPath));
}

/* =====================================================
   🔍 ENDPOINT DE PRUEBA
===================================================== */
app.get("/ping", (req, res) => {
  res.json({ ok: true, server: "test-server funcionando" });
});

/* =====================================================
   🗄️ DATABASE
===================================================== */
connectDB();

/* =====================================================
   🛣️ ROUTES
===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/photos", adminPhotosRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/admin/sales", saleRoutes);

/* =====================================================
   ❌ 404 HANDLER
===================================================== */
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada", path: req.originalUrl });
});

/* =====================================================
   🚀 SERVER
===================================================== */
const PORT = config.port || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en ${process.env.API_URL || `http://localhost:${PORT}`}`);
});
