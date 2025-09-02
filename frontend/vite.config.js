// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    proxy: {
      '/products': 'http://localhost:3001',
      '/api': 'http://localhost:3001',    // <-- pridaj toto
    },
  },
});
