const path = require("path");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");

const authRoutes = require("./routes/auth.routes");
const photoRoutes = require("./routes/photoRoutes");
const adminRoutes = require("./routes/admin.routes");
const salesRoutes = require("./routes/sale.routes");
const adminPhotosRoutes = require("./routes/admin.photos.routes");

const app = express();
const PORT = process.env.PORT || 5000; 

const IS_PRODUCTION = process.env.NODE_ENV === "production";

console.log("🚀 Iniciando FresnoFotos API");

/* =====================
    CORS ACTUALIZADO
===================== */
const allowedOrigins = [
  "https://fresnofotos.com",
  "https://www.fresnofotos.com",
  "https://api.fresnofotos.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || !IS_PRODUCTION) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* =====================
    MIDDLEWARES
===================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =====================
    📂 SERVIR ARCHIVOS ESTÁTICOS (ESTO FALTABA)
===================== */
// Hacemos pública la carpeta de subidas para que se puedan ver las fotos
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));
console.log("📁 Fotos servidas desde:", uploadsPath);

/* =====================
    ROUTES
===================== */
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/admin/photos", adminPhotosRoutes);

app.get("/api/health", (req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? "healthy" : "unhealthy",
    dbState: mongoose.connection.readyState,
  });
});

app.get("/", (_, res) => {
  res.json({ app: "FresnoFotos API", status: "OK", localMode: !IS_PRODUCTION });
});

/* =====================
    DATABASE CONNECTION
===================== */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://db:27017/fresnofotos";
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("🟢 MongoDB conectado exitosamente");
  } catch (err) {
    console.error("🔴 Error MongoDB:", err.message);
    setTimeout(connectDB, 5000);
  }
};

/* =====================
    SERVER START
===================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API escuchando en puerto ${PORT}`);
  connectDB();
});

/* =====================
    ERROR HANDLERS
===================== */
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS bloqueado localmente" });
  }
  console.error("❌ Error detectado:", err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});