import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // načítame env premenné podľa aktuálneho režimu (mode)
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    base: './', // 💥 TOTO PRIDAJ – dôležité pre správne načítanie súborov z dist
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
