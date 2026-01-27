import axios from "axios";

/**
 * 🛠️ CONFIGURACIÓN DE AXIOS
 * Usamos "/api" como ruta base.
 * - En Desarrollo (Vite): El proxy de vite.config.js redirige /api a http://api_backend:5000
 * - En Producción (Nginx): Nginx redirige fresnofotos.com/api a tu contenedor backend.
 */
const api = axios.create({
  baseURL: "/api", 
  withCredentials: true, // 🔑 Necesario para cookies de sesión si las usas
});

// 👉 Interceptor: Adjuntar Token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 👉 Interceptor: Manejo de errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor responde 401 (No autorizado/Token expirado)
    if (error.response && error.response.status === 401) {
      // Evitamos bucle infinito si ya estamos en la página de login
      if (!window.location.pathname.includes("/login")) {
        console.warn("Sesión expirada o inválida. Redirigiendo a login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;