
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to our backend server
      '/api': {
        target: 'http://localhost:4000', // Point to our Express server
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Add extensions to properly resolve .native files
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js']
  },
  // Explicitly tell Vite to ignore certain imports in browser context
  optimizeDeps: {
    exclude: ['react-native', 'expo'],
  },
  // Define global variables to help with platform detection
  define: {
    __DEV__: mode === 'development',
    Platform: {
      OS: JSON.stringify('web')
    }
  }
}));
