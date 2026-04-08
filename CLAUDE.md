<!-- GSD:project-start source:PROJECT.md -->
## Project

**ZZ Pizza Picker**

A web app that randomly selects a pizza from ZZ Pizza's menu in Oslo. You open it, hit spin, and it tells you what you're eating tonight. Works for solo indecision and group "we'll eat whatever it picks" situations.

**Core Value:** One tap gives you a pizza — no deliberation, no regret, just a result.

### Constraints

- **Data**: Menu must be scraped from ZZ Pizza's site — no official API
- **Simplicity**: The core interaction is a single tap; don't complicate it
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | 6.1.4 | App framework | Static-first, zero JS by default, built-in static site generation, runs fetch() at build time to scrape menu data. The right tool when your app is mostly static with small interactive islands. |
- **Over Next.js**: Next.js is a full React SSR framework aimed at large apps. For a single-purpose tool with one interactive component (the spinner), it adds 40-60KB of React runtime overhead and unnecessary SSR complexity. Overkill.
- **Over SvelteKit**: SvelteKit is excellent but brings a server runtime model. Astro's build-time fetch is cleaner for a menu that changes weekly, not per-request.
- **Over plain HTML/JS**: Astro gives you component structure, build tooling, and Vite — without a framework tax at runtime. You get the DX of a framework with the output of a static site.
### UI Component Layer
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Svelte 5 (via Astro island) | latest (Astro installs it) | Spin/reveal interactive component | Svelte 5 ships 1.6KB gzipped vs React 19's 42KB. For one interactive component (the picker), pulling in React is wasteful. Svelte compiles away, leaving minimal JS. |
### Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.2.2 | All styling | v4 requires zero config — one `@import "tailwindcss"` line. Responsive utilities make mobile-first trivial. Scoped component classes via Astro's `<style>` blocks for the spinner. |
### Animation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| CSS animations (native) | n/a | Spin/reveal animation | The pizza picker animation is a single-axis spin with an ease-out deceleration. This is squarely within what CSS `@keyframes` + `animation-timing-function: cubic-bezier(...)` handles natively — no JS animation library needed. Zero bytes shipped. |
### Scraping
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Native `fetch` + `cheerio` | cheerio 1.2.0 | Parse ZZ Pizza's menu at build time | ZZ Pizza's site (zz.pizza) is WordPress/Breakdance — the menu is **rendered as static HTML** in the page source. This means a simple `fetch()` + DOM parsing works with no headless browser. Playwright/Puppeteer would be overkill and slow CI builds significantly. |
### Hosting
| Technology | Purpose | Why |
|------------|---------|-----|
| Cloudflare Pages (free tier) | Static hosting + CI/CD | Unlimited bandwidth on the free tier. Given the app targets Oslo users, Cloudflare's Frankfurt PoP delivers ~40ms TTFB vs Vercel's ~70ms from EU benchmarks. No bandwidth caps means zero cost regardless of viral traffic. Supports scheduled deploys via GitHub Actions webhook for weekly menu refresh. |
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
## Installation
# Create Astro project
# Add Svelte integration (only if interactive state becomes complex)
# Add Tailwind
# Scraping dependency
# TypeScript types for cheerio (optional but recommended)
## Key Constraints to Note
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
