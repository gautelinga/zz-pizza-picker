# Phase 2: App & Filters - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full interactive pizza picker UI: a Svelte 5 island inside Astro that reads `public/menu.json` at runtime, spins to reveal a random pizza (with a rotating pizza emoji animation), shows the result card, and lets the user toggle between All / Veg / Meat filters. No backend, no server — purely client-side state in the Svelte component.

</domain>

<decisions>
## Implementation Decisions

### Spin Animation
- **D-01:** Animation style: a pizza emoji (🍕) rotates (CSS `@keyframes` rotation) during the spin — the spinning IS the reveal motion, no mystery/question mark placeholder.
- **D-02:** Duration: medium (~1.5s), ease-out deceleration — satisfying buildup without making users wait.
- **D-03:** CSS native animation only — no JS animation library (zero bytes shipped, per CLAUDE.md).

### Result Card
- **D-04:** Visual hierarchy: pizza name is the dominant element (large text), description below in smaller text, price as a badge or footnote. Name = the decision, everything else is detail.
- **D-05:** A veg/meat label badge appears on the result card (e.g., "🌱 Vegetarian" or "🥩 Meat") — useful confirmation especially after filtering.
- **D-06:** Result card appears below the spin button. Layout reads top-to-bottom: filters → spin button → result card.

### Filter Controls
- **D-07:** Three rounded pill/chip toggles in a row: "All" / "Veg" / "Meat". Active pill is highlighted. Touch-friendly.
- **D-08:** Filter pills sit above the spin button — user sets preference before committing. Top-to-bottom flow: filters → spin → result.
- **D-09:** Pizza count placement (FILT-02: live count of eligible pizzas) — Claude's discretion. Somewhere near filters or spin button.

### Page Layout
- **D-10:** Centered hero layout — content vertically centered in the viewport, app-like. Feels like a native tool you open and use, not a website you scroll.
- **D-11:** Clean and minimal color theme: white/off-white background, neutral tones, accent color only on active/interactive elements (active filter pill, spin button). No warm pizza colors, no bold/playful palette.
- **D-12:** max-width ~400px on desktop — narrow column, phone-like. On mobile it fills the screen. This is effectively a mobile app served on web.

### Claude's Discretion
- Pizza count (FILT-02) placement — near filters or spin button, whichever reads most clearly.
- Specific Tailwind color tokens for the clean/minimal palette.
- Typography choices (system font stack is fine).
- Exact disabled-button state styling for FILT-03 (button + explanation text, how prominent the explanation is).
- Svelte component structure — whether to use one component or multiple.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project goals, constraints, core value ("one tap gives you a pizza")
- `.planning/REQUIREMENTS.md` — CORE-01 through CORE-03, FILT-01 through FILT-03 (Phase 2 requirements)
- `.planning/ROADMAP.md` — Phase 2 success criteria
- `CLAUDE.md` — Technology stack decisions (Astro 6, Svelte 5, Tailwind 4.2.2, CSS native animations)

### Phase 1 Output (data foundation for Phase 2)
- `.planning/phases/01-data-pipeline/01-CONTEXT.md` — Data schema decisions, menu.json shape
- `public/menu.json` — Live menu data (14 pizzas, `{ scraped_at, source_url, pizzas: [{name, description, price_nok, vegetarian}] }`)

### Technology
- Astro 6.1.4 — framework (static output, already configured in `astro.config.mjs`)
- Svelte 5 — install via `npx astro add svelte` (not yet installed)
- Tailwind CSS 4.2.2 — install via `npx astro add tailwind` (not yet installed); v4 requires only `@import "tailwindcss"` — zero config file needed

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/pages/index.astro` — Placeholder page, ready to be replaced with the real picker UI
- `public/menu.json` — Live menu data, 14 pizzas, already scraped and structured by Phase 1

### Established Patterns
- Astro static output: `astro.config.mjs` sets `output: 'static'` — no SSR, no server
- TypeScript strict mode: `tsconfig.json` extends `astro/tsconfigs/strict`
- Module scripts: `package.json` uses `"type": "module"` — ESM throughout

### Integration Points
- Phase 2 reads `public/menu.json` at runtime (client-side fetch in the Svelte island, or import via Astro's build step)
- Svelte 5 island lives inside `index.astro` as an Astro island component (`client:load` or `client:idle`)
- Tailwind classes applied directly in the Svelte component and index.astro

</code_context>

<specifics>
## Specific Ideas

- 14 pizzas total: 6 vegetarian, 8 meat. Small pool — no need for virtualization or pagination.
- When the "Meat" filter is active and all pizzas match, count shows 8. When "Veg" is active, count shows 6.
- The FILT-03 disabled state (no matching pizzas) can only occur if somehow all filters produce 0 results — with this menu that only happens if future data changes break veg/meat classification. Plan for it anyway per requirement.
- Norwegian text in descriptions (ø, æ, å) — already handled by the scraper; no special UI treatment needed.

</specifics>

<deferred>
## Deferred Ideas

- Allergen data and pizza images — mentioned in Phase 1 as potential additions; not in Phase 2 scope.
- Share result via link or clipboard (CORE-04, v2 requirement) — Phase 2 scope is spin + reveal + filter only.
- Soft de-duplication (CORE-05, v2) — not in scope.
- Price range filter (FILT-04, v2) — not in scope.
- "Menu last updated" display (DEPL-03) — Phase 3 requirement, not Phase 2.

</deferred>

---

*Phase: 02-app-filters*
*Context gathered: 2026-04-20*
