import { defineConfig } from 'astro/config';

export default defineConfig({
  // Static output — no SSR adapter. Cloudflare Pages serves dist/ as-is.
  output: 'static',
});
