# Architecture Patterns

**Project:** ZZ Pizza Picker
**Researched:** 2026-04-08
**Confidence:** HIGH — pattern is well-established, confirmed against multiple sources

---

## Recommended Architecture

A two-stage pipeline: a **build-time scraper** that writes a JSON data file, followed by a **static frontend** that reads that file and runs entirely in the browser. The two stages share nothing at runtime — they are connected only by the JSON artifact on disk.

```
BUILD TIME
──────────
[Scraper Script]
  └─ fetches ZZ Pizza website HTML
  └─ parses menu (Cheerio / Playwright)
  └─ transforms to schema-validated JSON
  └─ writes → public/menu.json

[Vite Build]
  └─ reads src/ (HTML, CSS, JS)
  └─ bundles → dist/
  └─ copies public/ → dist/  (includes menu.json)

DEPLOY
──────
dist/ → CDN / static host (Netlify, Vercel, GitHub Pages)

RUNTIME (browser)
─────────────────
[Browser]
  └─ fetches dist/index.html + JS bundle
  └─ fetches dist/menu.json  (one HTTP GET, no server)
  └─ applies filters in memory
  └─ runs spin animation
  └─ displays result
```

---

## Component Boundaries

| Component | Responsibility | Inputs | Outputs | Runs When |
|-----------|---------------|--------|---------|-----------|
| **Scraper** | Fetch ZZ Pizza HTML, extract menu items, validate schema, write JSON | ZZ Pizza website URL | `public/menu.json` | Build time only |
| **menu.json** | Serialized menu data (single source of truth) | Scraper output | Read by frontend | Artifact on disk |
| **Vite build** | Bundle frontend assets into deployable `dist/` | `src/`, `public/` | `dist/` | Build time only |
| **Frontend JS** | Load menu.json, apply filters, random selection, spin animation | `menu.json` fetch, user input events | DOM updates | Runtime in browser |
| **Filter UI** | Veg/meat toggle, price range controls | User interactions | Filter state in memory | Runtime in browser |
| **Spin UI** | Animation trigger and pizza reveal display | Filtered pizza array, user tap | DOM animation + result | Runtime in browser |

### Boundary rules
- The scraper has **no knowledge of the frontend**. It writes a file and exits.
- The frontend has **no knowledge of the scraper**. It reads a URL (`/menu.json`) and works with whatever is there.
- Filters and selection live entirely in the browser — no server, no API call at runtime.
- `public/menu.json` is the sole contract between build pipeline and frontend.

---

## Data Flow

### Build-time data flow

```
ZZ Pizza website
  │  HTTP GET (scraper)
  ▼
Raw HTML
  │  Cheerio parse / DOM selector
  ▼
Extracted rows: [{name, description, price, tags}, ...]
  │  Validation + normalization (strip whitespace, coerce price to number)
  ▼
public/menu.json
  │  copied by Vite into dist/
  ▼
dist/menu.json  ←── what ships to CDN
```

### Runtime data flow

```
Browser loads index.html + JS bundle
  │
  ▼
fetch("/menu.json")
  │  one-time load, cached
  ▼
allPizzas[] (in memory)
  │
  ├──► Filter state (veg/meat toggle, price range)
  │      │
  │      ▼
  │    filteredPizzas[]
  │
  └──► User taps Spin
         │
         ▼
       randomIndex = Math.floor(Math.random() * filteredPizzas.length)
         │
         ▼
       Spin animation → reveal filteredPizzas[randomIndex]
```

No data flows back to any server. Nothing is persisted between sessions.

---

## menu.json Schema (recommended)

```json
{
  "scraped_at": "2026-04-08T10:00:00Z",
  "source_url": "https://zzpizza.no/menu",
  "pizzas": [
    {
      "id": "margherita",
      "name": "Margherita",
      "description": "Tomato, mozzarella, basil",
      "price_nok": 169,
      "tags": ["vegetarian"]
    }
  ]
}
```

Key design decisions:
- `price_nok` as a number, not a string — enables numeric range filtering without parsing at runtime.
- `tags` array rather than boolean flags — extensible without schema changes.
- `scraped_at` timestamp — allows stale-data detection or display.
- `id` as a slug — stable identifier if linking or caching is added later.

---

## Patterns to Follow

### Pattern 1: Prebuild npm hook

**What:** Use `npm run build` to chain scraper then Vite build.
**When:** Always — keeps deployment simple (one command on Netlify/Vercel).

```json
{
  "scripts": {
    "scrape": "node scripts/scrape.js",
    "build": "npm run scrape && vite build",
    "dev": "vite"
  }
}
```

This means any deploy system that runs `npm run build` automatically regenerates the menu before bundling. No separate build step configuration needed.

### Pattern 2: Place scraped JSON in `public/`, not `src/`

**What:** Write `public/menu.json`, not `src/data/menu.json`.
**When:** Always for this project.

Vite copies `public/` to `dist/` as-is. Importing JSON from `src/` would bundle it into the JS, making the bundle larger and preventing independent cache invalidation. As a file in `public/`, the browser can cache `menu.json` separately.

### Pattern 3: Single-script Level 1 scraper

**What:** One Node.js script, sequential HTTP fetch + Cheerio parse + `fs.writeFileSync`.
**When:** Appropriate for this project's scale (one menu page, one restaurant, no anti-bot measures needed).

No scraping framework, no queues, no proxy rotation. The menu page is small, infrequently changes, and is public. Over-engineering here is a real risk.

### Pattern 4: Schema validation at scrape time

**What:** Validate extracted data before writing JSON. Fail the build if required fields are missing.
**When:** Before writing `public/menu.json`.

If the ZZ Pizza website changes its HTML structure, the scraper should throw a clear error at build time rather than silently writing empty or malformed data. This surfaces breakage immediately instead of deploying a broken menu.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Runtime scraping

**What:** Fetching ZZ Pizza's site from the browser or a serverless function on every user visit.
**Why bad:** CORS will block direct browser requests. A serverless proxy adds server infrastructure that is out of scope. Rate-limit risk. Latency on every visit.
**Instead:** Build-time only. The menu changes at most weekly; there is no reason to fetch it live.

### Anti-Pattern 2: Hardcoding menu data in JS source

**What:** Writing `const MENU = [{ name: "Margherita", ... }]` directly in the frontend JS.
**Why bad:** Menu updates require a code change, not just a build. The project requirement explicitly says "stays current if menu changes."
**Instead:** `public/menu.json` written by the scraper. Frontend reads it at runtime.

### Anti-Pattern 3: Using a full SSG framework (Next.js, Nuxt, Astro)

**What:** Pulling in a full meta-framework for a single-page app with one data source.
**Why bad:** Adds build complexity, framework-specific conventions, and learning curve without any benefit. The filtering and spin logic are trivial client-side JS.
**Instead:** Vite + vanilla JS (or minimal framework like Preact/Alpine). The entire frontend is a single HTML page with a `<script>` module.

### Anti-Pattern 4: Storing filter state in the URL or localStorage

**What:** Persisting veg/meat toggle and price range between sessions.
**Why bad:** Adds state management complexity. The product principle is "one tap, get a result" — not a remembered preference system. This is explicitly out of scope.
**Instead:** Ephemeral in-memory filter state. Resets on page load.

---

## Suggested Build Order (phase dependencies)

The architecture has three independent buildable units, but they have a dependency chain:

```
1. Scraper (scrape.js + menu.json schema)
   └─ Can be built and run standalone, verifies target site is scrapeable

2. Data layer (menu.json)
   └─ Produced by (1), consumed by (3)
   └─ Schema must be agreed before (3) is built

3. Frontend
   ├─ Core display (load menu.json, pick random pizza, render result)
   │    └─ Requires (2) to exist — can stub with dummy menu.json during dev
   ├─ Filter UI (veg/meat toggle, price range)
   │    └─ Requires core display to work
   └─ Spin animation
        └─ Pure UI layer, no data dependency beyond "a pizza was selected"
```

**Implication for phases:**
- Build the scraper first and confirm the menu is extractable before investing in frontend work. If ZZ Pizza's site uses heavy JS rendering, this changes the scraper tool choice (Cheerio vs Playwright), which has cost implications.
- The spin animation is pure polish — it can be dropped or simplified without affecting correctness. Build it last.
- Filter UI depends on having real data (real prices, real tag distribution) to test against. Wire it up after the data is confirmed.

---

## Scalability Considerations

This project deliberately does not need to scale, but noting boundaries:

| Concern | At current scale (1 restaurant, ~20 pizzas) | If scaled |
|---------|---------------------------------------------|-----------|
| Menu size | JSON < 10KB, trivially fast | Not a concern until hundreds of items |
| Scraper reliability | One script, one URL, no auth | Anti-bot measures would require Playwright + proxies |
| Menu staleness | Redeploy to refresh; acceptable for weekly menu changes | Would need scheduled CI builds (GitHub Actions cron) |
| Frontend state | In-memory, single tab | Multi-tab sync not needed |

---

## Sources

- [Web Scraping Architecture Patterns (Apify)](https://use-apify.com/blog/web-scraping-architecture-patterns) — Level 1 single-script pattern for small, non-recurring scrapes
- [JAMstack Architecture Overview (Naturaily)](https://naturaily.com/blog/what-is-jamstack) — Build-time data fetch, CDN delivery model
- [Vite Static Deploy Guide](https://vite.dev/guide/static-deploy) — `dist/` output, `public/` passthrough, build command
- [Web Scraping with Cheerio and Node.js (CircleCI)](https://circleci.com/blog/web-scraping-with-cheerio/) — Cheerio parse + `fs.writeFileSync` pattern
- [How to set up a static site with Vite (mytchall.dev)](https://mytchall.dev/how-to-set-up-a-static-site-with-vite-and-zero-javascript/) — Vite as a zero-framework bundler
