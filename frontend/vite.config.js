import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    base: '/', // zmena z './' na '/'
    plugins: [react()],
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      proxy: {
        '/products': env.VITE_API_BASE_URL,
        '/api': env.VITE_API_BASE_URL,
      },
    },
  });
};
