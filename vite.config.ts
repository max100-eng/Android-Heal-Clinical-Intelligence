import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Forzamos esbuild para evitar el error "terser not found"
    minify: 'esbuild',
    // 2. Optimizamos para navegadores modernos
    target: 'esnext',
    // 3. Evitamos que falle por advertencias de paquetes antiguos
    chunkSizeWarningLimit: 1600,
  },
  // Aseguramos que el servidor use el puerto correcto en local
  server: {
    port: 3000,
    strictPort: true,
  }
});
