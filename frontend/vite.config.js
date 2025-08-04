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
      '/products': '${import.meta.env.VITE_API_BASE_URL}
',
      '/api': '${import.meta.env.VITE_API_BASE_URL}
',    // <-- pridaj toto
    },
  },
});
