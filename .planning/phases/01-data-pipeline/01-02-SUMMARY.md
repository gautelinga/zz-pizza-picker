---
phase: 01-data-pipeline
plan: 02
subsystem: data-pipeline
tags: [scraper, cheerio, nodejs, menu-json, vegetarian-inference, prebuild]

# Dependency graph
requires:
  - 01-data-pipeline/01  # Astro scaffold + cheerio installed
provides:
  - scripts/scrape.js — standalone ES module scraper (fetch, parse, validate, write)
  - package.json scrape + prebuild scripts wired
  - public/menu.json — 14-pizza structured artifact with schema-valid fields
affects:
  - 02-app-filters  # consumes public/menu.json at runtime

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Native fetch() with AbortSignal.timeout(10_000) — no axios/node-fetch
    - Cheerio h3 selector + /^\d+\./ regex prefix to distinguish pizza headings from FAQ h3s
    - Meat-keyword scan for vegetarian inference (no labels on ZZ Pizza site)
    - npm prebuild lifecycle hook auto-runs scraper before astro build

key-files:
  created:
    - scripts/scrape.js
    - public/menu.json  # gitignored artifact, regenerated each build
  modified:
    - package.json  # added scrape + prebuild scripts

key-decisions:
  - "Description extracted from div.bde-text (not p tag) — live Breakdance HTML uses div wrappers"
  - "Price located via parent().parent().find('div').filter(/^\\d+,-$/) traversal to reach cousin price div"
  - "LØKSUPPEPIZZA classified as meat (beef broth in description) — consistent with research note flagging it as debatable"
  - "tunfisk and tuna added to MEAT_KEYWORDS vs research reference implementation — extra coverage for fish"

# Metrics
duration: 20min
completed: 2026-04-12
---

# Phase 01 Plan 02: Menu Scraper Summary

**fetch + cheerio scraper targeting https://zz.pizza/gamlebyen/ produces 14 pizza objects with integer price_nok, boolean vegetarian, and UTF-8-intact Norwegian characters**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-12T22:00:00Z
- **Completed:** 2026-04-12T22:13:06Z
- **Tasks:** 2 (1 auto-fixed deviation)
- **Files modified:** 2 created (scripts/scrape.js, public/menu.json), 1 modified (package.json)

## Accomplishments

- `scripts/scrape.js` created as 121-line ES module — fetches, parses, validates, and writes
- 14 pizzas successfully scraped from live ZZ Pizza Gamlebyen site
- 6 vegetarian, 8 meat (vs research expectation of ~7/7; see breakdown below)
- Schema validated: all entries have name(string), description(string), price_nok(integer), vegetarian(boolean)
- Norwegian characters intact: ø, æ, å confirmed present, no Ã mojibake
- public/menu.json confirmed gitignored — not tracked, not committed
- `npm run build` will automatically invoke scraper via prebuild lifecycle hook

## Pizza Breakdown

| Count | Category | Pizza names |
|-------|----------|-------------|
| 6 | Vegetarian | MARGHERITA, CHILICHEESE, SOPP, POTET & LØPSTIKKEPESTO, GRØNNKÅL & HVITLØK, MARINARA |
| 8 | Meat | PEPPERONI, COPPA & BURRATA, PANCETTA & BLÅMUGG, OKSEHALE & GOCHUJANG, LØKSUPPEPIZZA, GUANCIALE & PECORINO, BARNEPIZZA, MORTADELLA & PROVOLONE |

Note: Research table expected ~7/7; LØKSUPPEPIZZA is classified meat due to "oksekraft" (beef broth) in description. Research flagged this as debatable. MORTADELLA & PROVOLONE appears to be a new menu entry not present during research.

## Task Commits

| Task | Name | Commit | Key changes |
|------|------|--------|-------------|
| 1 | Create scripts/scrape.js | de83317 | 117-line scraper created |
| 1 (fix) | Fix Breakdance selector deviation | e2eafc5 | div selector replaces p selector |
| 2 | Wire npm scripts, run live | 546f045 | package.json scrape + prebuild |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Live HTML uses div.bde-text wrappers, not p tags**

- **Found during:** Task 1 verification (first `npm run scrape` run)
- **Issue:** Research documented the menu HTML as `<h3>` followed by `<p>` siblings. The live site (built with Breakdance page builder) wraps all text content in `<div class="bde-text-*">` elements. `$(el).next('p')` returned empty string for every pizza.
- **Fix:** Changed description selector from `$(el).next('p')` to `$(el).next('div')`. Changed price selector from `$(el).nextUntil('h3', 'p').filter(...)` to `$(el).parent().parent().find('div').filter(/^\s*\d+,-\s*$/)` — traversing the bde-div-outer > bde-div-inner + price-div DOM shape.
- **Files modified:** scripts/scrape.js
- **Commit:** e2eafc5

## Failure-Mode Simulations

Both simulations confirmed working:

1. **Network failure:** Fetching `https://invalid-host-that-does-not-exist.zz.pizza/` threw `fetch failed` — caught by try/catch, printed descriptive error, exited with code 1. Confirmed correct.

2. **Zero-item guard:** Using `$('h99')` selector (no matches) — scraper printed "Scrape error: 0 pizzas extracted from https://zz.pizza/gamlebyen/. ZZ Pizza site structure may have changed. Aborting build." and exited with code 1. Confirmed correct.

## gitignore Verification

`git status --short public/menu.json` returns empty output — file is gitignored, not tracked. DATA-04 (gitignore) confirmed working from Plan 01.

## Requirements Completed

- **DATA-01:** Scraper fetches ZZ Pizza menu from https://zz.pizza/gamlebyen/ and writes structured JSON — DONE
- **DATA-02:** Schema has name (string), description (string), price_nok (integer), vegetarian (boolean) — DONE
- **DATA-03:** Zero-item case exits 1 with clear error "0 pizzas extracted" — DONE

## Known Stubs

None. All fields are populated from live scraped data.

## Threat Flags

None. All T-01-02-* mitigations implemented as specified in the plan threat model:
- T-01-02-01: TARGET_URL is a hardcoded constant, not env/argv
- T-01-02-03/04: AbortSignal.timeout(10_000) applied
- T-01-02-06: pizzas.length === 0 guard with process.exit(1)
- T-01-02-07: writeFileSync with explicit 'utf-8' encoding
- T-01-02-09: scraped_at + source_url embedded in output

## Self-Check: PASSED

All files confirmed present on disk:
- scripts/scrape.js — FOUND
- public/menu.json — FOUND
- .planning/phases/01-data-pipeline/01-02-SUMMARY.md — FOUND

All commits confirmed in git log:
- de83317 (feat: create scripts/scrape.js) — FOUND
- 546f045 (feat: wire npm scripts) — FOUND
- e2eafc5 (fix: Breakdance selector deviation) — FOUND
