# Phase 3: Deployment - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the ZZ Pizza Picker publicly on Cloudflare Pages and automate weekly menu refresh via GitHub Actions → Cloudflare deploy hook. Add "Menu last updated" date to the UI.

Delivers DEPL-01 (public URL), DEPL-02 (weekly auto-rebuild), DEPL-03 (last-scraped date visible).

</domain>

<decisions>
## Implementation Decisions

### "Menu last updated" date (DEPL-03)
- **D-01:** Display in the footer, below the result card (or at bottom of the picker section when no result is shown yet)
- **D-02:** Format: `"Menu last updated: 7 Apr 2026"` — compact, matches ROADMAP.md example
- **D-03:** Data source: `scraped_at` field from `public/menu.json` (already present, ISO-8601 string) — parse and format at build time in `index.astro` frontmatter, pass as a prop to PizzaPicker or render directly in the page
- **D-04:** Styling: small, muted text (follow Phase 2 pattern: `text-sm text-neutral-400 text-center`) — purely informational, should not compete with the picker UI

### Rebuild triggers (DEPL-02)
- **D-05:** Rebuild on BOTH: (a) every push to `main` branch AND (b) weekly cron schedule
- **D-06:** Push-triggered rebuild: use Cloudflare Pages Git integration (CF auto-builds on push) — no Wrangler needed for this path
- **D-07:** Weekly cron: GitHub Actions workflow on `schedule: cron: '0 6 * * 1'` (Monday 06:00 UTC) hits a Cloudflare deploy hook URL stored as a GitHub secret (`CF_DEPLOY_HOOK_URL`)
- **D-08:** CF does the actual build for both paths (CF runs `npm run build`, which triggers `prebuild` scraper) — no separate GitHub Actions build step

### Public URL (DEPL-01)
- **D-09:** Use the Cloudflare Pages auto-generated `pages.dev` URL — no custom domain, no DNS setup required
- **D-10:** Project name in CF Pages: `zz-pizza-picker` (results in `zz-pizza-picker.pages.dev`) — or whatever CF assigns if that name is taken

### Weekly schedule
- **D-11:** Cron expression: `0 6 * * 1` (Monday 06:00 UTC) — fresh for the week

### Claude's Discretion
- Exact CF Pages project name if `zz-pizza-picker` is taken — any sensible name is fine
- Whether `scraped_at` is formatted in `index.astro` frontmatter or in a small Astro utility function

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project stack decisions (already locked)
- `CLAUDE.md` — Full stack rationale including Cloudflare Pages choice, GitHub Actions webhook approach, static output constraint
- `.planning/REQUIREMENTS.md` — DEPL-01, DEPL-02, DEPL-03 acceptance criteria

### Existing build wiring
- `package.json` — `prebuild` script runs scraper before `astro build`; `npm run build` is the correct entry point
- `scripts/scrape.js` — scraper that writes `public/menu.json` with `scraped_at` field
- `astro.config.mjs` — `output: 'static'` already set
- `src/pages/index.astro` — page where `scraped_at` date will be sourced and rendered

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/menu.json` already contains `scraped_at` (ISO-8601 string) — no scraper changes needed for DEPL-03
- `src/pages/index.astro` already imports `menu.json` and types it as `MenuData` — `scraped_at` is already in scope
- `src/styles/global.css` Tailwind v4 entry — footer text can use existing utility classes

### Established Patterns
- Phase 2 neutral text convention: `text-sm text-neutral-400` (or `text-neutral-500`) for secondary/meta information
- Build-time data injection via Astro frontmatter ESM import (already proven in Phase 2)

### Integration Points
- `index.astro` frontmatter: add date formatting logic here, render `<p>` in the page body below the PizzaPicker island
- `.github/workflows/` directory: does not exist yet — needs to be created
- Cloudflare Pages: no project exists yet — manual dashboard step to connect the repo

</code_context>

<specifics>
## Specific Ideas

- Footer text verbatim per ROADMAP.md example: `"Menu last updated: 7 Apr 2026"` (day Month year, no leading zero)
- GitHub Actions secret name: `CF_DEPLOY_HOOK_URL` (the Cloudflare deploy hook URL)
- Cloudflare Pages build settings: Build command `npm run build`, output directory `dist`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-deployment*
*Context gathered: 2026-04-22*
