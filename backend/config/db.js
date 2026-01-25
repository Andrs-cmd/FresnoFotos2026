// ./config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("❌ No se encontró MONGO_URI en process.env");
      process.exit(1);
    }

    // Log seguro (oculta usuario/contraseña)
    const safeUri = mongoUri.replace(/\/\/.*@/, "//<usuario>:<password>@");
    console.log("🔗 Intentando conectar a MongoDB con URI:", safeUri);

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🟢 MongoDB conectado en host: ${conn.connection.host}, base de datos: ${conn.connection.name}`);
  } catch (error) {
    console.error("🔴 Error MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
