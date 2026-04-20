# Phase 2: App & Filters - Research

**Researched:** 2026-04-20
**Domain:** Svelte 5 islands in Astro 6, Tailwind CSS v4 via Vite plugin, CSS keyframe animation, client-side filtering
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Animation style: pizza emoji (🍕) rotates via CSS `@keyframes` during spin — spinning IS the reveal motion, no placeholder.
- **D-02:** Duration ~1.5s, ease-out deceleration.
- **D-03:** CSS native animation only — no JS animation library.
- **D-04:** Result card visual hierarchy: name dominant (large text), description below, price as badge/footnote.
- **D-05:** Veg/meat label badge on the result card ("🌱 Vegetarian" / "🥩 Meat").
- **D-06:** Layout top-to-bottom: filters → spin button → result card.
- **D-07:** Three rounded pill/chip toggles: "All" / "Veg" / "Meat". Active pill highlighted. Touch-friendly.
- **D-08:** Filter pills above spin button.
- **D-09:** Pizza count placement is Claude's discretion — near filters or spin button, whichever reads most clearly.
- **D-10:** Centered hero layout, content vertically centered in viewport, app-like.
- **D-11:** Clean minimal color theme: white/off-white background, neutral tones, accent on active/interactive only. No warm pizza colors.
- **D-12:** max-width ~400px on desktop, full-width on mobile.

### Claude's Discretion

- Pizza count (FILT-02) placement.
- Specific Tailwind color tokens for the clean/minimal palette.
- Typography choices (system font stack is fine).
- Exact disabled-button state styling for FILT-03.
- Svelte component structure (one component or multiple).

### Deferred Ideas (OUT OF SCOPE)

- Allergen data and pizza images.
- Share result via link/clipboard (CORE-04).
- Soft de-duplication (CORE-05).
- Price range filter (FILT-04).
- "Menu last updated" display (DEPL-03, Phase 3).
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CORE-01 | User can trigger a random pizza reveal with a single tap/click | Random selection from filtered array using `Math.random()` in Svelte `$state`; spin button click handler |
| CORE-02 | User can re-spin to get a different random pizza without reloading | Same click handler resets state and picks again; no page reload needed with Svelte reactivity |
| CORE-03 | User sees pizza name, description, and price on the result card | Data is already in `menu.json` (`name`, `description`, `price_nok`); bind to result card template |
| FILT-01 | User can toggle between all pizzas, vegetarian only, or meat only | `$state` for active filter; `$derived` to compute filtered pool from full pizza array |
| FILT-02 | User sees a live count of eligible pizzas before spinning | `$derived` count from filtered pool length — auto-reactive, no extra logic |
| FILT-03 | Spin button disabled (with explanation) when no pizzas match filter | Disabled attribute bound to `filteredPizzas.length === 0`; explanation paragraph conditionally shown |
</phase_requirements>

---

## Summary

Phase 2 is a pure client-side Svelte 5 island embedded in an Astro 6 static page. The island reads `public/menu.json` — either passed as a prop from Astro's build-time `fetch()` or fetched on the client at load time — then manages all interactive state (filter, spin, result) with Svelte 5 runes.

The key installation work is: (1) adding `@astrojs/svelte` and `svelte` so Astro can compile the island, and (2) adding Tailwind CSS v4 via the `@tailwindcss/vite` Vite plugin (NOT the deprecated `@astrojs/tailwind` package, which only supports Tailwind v3). Both integrations are one-command installs with `npx astro add`.

The animation is a CSS `@keyframes` spin on the pizza emoji with an ease-out cubic-bezier. The filter/spin/result logic fits comfortably inside a single Svelte component of ~100–150 lines. No external state library is needed.

**Primary recommendation:** One Svelte component (`PizzaPicker.svelte`) that receives the full pizza array as a prop from the Astro page frontmatter (build-time data injection), manages filter and spin state with runes, and animates the emoji with a CSS class toggle.

---

## Project Constraints (from CLAUDE.md)

| Directive | Constraint |
|-----------|-----------|
| Framework | Astro 6.1.4 — static output (`output: 'static'`) already configured |
| UI component | Svelte 5 island via `@astrojs/svelte` (not yet installed) |
| Styling | Tailwind CSS 4.2.2 — v4 Vite plugin, NOT `@astrojs/tailwind` |
| Animation | CSS native `@keyframes` only — zero JS animation libraries |
| Scraping | `menu.json` already produced by Phase 1 — no scraping needed in Phase 2 |
| Module type | ESM (`"type": "module"`) throughout — no CommonJS |
| TypeScript | Strict mode (`astro/tsconfigs/strict`) — type the pizza data |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@astrojs/svelte` | 8.0.5 | Astro integration that enables Svelte 5 islands | Official Astro integration; handles compilation and hydration |
| `svelte` | 5.55.4 | Reactive UI framework | Already chosen in CLAUDE.md; compiles to minimal JS |
| `tailwindcss` | 4.2.2 | Utility CSS | Already chosen; v4 via Vite plugin |
| `@tailwindcss/vite` | 4.2.2 | Vite plugin that makes Tailwind v4 work in Astro | Required companion for Tailwind v4; replaces `@astrojs/tailwind` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TypeScript (built-in) | via Astro strict tsconfig | Type safety for pizza data shape | Always — strict mode already on |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@tailwindcss/vite` + `tailwindcss` | `@astrojs/tailwind@6.0.2` | `@astrojs/tailwind` only supports Tailwind v3 — wrong version |
| Single `PizzaPicker.svelte` | Multiple sub-components | Overkill for ~100 lines; one component keeps cognitive load low |
| Props-from-Astro for menu data | Client-side `fetch('/menu.json')` | Both work; props approach is zero extra network request and simplest |

### Installation
```bash
npx astro add svelte
npm install tailwindcss @tailwindcss/vite
```

**Version verification (confirmed 2026-04-20):**
- `@astrojs/svelte`: 8.0.5 [VERIFIED: npm registry]
- `svelte`: 5.55.4 [VERIFIED: npm registry]
- `tailwindcss`: 4.2.2 [VERIFIED: npm registry]
- `@tailwindcss/vite`: 4.2.2 [VERIFIED: npm registry]
- `@astrojs/tailwind` (DO NOT USE for v4): 6.0.2 with `peerDependencies: tailwindcss ^3.0.24` [VERIFIED: npm registry]

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── PizzaPicker.svelte    # The single interactive island
├── styles/
│   └── global.css            # @import "tailwindcss" — one line
└── pages/
    └── index.astro           # Loads menu.json at build time, renders island
```

### Pattern 1: Build-time Data Injection (Props from Astro Frontmatter)

**What:** Astro's frontmatter runs at build time (Node.js). `index.astro` reads `public/menu.json`, parses it, and passes the pizza array as a prop to the Svelte island. The island never needs to `fetch()` anything.

**When to use:** When data is static at build time — which this is (menu.json is written before build starts).

**Example:**
```astro
---
// src/pages/index.astro
import PizzaPicker from '../components/PizzaPicker.svelte';
import menuData from '../../public/menu.json';
---
<PizzaPicker pizzas={menuData.pizzas} client:load />
```

```svelte
<!-- src/components/PizzaPicker.svelte -->
<script lang="ts">
  interface Pizza {
    name: string;
    description: string;
    price_nok: number;
    vegetarian: boolean;
  }

  type Filter = 'all' | 'veg' | 'meat';

  let { pizzas }: { pizzas: Pizza[] } = $props();

  let activeFilter = $state<Filter>('all');
  let result = $state<Pizza | null>(null);
  let spinning = $state(false);

  let filteredPizzas = $derived.by(() => {
    if (activeFilter === 'veg') return pizzas.filter(p => p.vegetarian);
    if (activeFilter === 'meat') return pizzas.filter(p => !p.vegetarian);
    return pizzas;
  });

  function spin() {
    if (filteredPizzas.length === 0) return;
    spinning = true;
    setTimeout(() => {
      const idx = Math.floor(Math.random() * filteredPizzas.length);
      result = filteredPizzas[idx];
      spinning = false;
    }, 1500);
  }
</script>
```

**Source:** [CITED: docs.astro.build/en/guides/integrations-guide/svelte/] + [CITED: svelte.dev/docs/svelte/$derived]

### Pattern 2: Tailwind v4 Vite Plugin Configuration

**What:** Add `@tailwindcss/vite` as a Vite plugin in `astro.config.mjs`. Create `src/styles/global.css` with a single `@import "tailwindcss"`. Import the CSS in `index.astro`. No `tailwind.config.js` needed.

**Example:**
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

```css
/* src/styles/global.css */
@import "tailwindcss";
```

**Source:** [CITED: tailwindcss.com/docs/installation/framework-guides/astro]

### Pattern 3: CSS Keyframe Spin Animation

**What:** A CSS `@keyframes` rule rotates the emoji. A class is toggled via Svelte's `class:` directive when `spinning` is true.

**Example:**
```svelte
<style>
  @keyframes spin-pizza {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .spinning {
    animation: spin-pizza 1.5s cubic-bezier(0.33, 1, 0.68, 1) forwards;
  }
</style>

<span class:spinning aria-hidden="true">🍕</span>
```

**Note:** `cubic-bezier(0.33, 1, 0.68, 1)` is an ease-out cubic that starts fast, decelerates to a stop — satisfying without being sluggish. [ASSUMED — specific easing values, adjust during implementation]

### Pattern 4: Filter Pills with Active State

**Example:**
```svelte
{#each (['all', 'veg', 'meat'] as const) as f}
  <button
    class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
    class:bg-neutral-900={activeFilter === f}
    class:text-white={activeFilter === f}
    class:bg-neutral-100={activeFilter !== f}
    onclick={() => activeFilter = f}
  >
    {f === 'all' ? 'All' : f === 'veg' ? 'Veg' : 'Meat'}
  </button>
{/each}
```

**Source:** [CITED: svelte.dev/docs/svelte/$state] — `onclick=` (not `on:click`) is Svelte 5 syntax

### Anti-Patterns to Avoid

- **Using `on:click` event syntax:** Svelte 5 uses `onclick=` (lowercase, no colon). The old `on:click` is deprecated in Svelte 5.
- **Using `$: derived` reactive statements:** Svelte 5 replaces `$: x = expr` with `let x = $derived(expr)`.
- **Installing `@astrojs/tailwind` for v4:** This package has a hard peer dep on Tailwind v3. It will install Tailwind v3 and conflict with v4.
- **Fetching `menu.json` client-side when it can be injected:** Adds a network round-trip unnecessarily.
- **Importing JSON with a relative path from `pages/`:** In Astro static mode, `public/` files are served at `/`. Import with `../../public/menu.json` from `src/pages/` or use `import.meta.env` — OR use a build-time fetch.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reactive filtered list | Manual array management with custom event emitters | `$derived.by()` | Svelte runes handle dependency tracking automatically |
| CSS easing | JS-based timer interpolation | `cubic-bezier()` in CSS animation | Native browser — zero bytes, hardware accelerated |
| Tailwind v4 config | Custom PostCSS config or `tailwind.config.js` | `@import "tailwindcss"` (one line) | Tailwind v4 requires zero config by default |

**Key insight:** Svelte 5's `$derived` eliminates the need for manual filter recomputation. The filtered pizza pool recalculates automatically when `activeFilter` changes — no watchers or event buses needed.

---

## Common Pitfalls

### Pitfall 1: Using Svelte 4 Syntax in Svelte 5
**What goes wrong:** `on:click`, `$: reactive`, `export let prop` all still compile in compatibility mode but trigger deprecation warnings. Some patterns break silently.
**Why it happens:** Svelte 5 has a new runes API; the old syntax is considered legacy.
**How to avoid:** Use `onclick=`, `$state()`, `$derived()`, `$props()` from the start.
**Warning signs:** Svelte compiler warnings about "reactive_declaration_non_reactive_property" or "event_directive_deprecated".

### Pitfall 2: Wrong Tailwind Integration Package
**What goes wrong:** `npx astro add tailwind` may install `@astrojs/tailwind` (v3-only). You end up with Tailwind v3 classes instead of v4.
**Why it happens:** `@astrojs/tailwind` is a separate legacy package still on npm.
**How to avoid:** Install manually: `npm install tailwindcss @tailwindcss/vite` and configure `astro.config.mjs` Vite plugins manually.
**Warning signs:** `tailwindcss` resolves to a 3.x version; no `@tailwindcss/vite` in `node_modules`.

### Pitfall 3: `spinning` state not resetting properly on re-spin
**What goes wrong:** If the user clicks spin while already spinning, the timeout overlaps and two results can compete.
**Why it happens:** No guard on the spin handler.
**How to avoid:** Check `if (spinning) return;` at the top of the `spin()` function, OR disable the spin button while `spinning === true`.

### Pitfall 4: Emoji rendering inconsistency across OS
**What goes wrong:** 🍕 renders differently on Windows, macOS, Android. Minor visual inconsistency.
**Why it happens:** OS-level emoji fonts differ.
**How to avoid:** Accept it — emoji rendering differences are cosmetic and expected. Not worth replacing with a custom SVG.

### Pitfall 5: Result card not clearing on filter change
**What goes wrong:** User picks a "Veg" pizza, switches to "Meat" filter, old veg result still shows.
**Why it happens:** `result` state is independent from `activeFilter`.
**How to avoid:** Add a `$effect` that clears `result` when `activeFilter` changes: `$effect(() => { activeFilter; result = null; });`

---

## Code Examples

Verified patterns from official sources:

### Svelte 5 $props (receiving data from Astro)
```typescript
// Source: svelte.dev/docs/svelte/$props
let { pizzas }: { pizzas: Pizza[] } = $props();
```

### Svelte 5 $derived.by for filtered array
```typescript
// Source: svelte.dev/docs/svelte/$derived
let filteredPizzas = $derived.by(() => {
  if (activeFilter === 'veg') return pizzas.filter(p => p.vegetarian);
  if (activeFilter === 'meat') return pizzas.filter(p => !p.vegetarian);
  return pizzas;
});
```

### Svelte 5 $effect for clearing result on filter change
```typescript
// Source: svelte.dev/docs/svelte/$effect (pattern)
$effect(() => {
  // Any read inside $effect registers as a dependency
  activeFilter;         // track this
  result = null;        // side effect: clear result
});
```

### Disabled button with explanation (FILT-03)
```svelte
<button
  onclick={spin}
  disabled={filteredPizzas.length === 0 || spinning}
  class="..."
>
  Spin
</button>
{#if filteredPizzas.length === 0}
  <p class="text-sm text-neutral-500 text-center mt-2">
    No pizzas match this filter.
  </p>
{/if}
```

### CSS spin animation (D-01, D-02, D-03)
```css
@keyframes spin-pizza {
  from { transform: rotate(0deg); }
  to   { transform: rotate(720deg); }
}

.spinning {
  display: inline-block;
  animation: spin-pizza 1.5s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}
```

### Astro frontmatter — build-time data injection
```astro
---
// Source: docs.astro.build/en/guides/framework-components/
import PizzaPicker from '../components/PizzaPicker.svelte';
import menuData from '../../public/menu.json';
---
<PizzaPicker pizzas={menuData.pizzas} client:load />
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `on:click` event directive | `onclick=` attribute syntax | Svelte 5 (Oct 2024) | Write `onclick={fn}` not `on:click={fn}` |
| `export let prop` | `let { prop } = $props()` | Svelte 5 | Prop declarations use destructuring |
| `$: derived = expr` | `let derived = $derived(expr)` | Svelte 5 | Reactive declarations replaced by runes |
| `@astrojs/tailwind` + `tailwind.config.js` | `@tailwindcss/vite` + `@import "tailwindcss"` | Tailwind v4 (Jan 2025) | Zero config needed; old package is v3-only |

**Deprecated/outdated:**
- `@astrojs/tailwind`: Works only with Tailwind v3. Do not use for this project.
- `svelte/store` (writable/readable): Still available but Svelte 5 runes are the preferred pattern for component-local state.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `cubic-bezier(0.33, 1, 0.68, 1)` as the easing value | Code Examples (animation) | Visual only — easy to tweak during implementation |
| A2 | `$effect` clearing result on filter change is the idiomatic Svelte 5 pattern | Code Examples | Minor refactor; `$derived` could also handle this |
| A3 | Importing `public/menu.json` directly in Astro frontmatter works at build time | Architecture Pattern 1 | If it fails, fall back to `fetch('/menu.json')` in `onMount` — trivial to change |

---

## Open Questions

1. **JSON import path from Astro frontmatter**
   - What we know: Astro frontmatter runs in Node.js at build time; `import` resolves against `src/pages/`
   - What's unclear: Whether `import '../../public/menu.json'` resolves correctly, or whether a root-relative alias is needed
   - Recommendation: Test in Wave 0 (setup). Fallback: use `import.meta.glob` or a build-time `fetch('http://localhost:port/menu.json')` pattern

2. **`npx astro add svelte` behavior with existing lockfile**
   - What we know: The command installs `@astrojs/svelte` and patches `astro.config.mjs`
   - What's unclear: Whether it also tries to add `tailwind` automatically or conflicts with manual Vite plugin config
   - Recommendation: Run `npx astro add svelte` first, then manually add Tailwind Vite plugin to `astro.config.mjs`

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build tooling | Yes | v22.22.2 | — |
| npm | Package install | Yes | (via Node) | — |
| `@astrojs/svelte` | Svelte island | Not installed | — | `npx astro add svelte` |
| `svelte` | Svelte island | Not installed | — | `npx astro add svelte` |
| `tailwindcss` | Styling | Not installed | — | `npm install tailwindcss @tailwindcss/vite` |
| `@tailwindcss/vite` | Tailwind v4 in Vite | Not installed | — | `npm install tailwindcss @tailwindcss/vite` |

**Missing dependencies with no fallback:** None — all are installable from npm.

**Missing dependencies requiring install steps:**
- Svelte: `npx astro add svelte`
- Tailwind v4: `npm install tailwindcss @tailwindcss/vite`

---

## Validation Architecture

> `workflow.nyquist_validation` is `false` in `.planning/config.json` — this section is skipped.

---

## Security Domain

This phase has no authentication, session management, or server-side processing. The only input is the filter toggle (an enum of 3 values). There is no user-supplied text, no network calls with user data, no backend. Security considerations are minimal:

| Concern | Status |
|---------|--------|
| XSS via pizza data | Not applicable — data comes from `menu.json` at build time, not user input |
| Input validation | Filter is a 3-value enum; no free-form input |
| Data integrity | `menu.json` validated by Phase 1 scraper (DATA-03 guard) |

---

## Sources

### Primary (HIGH confidence)
- `npm view @astrojs/svelte version` — 8.0.5 [VERIFIED: npm registry 2026-04-20]
- `npm view svelte version` — 5.55.4 [VERIFIED: npm registry 2026-04-20]
- `npm view tailwindcss version` — 4.2.2 [VERIFIED: npm registry 2026-04-20]
- `npm view @tailwindcss/vite version` — 4.2.2 [VERIFIED: npm registry 2026-04-20]
- `npm view @astrojs/tailwind dist-tags` + peerDependencies — confirms v3-only [VERIFIED: npm registry 2026-04-20]
- `npm view @astrojs/svelte peerDependencies` — requires `svelte: ^5.43.6` [VERIFIED: npm registry 2026-04-20]
- [tailwindcss.com/docs/installation/framework-guides/astro](https://tailwindcss.com/docs/installation/framework-guides/astro) — Tailwind v4 + Astro setup
- [svelte.dev/docs/svelte/$state](https://svelte.dev/docs/svelte/$state) — $state rune API
- [svelte.dev/docs/svelte/$derived](https://svelte.dev/docs/svelte/$derived) — $derived rune API
- [docs.astro.build/en/guides/integrations-guide/svelte/](https://docs.astro.build/en/guides/integrations-guide/svelte/) — Astro/Svelte integration

### Secondary (MEDIUM confidence)
- [dev.to/dipankarmaikap/how-to-use-tailwind-css-v4-in-astro](https://dev.to/dipankarmaikap/how-to-use-tailwind-css-v4-in-astro-31og) — community guide, consistent with official docs
- WebSearch: Svelte 5 `$effect` as replacement for `$:` reactive watchers — multiple sources confirm

### Tertiary (LOW confidence)
- Specific `cubic-bezier(0.33, 1, 0.68, 1)` easing value — from training knowledge; adjust visually

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry today
- Architecture: HIGH — Astro+Svelte island pattern verified against official docs; build-time data injection is documented
- Pitfalls: HIGH for Tailwind/Svelte syntax pitfalls (verified); MEDIUM for animation easing (assumed value)

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable libraries; Svelte 5 and Astro 6 patch versions may advance but APIs are stable)
