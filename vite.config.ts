import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Proxy local /backend requests to remote API to avoid CORS during development
        proxy: {
          '^/backend/.*': {
            target: 'https://madrasa.quantumautomationssuite.com',
            changeOrigin: true,
            secure: false,
            ws: false,
            rewrite: (path) => path.replace(/^\/backend/, '/backend')
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
