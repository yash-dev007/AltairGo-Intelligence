import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Bypass helper: let browser navigation (text/html) go to React,
// but proxy fetch/XHR requests to Flask.
const bypassForHtml = (req) => {
  // If the frontend explicitly marks this as an API request, ALWAYS proxy it
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return; // allow proxy
  }

  // Otherwise, if the browser is requesting HTML navigation, let Vite serve the SPA index.html
  if (req.headers.accept?.includes('text/html')) {
    return req.url;
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Routes that DON'T conflict with React Router pages (safe to always proxy)
      '/api': 'http://127.0.0.1:5000',
      '/auth': 'http://127.0.0.1:5000',
      '/generate-itinerary': 'http://127.0.0.1:5000',
      '/get-trip': 'http://127.0.0.1:5000',
      '/generate-destinations': 'http://127.0.0.1:5000',
      '/recommend-destinations': 'http://127.0.0.1:5000',
      '/recommend-regions': 'http://127.0.0.1:5000',
      '/destination-details-ai': 'http://127.0.0.1:5000',
      '/calculate-budget': 'http://127.0.0.1:5000',
      '/smart-insight': 'http://127.0.0.1:5000',
      '/countries': 'http://127.0.0.1:5000',
      '/regions': 'http://127.0.0.1:5000',
      '/chat': 'http://127.0.0.1:5000',

      // Routes that ALSO exist as React Router pages — only proxy fetch requests
      '/destinations': { target: 'http://127.0.0.1:5000', bypass: bypassForHtml },
      '/packages': { target: 'http://127.0.0.1:5000', bypass: bypassForHtml },
      '/blogs': { target: 'http://127.0.0.1:5000', bypass: bypassForHtml },
      '/features': { target: 'http://127.0.0.1:5000', bypass: bypassForHtml },
    }
  },
  base: './',
})
