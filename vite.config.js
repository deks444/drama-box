import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
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
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('Referer', 'https://streamapi.web.id/');
            });
          }
        },
      },
    },
  }
})
