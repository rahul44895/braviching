import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only proxy: the built app is served same-origin by Express in production, but during
// `npm run dev` the Vite dev server runs on its own port -- proxy /api to the Express server
// instead of dealing with CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
