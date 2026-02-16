import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/StaffReport/', // Replace with your GitHub repo name
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'vendor': ['react', 'react-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
