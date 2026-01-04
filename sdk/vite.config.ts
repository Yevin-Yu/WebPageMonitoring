import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/sdk.ts',
      name: 'WebMonitoring',
      fileName: 'sdk',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        extend: true,
        globals: {},
      },
    },
    minify: 'terser',
    sourcemap: true,
  },
});
