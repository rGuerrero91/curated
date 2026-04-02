import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // vitePreprocess enables TypeScript and PostCSS processing inside .svelte files
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    alias: {
      // $lib maps to src/lib — used throughout as import '$lib/...'
      $lib: 'src/lib',
    },
  },
}

export default config
