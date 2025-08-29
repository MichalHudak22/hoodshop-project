import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    base: '/',
    plugins: [react()],
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      proxy: {
        '/products': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  });
};
