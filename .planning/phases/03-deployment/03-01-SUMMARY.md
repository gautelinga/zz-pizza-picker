---
phase: 03-deployment
plan: 01
subsystem: infra
tags: [astro, github-actions, cloudflare-pages, tailwind, cron]

# Dependency graph
requires:
  - phase: 02-ui
    provides: "src/pages/index.astro with PizzaPicker island and menu.json import"
  - phase: 01-data-pipeline
    provides: "public/menu.json with scraped_at field, MenuData TypeScript type"
provides:
  - "index.astro renders UTC-safe 'Menu last updated: D Mon YYYY' below PizzaPicker island"
  - "GitHub Actions cron workflow triggers Cloudflare Pages weekly rebuild via deploy hook"
affects: [03-02, deployment, ci-cd]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "UTC-safe date parsing: getUTCDate(), getUTCFullYear(), toLocaleString with timeZone UTC"
    - "CF deploy hook triggered via curl POST from GitHub Actions — CF does the actual build"
    - "Secrets referenced via ${{ secrets.NAME }} — never hardcoded in workflow files"

key-files:
  created:
    - .github/workflows/weekly-rebuild.yml
  modified:
    - src/pages/index.astro

key-decisions:
  - "Use getUTCDate/getUTCFullYear (not getDate/getFullYear) to prevent ±1 day drift on CF build machines"
  - "Cron set to Monday 06:00 UTC — fresh for start of week, safe window before Oslo business hours"
  - "CF deploy hook URL stored exclusively in GitHub Secrets — never committed to repo (T-03-01 mitigation)"
  - "workflow_dispatch added to allow manual smoke-testing of the deploy hook without waiting for Monday"
  - "GitHub Actions workflow only fires the hook — CF Pages handles npm run build, not GitHub Actions"

patterns-established:
  - "UTC-safe date formatting pattern: use UTC methods + timeZone UTC in toLocaleString for all build-time date rendering"
  - "Deploy hook secret pattern: ${{ secrets.CF_DEPLOY_HOOK_URL }} referenced in env block, never inline"

requirements-completed: [DEPL-02, DEPL-03]

# Metrics
duration: 8min
completed: 2026-04-22
---

# Phase 3 Plan 01: Date Stamp and Weekly Rebuild Workflow Summary

**UTC-safe "Menu last updated" stamp rendered below the picker island, with a Monday 06:00 UTC GitHub Actions cron firing a Cloudflare Pages deploy hook via secrets**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-22T15:20:00Z
- **Completed:** 2026-04-22T15:28:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `index.astro` now renders `Menu last updated: D Mon YYYY` below PizzaPicker using UTC-safe date parsing from `menu.scraped_at`
- `.github/workflows/weekly-rebuild.yml` created with Monday 06:00 UTC cron, manual dispatch, and secure deploy hook secret
- `npx astro check` exits 0 — no TypeScript errors introduced

## Task Commits

Each task was committed atomically:

1. **Task 1: Add "Menu last updated" date stamp to index.astro (DEPL-03)** - `bf80ceb` (feat)
2. **Task 2: Create GitHub Actions weekly-rebuild workflow (DEPL-02)** - `1a5f040` (feat)

**Plan metadata:** committed with SUMMARY.md

## Files Created/Modified
- `src/pages/index.astro` - Added UTC-safe date parsing block and `<div>/<p>` date stamp below PizzaPicker
- `.github/workflows/weekly-rebuild.yml` - New: weekly cron + manual dispatch triggering CF deploy hook

## Decisions Made
- UTC-safe methods (`getUTCDate`, `getUTCFullYear`, `timeZone: 'UTC'` in `toLocaleString`) prevent ±1 day drift when CF build worker timezone differs from UTC
- Cron expression `0 6 * * 1` (Monday 06:00 UTC) chosen per D-11 in 03-CONTEXT.md
- Deploy hook URL stored exclusively in `secrets.CF_DEPLOY_HOOK_URL` — satisfies threat model T-03-01
- GitHub Actions workflow fires only the hook; CF Pages performs `npm run build` (D-08 in 03-CONTEXT.md)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

Before the weekly rebuild workflow can fire successfully, the user must:

1. **Create the Cloudflare Pages project** (if not yet done) — connect the GitHub repo in the CF Pages dashboard
2. **Generate a CF deploy hook URL** — in CF Pages project Settings > Builds & deployments > Deploy hooks
3. **Add the GitHub repository secret** — in GitHub repo Settings > Secrets and variables > Actions:
   - Name: `CF_DEPLOY_HOOK_URL`
   - Value: the deploy hook URL from step 2

The workflow will fail silently (curl POST to an undefined URL) until the secret is set. The `workflow_dispatch` trigger allows a manual test run to verify the hook is wired correctly.

## Next Phase Readiness
- DEPL-03 (date stamp) and DEPL-02 (weekly rebuild) are complete and committed
- Plan 03-02 (Cloudflare Pages deployment infrastructure) can proceed independently
- No TypeScript errors — `npx astro check` clean

---
*Phase: 03-deployment*
*Completed: 2026-04-22*
