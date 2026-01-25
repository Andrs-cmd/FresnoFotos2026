const jwt = require("jsonwebtoken");

/* =====================================================
   🔐 PROTEGER RUTAS (AUTH GENERAL)
===================================================== */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token requerido"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded contiene: { id, role, slug }
    req.user = {
      id: decoded.id,
      role: decoded.role,
      slug: decoded.slug
    };

    next();
  } catch (error) {
    console.error("❌ JWT error:", error);
    return res.status(401).json({
      message: "Token inválido"
    });
  }
};

/* =====================================================
   🎯 SOLO FOTÓGRAFOS
===================================================== */
const onlyFotografo = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "No autenticado"
    });
  }

  if (req.user.role !== "fotografo") {
    return res.status(403).json({
      message: "Solo fotógrafos pueden subir fotos"
    });
  }

  next();
};

/* =====================================================
   🛡️ SOLO ADMIN
===================================================== */
const onlyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "No autenticado"
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Acceso solo para administradores"
    });
  }

  next();
};

/* =====================================================
   ✅ EXPORTS CORRECTOS
===================================================== */
module.exports = {
  protect,
  onlyFotografo,
  onlyAdmin
};
