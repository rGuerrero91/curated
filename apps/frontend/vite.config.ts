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
      // All /api/* requests are forwarded to the Fastify backend.
      // This is critical for the login flow: the browser's fetch to /api/v1/auth/session
      // goes through this proxy, so the Set-Cookie response is attributed to localhost:5173
      // (not localhost:3000), making the cookie accessible for all subsequent same-origin requests.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
