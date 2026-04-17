import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
          if (id.includes('@anthropic-ai')) return 'vendor-ai';
          if (id.includes('pdfjs-dist')) return 'vendor-pdf';
          if (id.includes('zustand') || id.includes('date-fns') || id.includes('mammoth')) return 'vendor-utils';
        },
      },
    },
  },
})
