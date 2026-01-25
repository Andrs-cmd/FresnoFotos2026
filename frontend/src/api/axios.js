import axios from "axios";

// ✅ Crear instancia de Axios apuntando al API de producción
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // URL del backend en producción
  withCredentials: true, // 🔑 importante para enviar cookies al backend
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
    // Aquí puedes manejar errores globales, por ejemplo logout si 401
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;
