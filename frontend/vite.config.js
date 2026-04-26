import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'esnext', // Optimisation pour les navigateurs modernes
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Séparer les bibliothèques lourdes de rendu 3D
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            // Séparer React et ses composants core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            // Regrouper le reste
            return 'vendor';
          }
        }
      }
    }
  }
})
