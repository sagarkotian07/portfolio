import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600, // three.js is a lazy chunk by design
  },
});
