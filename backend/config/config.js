const config = {
  development: {
    port: 4000,
    apiUrl: "http://localhost:4000",
    frontendUrl: "http://localhost:3000",
    corsOrigin: "http://localhost:3000",
    uploadPath: "./uploads",
    mongoUri: "TU_URI_DE_MONGODB"
  },

  production: {
    port: process.env.PORT || 4000,
    apiUrl: process.env.API_URL,
    frontendUrl: process.env.FRONTEND_URL,
    corsOrigin: process.env.CORS_ORIGIN || "*",
    uploadPath: process.env.UPLOAD_PATH || "/var/www/uploads",
    mongoUri: process.env.MONGO_URI
  }
};

const env = process.env.NODE_ENV || "development";
module.exports = config[env];
