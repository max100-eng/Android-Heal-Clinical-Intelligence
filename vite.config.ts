import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Cambiamos el minificador a esbuild para evitar el error de terser
    minify: 'esbuild',
    target: 'esnext'
  },
  server: {
    port: 3000
  }
});
