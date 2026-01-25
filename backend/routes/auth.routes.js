const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* =====================
   REGISTER
===================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    /* 1️⃣ Validación básica */
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Faltan datos obligatorios"
      });
    }

    /* 2️⃣ Validar rol */
    // 🔒 Roles oficiales del sistema
    const allowedRoles = ["client", "fotografo"];
    const userRole = allowedRoles.includes(role)
      ? role
      : "client";

    /* 3️⃣ Verificar si el email ya existe */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email ya registrado"
      });
    }

    /* 4️⃣ Hashear contraseña */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* 5️⃣ Generar slug único */
    let slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

    let baseSlug = slug;
    let counter = 1;

    while (await User.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    /* 6️⃣ Crear usuario */
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      slug
    });

    /* 7️⃣ Respuesta */
    res.status(201).json({
      message: "Usuario creado correctamente",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        slug: user.slug
      }
    });

  } catch (err) {
    console.error("❌ Error REGISTER:", err);
    res.status(500).json({
      message: "Error al registrar usuario",
      error: err.message
    });
  }
});

/* =====================
   LOGIN
===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* 1️⃣ Validación */
    if (!email || !password) {
      return res.status(400).json({
        message: "Faltan datos obligatorios"
      });
    }

    /* 2️⃣ Buscar usuario */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Credenciales inválidas"
      });
    }

    /* 3️⃣ Comparar contraseña */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Credenciales inválidas"
      });
    }

    /* 4️⃣ Generar token JWT */
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        slug: user.slug
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /* 5️⃣ Respuesta */
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        slug: user.slug
      }
    });

  } catch (err) {
    console.error("❌ Error LOGIN:", err);
    res.status(500).json({
      message: "Error en login",
      error: err.message
    });
  }
});

module.exports = router;
