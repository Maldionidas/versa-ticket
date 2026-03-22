import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
=======

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> origin/feature/register
})
