# Phase 1: Data Pipeline - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a Node.js scraper that fetches ZZ Pizza's menu from their website at build time, parses it into structured JSON, validates it, and writes it to `public/menu.json`. This phase delivers the data foundation — no UI, no frontend, just the reliable data pipeline.

</domain>

<decisions>
## Implementation Decisions

### Vegetarian Detection
- **D-01:** Primary strategy: use ZZ Pizza's own site labeling/categorization to determine if a pizza is vegetarian — trust the source if it provides a tag or category.
- **D-02:** Fallback if site doesn't label explicitly: infer from ingredients by scanning ingredient text for meat keywords (chicken, beef, salami, prosciutto, etc.).

### Target URL
- **D-03:** Scrape the Gamlebyen (Oslo) ZZ Pizza location. Research confirmed this location's menu is served as static HTML (WordPress + Breakdance), making Cheerio sufficient — no headless browser required.
- **D-04:** The scraper should target the ZZ Pizza Gamlebyen menu page. Exact URL to be confirmed during planning/research against the live site.

### Scraper Invocation & Output
- **D-05:** Invoke via `npm prebuild` script — runs automatically before `npm run build`, works on any CI platform without extra steps.
- **D-06:** Write output to `public/menu.json` — Astro/Vite copies `public/` as-is to `dist/`, enabling independent browser caching of the data file separate from the JS bundle.

### Validation
- **D-07:** Build must fail with a clear error message if scraper returns 0 pizza items — no silent empty-data deployments (DATA-03).
- **D-08:** menu.json must be listed in `.gitignore` (DATA-04).

### Data Schema (required fields per DATA-02)
- `name` — string, pizza name
- `description` — string, pizza description
- `price_nok` — integer, price in Norwegian Krone (parsed from string like "195,-")
- `vegetarian` — boolean, derived from site label or ingredient inference

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project goals, constraints, core value
- `.planning/REQUIREMENTS.md` — DATA-01 through DATA-04 (Phase 1 requirements)
- `.planning/ROADMAP.md` — Phase 1 success criteria

### Research
- `.planning/research/STACK.md` — Technology recommendations (Cheerio, Node.js, Astro, Tailwind)
- `.planning/research/ARCHITECTURE.md` — Two-stage pipeline pattern, data flow, build order
- `.planning/research/PITFALLS.md` — Critical pitfalls: silent failure, selector fragility, UTF-8 encoding, price parsing

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code.

### Established Patterns
- None yet — this is Phase 1.

### Integration Points
- `public/menu.json` is the output artifact that Phase 2 (App & Filters) will read from the browser at runtime.

</code_context>

<specifics>
## Specific Ideas

- ZZ Pizza's site uses WordPress + Breakdance page builder. Research confirmed static HTML rendering — Cheerio is sufficient. If a future site update switches to JS-rendered content, Playwright would be needed as a fallback.
- Price format on the site is likely "195,-" (Norwegian convention) — must be parsed to integer before writing JSON.
- Norwegian characters (ø, æ, å) must be handled — enforce UTF-8 in the fetch pipeline.

</specifics>

<deferred>
## Deferred Ideas

- Capturing allergen data and pizza images — considered during discussion but not included in Phase 1 requirements scope. Could be folded into Phase 2 if the scraper findings show they're easily available.

</deferred>

---

*Phase: 01-data-pipeline*
*Context gathered: 2026-04-08*
