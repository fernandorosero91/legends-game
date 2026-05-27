import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) return 'three-core';
          if (id.includes('@react-three/')) return 'three-react';
          if (id.includes('framer-motion')) return 'framer';
          if (id.includes('zustand')) return 'zustand';
          if (id.includes('@insforge/')) return 'insforge';
        },
      },
    },
    chunkSizeWarningLimit: 600,
    target: 'es2020',
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react', 'react-dom',
      'three', '@react-three/fiber', '@react-three/drei',
      'zustand', 'framer-motion',
    ],
  },
})
