import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config();

export default defineConfig({
  root: './streaming-guide',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'streaming-guide/index.html'),
        popular: resolve(__dirname, 'streaming-guide/popular.html'),
        search: resolve(__dirname, 'streaming-guide/search.html'),
      }
    }
  },
  define: {
    'process.env.TMDB_API_KEY': JSON.stringify(process.env.TMDB_API_KEY),
  },
});
