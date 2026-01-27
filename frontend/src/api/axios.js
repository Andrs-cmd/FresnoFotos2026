import axios from "axios";

// 🛠️ DETECCIÓN DE ENTORNO:
// Si estamos en localhost, usamos '/api' para que el proxy de Vite lo mande al backend de Docker.
// Si no, usamos la variable de entorno de producción.
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal ? "/api" : import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔑 Importante para enviar cookies/sesiones
});

// 👉 Interceptor para enviar el token automáticamente en los headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// 👉 Interceptor para manejar respuestas globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo de errores globales (ej: logout si el token expira - 401)
    if (error.response && error.response.status === 401) {
      // Solo redirigir si no estamos ya en la página de login para evitar bucles
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;