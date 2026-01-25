const config = {
  // Entorno de desarrollo
  development: {
    port: 4000,
    apiUrl: 'http://localhost:4000',
    frontendUrl: 'http://localhost:3000',
    corsOrigin: 'http://localhost:3000',
    uploadPath: './uploads'
  },
  
  // Entorno de producción (AWS)
  production: {
    port: process.env.PORT || 4000,
    apiUrl: process.env.API_URL || 'http://tu-ip-o-dominio.com',
    frontendUrl: process.env.FRONTEND_URL || 'http://tu-frontend.com',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    uploadPath: process.env.UPLOAD_PATH || '/var/www/uploads'
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];