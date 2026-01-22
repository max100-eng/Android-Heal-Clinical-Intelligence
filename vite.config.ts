import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carga todas las variables VITE_* automáticamente
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    // Permite usar import.meta.env.VITE_*
    envPrefix: 'VITE_',

    define: {
      // Exponer claves necesarias al cliente de forma segura
      __API_KEY__: JSON.stringify(env.VITE_API_KEY || ''),
      __ANALYSIS_URL__: JSON.stringify(env.VITE_ANALYSIS_URL || ''),
      __CHAT_URL__: JSON.stringify(env.VITE_CHAT_URL || ''),
      __ENV__: JSON.stringify(env.VITE_ENV || 'development'),
    },

    build: {
      outDir: 'dist',
      sourcemap: false,

      // Más rápido y estable que terser para Vercel
      minify: 'esbuild',

      // Si quieres seguir usando terser, descomenta:
      /*
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
        },
      },
      */
    },

    server: {
      port: 3000,
    },
  };
});


