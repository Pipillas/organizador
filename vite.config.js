import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'server/dist', // Genera el directorio dist dentro de la carpeta server
    emptyOutDir: true, // Vacía la carpeta de salida antes de construir
  },
})
