import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Crucial para Docker
    proxy: {
      // 1. Redirigir llamadas a la API
      '/api': {
        // Usa el nombre que pusiste en container_name de docker-compose
        target: 'http://api_backend:5000', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path 
      },
      // 2. 🔥 ESTO ES LO QUE FALTABA: Redirigir las imágenes
      '/uploads': {
        target: 'http://api_backend:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path 
      }
    }
  }
})