const Sale = require("../models/Sale");
const Photo = require("../models/Photo");
const User = require("../models/User"); // Fotógrafo es un User

/* =========================================
   🛒 CREAR VENTA (desde galería / WhatsApp)
========================================= */
const createSale = async (req, res) => {
  try {
    const {
      photographerSlug,
      photoIds,
      quantity = 1,
      promo,
      unitPrice,
      totalPrice,
      source
    } = req.body;

    // 🛑 Validaciones mínimas
    if (!photographerSlug || !photoIds || photoIds.length === 0) {
      return res.status(400).json({
        message: "Datos incompletos para crear la venta"
      });
    }

    // ✅ Verificar que las fotos existan
    const validPhotos = await Photo.find({
      _id: { $in: photoIds }
    });

    if (validPhotos.length === 0) {
      return res.status(404).json({
        message: "Las fotos no existen"
      });
    }

    // ✅ Obtener el fotógrafo por slug y role
    const photographer = await User.findOne({
      slug: photographerSlug,
      role: "fotografo"
    });

    if (!photographer) {
      return res.status(404).json({
        message: "Fotógrafo no encontrado"
      });
    }

    // 🔢 CALCULAR PRECIOS DE FORMA SEGURA
    const finalUnitPrice = unitPrice || 1000; // precio base por defecto
    const finalQuantity = quantity || validPhotos.length;

    const calculatedTotal =
      totalPrice || finalUnitPrice * finalQuantity;

    // ✅ Crear venta como PENDIENTE
    const sale = await Sale.create({
      photographer: photographer._id,
      photos: validPhotos.map((p) => p._id),
      quantity: finalQuantity,
      totalPhotos: validPhotos.length,
      promoLabel: promo || null,
      unitPrice: finalUnitPrice,
      totalPrice: calculatedTotal,
      status: "pending",
      source: source || "web"
    });

    res.status(201).json({
      message: "Venta registrada correctamente",
      sale
    });
  } catch (error) {
    console.error("❌ Error creando venta:", error);
    res.status(500).json({
      message: "Error al registrar la venta",
      error: error.message
    });
  }
};

/* =========================================
   📊 TODAS LAS VENTAS (ADMIN)
========================================= */
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("photographer", "name email slug")
      .populate("photos", "_id imageUrl thumbUrl title")
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    console.error("❌ Error obteniendo ventas:", error);
    res.status(500).json({
      message: "Error al obtener ventas",
      error: error.message
    });
  }
};

module.exports = {
  createSale,
  getAllSales
};