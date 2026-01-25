const Sale = require("../models/Sale");

/* =========================================
   📊 DASHBOARD STATS
========================================= */
const getDashboardStats = async (req, res) => {
  try {
    const sales = await Sale.find();

    const totalSales = sales.length;
    const totalPhotos = sales.reduce(
      (acc, sale) => acc + sale.totalPhotos,
      0
    );
    const totalRevenue = sales.reduce(
      (acc, sale) => acc + sale.totalPrice,
      0
    );

    const lastSales = await Sale.find()
      .populate("photographer", "name slug")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalSales,
      totalPhotos,
      totalRevenue,
      lastSales
    });
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    res.status(500).json({
      message: "Error al cargar estadísticas"
    });
  }
};

module.exports = {
  getDashboardStats
};
