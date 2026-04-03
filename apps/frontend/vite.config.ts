import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    // Tailwind v4 registers as a Vite plugin — no tailwind.config.js needed.
    // It scans .svelte files automatically for class names.
    tailwindcss(),
    sveltekit(),
  ],
  server: {
    port: 5173,
    proxy: {
      // /api/v1/* browser requests are forwarded to Fastify with the prefix stripped.
      // The backend routes are mounted without the /api/v1 prefix (fastify-plugin breaks
      // prefix encapsulation), so /api/v1/auth/session → localhost:3000/auth/session.
      // Critical for login: the Set-Cookie on the response is attributed to localhost:5173,
      // making the cookie accessible for all subsequent same-origin requests.
      '/api/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/v1/, ''),
      },
    },
  },
})
