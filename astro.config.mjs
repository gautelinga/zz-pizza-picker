import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Static output — no SSR adapter. Cloudflare Pages serves dist/ as-is.
  output: 'static',
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
