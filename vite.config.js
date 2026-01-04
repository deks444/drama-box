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
              proxyReq.setHeader('X-API-Key', env.VITE_STREAM_API_KEY);
            });
          }
        },
      },
    },
  }
})
