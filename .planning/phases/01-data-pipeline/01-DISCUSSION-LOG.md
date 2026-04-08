# Phase 1: Data Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 01-data-pipeline
**Areas discussed:** Veg detection, Target URL, Scraper setup

---

## Veg Detection

| Option | Description | Selected |
|--------|-------------|----------|
| Trust the site | Use ZZ Pizza's own label/category for vegetarian | ✓ |
| Infer from ingredients | Scan ingredient text for meat keywords | (fallback) |
| Manual override list | Hardcode known veg pizzas | |

**User's choice:** Trust the site — use ZZ Pizza's own labeling. Fallback: infer from ingredients if site doesn't label explicitly.

---

## Target URL

| Option | Description | Selected |
|--------|-------------|----------|
| Gamlebyen | Oslo location with confirmed scrapeable static HTML | ✓ |
| User-provided URL | I know the exact page | |

**User's choice:** Gamlebyen location.

---

## Scraper Setup

### Invocation

| Option | Description | Selected |
|--------|-------------|----------|
| npm prebuild script | Automatic before build, works on any CI | ✓ |
| Separate npm run scrape | Explicit two-step | |
| Astro integration hook | Tighter coupling, more complex | |

**User's choice:** npm prebuild script.

### Output location

| Option | Description | Selected |
|--------|-------------|----------|
| public/menu.json | Vite copies as-is, independently cacheable | ✓ |
| src/data/menu.json | Bundled into JS build | |

**User's choice:** public/menu.json.

---

## Claude's Discretion

- Exact CSS selectors for parsing the ZZ Pizza menu — planner to determine from live site inspection.
- Meat keyword list for ingredient-based veg inference fallback — planner to populate based on actual menu content.

## Deferred Ideas

- Allergens and pizza images — noted but not in Phase 1 scope.
