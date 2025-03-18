
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: "::",
    port: 8080
  },
  build: {
    outDir: 'dist',
    // Add environment variable replacement for production build
    // This will replace import.meta.env.PROD with true in production builds
    // and all other environment variables can be defined here
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  // Define environment variables for different modes
  define: {
    'import.meta.env.API_URL': mode === 'production' 
      ? JSON.stringify('https://api.your-domain.com/api')
      : JSON.stringify('')
  }
}));
