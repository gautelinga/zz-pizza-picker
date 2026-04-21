# Roadmap: ZZ Pizza Picker

## Overview

Three phases take ZZ Pizza Picker from raw web scraping to a publicly accessible, self-updating picker. Phase 1 builds the data foundation — scraping ZZ Pizza's menu into structured JSON. Phase 2 delivers the full interactive experience: spin, reveal, and filter. Phase 3 ships the app publicly and automates the menu refresh so it stays current without manual intervention.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Data Pipeline** - Scrape ZZ Pizza's menu into structured, build-safe JSON
- [ ] **Phase 2: App & Filters** - Interactive picker UI with spin, reveal, and filter controls
- [ ] **Phase 3: Deployment** - Ship publicly on Cloudflare Pages with automated weekly menu refresh

## Phase Details

### Phase 1: Data Pipeline
**Goal**: The project can reliably fetch and structure ZZ Pizza's menu at build time
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. Running the scraper produces a valid menu.json with pizza name, description, price (integer NOK), and vegetarian flag for each item
  2. A build that returns 0 pizza items fails loudly with a clear error (no silent empty data)
  3. menu.json is listed in .gitignore and not tracked in version control
**Plans**: 2 plans
- [x] 01-01-PLAN.md — Environment setup, Astro scaffold, and .gitignore for DATA-04
- [x] 01-02-PLAN.md — Scraper implementation + prebuild wiring for DATA-01/02/03

### Phase 2: App & Filters
**Goal**: Users can open the app, spin for a random pizza, and filter by diet preference
**Depends on**: Phase 1
**Requirements**: CORE-01, CORE-02, CORE-03, FILT-01, FILT-02, FILT-03
**Success Criteria** (what must be TRUE):
  1. User can tap/click once to receive a random pizza result showing name, description, and price
  2. User can re-spin without reloading the page to get a different pizza
  3. User can toggle between all pizzas, vegetarian only, and meat only — and the result pool changes accordingly
  4. User sees a live count of eligible pizzas before spinning
  5. When no pizzas match the active filter, the spin button is disabled with an explanation visible
**Plans**: 3 plans
- [ ] 02-01-PLAN.md — Install Svelte 5 + Tailwind v4 toolchain, shared Pizza/Filter types, global.css entry
- [ ] 02-02-PLAN.md — Build PizzaPicker.svelte island (filter + spin + result) and wire index.astro
- [ ] 02-03-PLAN.md — Human-verify checkpoint: full UI + interaction + accessibility walk-through
**UI hint**: yes

### Phase 3: Deployment
**Goal**: The app is live at a public URL with the menu staying current automatically
**Depends on**: Phase 2
**Requirements**: DEPL-01, DEPL-02, DEPL-03
**Success Criteria** (what must be TRUE):
  1. Anyone can open the app in a browser (desktop or mobile) at a public Cloudflare Pages URL
  2. The menu is automatically re-scraped and the site rebuilt on a weekly schedule via GitHub Actions
  3. The app displays the date the menu was last scraped (e.g. "Menu last updated: 7 Apr 2026")
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Pipeline | 1/2 | In Progress|  |
| 2. App & Filters | 0/3 | Not started | - |
| 3. Deployment | 0/TBD | Not started | - |
