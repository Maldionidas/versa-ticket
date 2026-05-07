import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Tu configuracion de alias para importaciones limpias
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      // Configuracion del compañero para evitar el popup de error invasivo
      overlay: false
    }
  }
})