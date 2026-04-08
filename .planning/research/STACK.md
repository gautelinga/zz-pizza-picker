# Technology Stack

**Project:** ZZ Pizza Picker
**Researched:** 2026-04-08

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | 6.1.4 | App framework | Static-first, zero JS by default, built-in static site generation, runs fetch() at build time to scrape menu data. The right tool when your app is mostly static with small interactive islands. |

**Confidence: HIGH** — Verified via `npm info astro version` (6.1.4). Astro 6 is stable as of early 2026. Official docs at astro.build confirm static generation + islands architecture.

**Why Astro over alternatives:**
- **Over Next.js**: Next.js is a full React SSR framework aimed at large apps. For a single-purpose tool with one interactive component (the spinner), it adds 40-60KB of React runtime overhead and unnecessary SSR complexity. Overkill.
- **Over SvelteKit**: SvelteKit is excellent but brings a server runtime model. Astro's build-time fetch is cleaner for a menu that changes weekly, not per-request.
- **Over plain HTML/JS**: Astro gives you component structure, build tooling, and Vite — without a framework tax at runtime. You get the DX of a framework with the output of a static site.

---

### UI Component Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Svelte 5 (via Astro island) | latest (Astro installs it) | Spin/reveal interactive component | Svelte 5 ships 1.6KB gzipped vs React 19's 42KB. For one interactive component (the picker), pulling in React is wasteful. Svelte compiles away, leaving minimal JS. |

**Confidence: MEDIUM** — Bundle size figures from multiple comparison sources (April 2026). Svelte 5 is well-documented and stable. Specific gzipped sizes from stacksfinder.com/guides/bundlephobia-svelte-comparison.

**Alternative considered:** Pure vanilla JS inside an Astro `<script>` tag. This is viable and even simpler — Astro supports inline scripts natively. If the spin animation is straightforward CSS + a few DOM updates, go vanilla and skip Svelte entirely. Use Svelte only if the filter state management becomes complex.

---

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.2.2 | All styling | v4 requires zero config — one `@import "tailwindcss"` line. Responsive utilities make mobile-first trivial. Scoped component classes via Astro's `<style>` blocks for the spinner. |

**Confidence: HIGH** — Verified via `npm info tailwindcss version` (4.2.2). v4.1 released April 2025, v4.2 is current.

**Note on browser support:** Tailwind v4 requires Chrome 111+, Safari 16.4+, Firefox 128+. This covers "any modern browser" — accept this tradeoff. If IE11 support were needed, use v3 instead (it is not needed here).

---

### Animation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| CSS animations (native) | n/a | Spin/reveal animation | The pizza picker animation is a single-axis spin with an ease-out deceleration. This is squarely within what CSS `@keyframes` + `animation-timing-function: cubic-bezier(...)` handles natively — no JS animation library needed. Zero bytes shipped. |

**Confidence: HIGH** — CSS animations are well-established. The animation is visually simple: a slot-machine style scroll or a card flip. Neither requires Framer Motion / Motion.

**Motion (formerly Framer Motion) v12 NOT recommended for this project.** At 30M monthly downloads it is excellent for complex gesture-driven animations, but at 12.38KB+ it is unnecessary overhead for a single CSS transition. Add it only if the reveal animation becomes substantially more complex than spin + stop.

---

### Scraping

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Native `fetch` + `cheerio` | cheerio 1.2.0 | Parse ZZ Pizza's menu at build time | ZZ Pizza's site (zz.pizza) is WordPress/Breakdance — the menu is **rendered as static HTML** in the page source. This means a simple `fetch()` + DOM parsing works with no headless browser. Playwright/Puppeteer would be overkill and slow CI builds significantly. |

**Confidence: HIGH for the approach** — Directly verified by fetching zz.pizza and confirming menu items (MARGHERITA, etc.) appear as static HTML, not injected by JavaScript. **Confidence: HIGH for cheerio 1.2.0** — confirmed via `npm info cheerio version`.

**Scraping strategy: build-time, with a scheduled rebuild trigger**

```
Build step (Astro builds):
  1. fetch('https://zz.pizza/')
  2. Parse HTML with cheerio to extract pizza name, description, price
  3. Write to a JSON data file (src/data/menu.json)
  4. Astro renders the static app with that data baked in
```

This means the deployed app has zero runtime server-side code — it is a pure static site. Menu freshness is handled by scheduling a weekly rebuild (Cloudflare Pages scheduled builds, or a simple GitHub Actions cron).

**Why not runtime scraping (server function on each visit):** Unnecessary latency, requires a server runtime, more infrastructure surface area. The menu changes at most weekly. Build-time scraping is correct.

**Why not Playwright:** The ZZ Pizza site does not require JavaScript execution to render its menu. Playwright spins up a full Chromium instance (~300MB), slows builds, and adds complexity. Only reach for Playwright if the site migrates to a JS-rendered menu.

---

### Hosting

| Technology | Purpose | Why |
|------------|---------|-----|
| Cloudflare Pages (free tier) | Static hosting + CI/CD | Unlimited bandwidth on the free tier. Given the app targets Oslo users, Cloudflare's Frankfurt PoP delivers ~40ms TTFB vs Vercel's ~70ms from EU benchmarks. No bandwidth caps means zero cost regardless of viral traffic. Supports scheduled deploys via GitHub Actions webhook for weekly menu refresh. |

**Confidence: MEDIUM** — EU latency figures from danubedata.ro benchmarks (2026). Cloudflare Pages free tier limits (500 build minutes/month, unlimited bandwidth) confirmed via multiple sources.

**Why not Vercel:** Vercel caps free bandwidth at 100GB. For a viral pizza randomizer this could be breached. The latency from EU PoPs is also slightly worse.

**Why not Netlify:** 300 build minutes/month is tight during active development. Cloudflare's 500 minutes is more comfortable. Netlify is a fine fallback.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Astro 6 | Next.js 15 | Full React SSR runtime for a single-page static tool is architectural overkill |
| Framework | Astro 6 | SvelteKit | Excellent, but server-centric model complicates pure static deploy; Astro's island model fits better |
| Framework | Astro 6 | Plain HTML/JS | Viable for simplest path, but lacks component model and Vite tooling; Astro costs nothing extra |
| Animation | CSS native | Motion v12 | 12KB+ for a spin transition that CSS handles in 0KB |
| Scraping | fetch + cheerio | Playwright | ZZ Pizza renders menu as static HTML; headless browser is unnecessary weight |
| Hosting | Cloudflare Pages | Vercel | Vercel's 100GB bandwidth cap is a risk; CF is cheaper at any traffic level |
| Styling | Tailwind v4 | CSS Modules | Tailwind's mobile-first utilities are faster to write; no real downside for this app size |

---

## Installation

```bash
# Create Astro project
npm create astro@latest zz-pizza-picker -- --template minimal --install --no-git

# Add Svelte integration (only if interactive state becomes complex)
npx astro add svelte

# Add Tailwind
npx astro add tailwind

# Scraping dependency
npm install cheerio@1.2.0

# TypeScript types for cheerio (optional but recommended)
npm install -D @types/node
```

---

## Key Constraints to Note

**ZZ Pizza site dependency:** The entire scraping strategy depends on zz.pizza rendering its menu as static HTML. If they migrate to a JavaScript-heavy menu (React, Vue, or a headless CMS API), the `fetch + cheerio` approach breaks and Playwright becomes necessary. This should be validated early in Phase 1.

**Astro 6 requires Node 22+.** Node 18 and 20 are no longer supported. Confirm CI and local environments meet this. Cloudflare Pages supports Node 22 on its build workers.

**Tailwind v4 browser floor:** Safari 16.4+ (2022), Chrome 111+ (March 2023), Firefox 128+ (July 2024). If the user base includes very old browsers, use Tailwind v3 — but this is unlikely for a modern web app.

---

## Sources

- Astro version: `npm info astro version` → 6.1.4 (verified 2026-04-08)
- Cheerio version: `npm info cheerio version` → 1.2.0 (verified 2026-04-08)
- Motion version: `npm info motion version` → 12.38.0 (verified 2026-04-08)
- Tailwind version: `npm info tailwindcss version` → 4.2.2 (verified 2026-04-08)
- ZZ Pizza site analysis: fetched https://zz.pizza/ — menu is static HTML (verified 2026-04-08)
- Svelte vs React bundle sizes: https://stacksfinder.com/guides/bundlephobia-svelte-comparison
- Astro 6 stable release: https://www.southwellmedia.com/blog/astro-6-stable-release
- Cloudflare Pages vs Vercel EU latency: https://danubedata.ro/blog/cloudflare-pages-vs-netlify-vs-vercel-static-hosting-2026
- Tailwind v4 release and browser support: https://tailwindcss.com/blog/tailwindcss-v4
- Web scraping approaches 2026: https://dev.to/vhub_systems_ed5641f65d59/web-scraping-with-nodejs-in-2026-axios-cheerio-playwright-crawlee-4f4g
- Motion library rebranding: https://motion.dev/blog/do-you-still-need-framer-motion
