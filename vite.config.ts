import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Capture-Flag-Shooter-MANUS/',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
  server: {
    port: 8080,
  },
});
