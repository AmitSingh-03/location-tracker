import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Deployment configuration for GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/location-tracker/', // Replace with your repository name
  root: './client',
  build: {
    outDir: '../dist',
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './client/assets')
    }
  }
})