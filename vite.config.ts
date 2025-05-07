import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',

  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Default app entry point (adjust if not used)
        main: path.resolve(__dirname, 'index.html'),

        // Faculty settings page as standalone
        facultySettings: path.resolve(__dirname, 'faculty-settings.html')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'facultySettings') {
            return 'faculty-settings.js';
          }
          return 'assets/[name]-[hash].js';
        }
      }
    }
  },

  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    strictPort: true
  }
});
