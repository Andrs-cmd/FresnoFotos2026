module.exports = {
  apps: [
    {
      name: "photo-backend",
      script: "test-server.js",

      instances: 1,
      exec_mode: "fork",

      env: {
        NODE_ENV: "development",
      },

      env_production: {
        NODE_ENV: "production",

        PORT: 4000,

        API_URL: "https://api.fresnofotos.com",
        FRONTEND_URL: "https://fresnofotos.com",
        CORS_ORIGIN: "https://fresnofotos.com",

        MONGO_URI: "mongodb+srv://apradaweb_db_user:m3BR5vsUWBzQSRcB@photoapp.eb7kuvz.mongodb.net/photoapp?retryWrites=true&w=majority",

        JWT_SECRET: "photoapp_super_secret_123"
      }
    }
  ]
};
