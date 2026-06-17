import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@portfolio': path.resolve(__dirname, '..'),
    },
  },
  server: {
    fs: { allow: ['..'] },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: { phaser: ['phaser'], react: ['react', 'react-dom'] },
      },
    },
  },
})
