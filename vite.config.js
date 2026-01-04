import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './db-secure.html',
      },
    },
  },
  server: {
    proxy: {
      '/api/download': {
        target: 'https://dramabox-api-rho.vercel.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api': {
        target: 'https://dramabox-api-rho.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/stream-api': {
        target: 'https://streamapi.web.id',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/stream-api/, ''),
      },
    },
  },
})
