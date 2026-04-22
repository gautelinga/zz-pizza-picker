# Phase 3: Deployment - Research

**Researched:** 2026-04-22
**Domain:** Cloudflare Pages (Git integration + deploy hooks), GitHub Actions cron, Astro build-time date formatting
**Confidence:** HIGH

## Summary

Phase 3 is a narrow deployment + UI-stamp phase. The decisions are already locked from CONTEXT.md, so research focuses on verifying the exact mechanics of each locked choice rather than exploring alternatives.

Three independent workstreams converge: (1) connecting the GitHub repo to Cloudflare Pages via Git integration so every push to `main` triggers a build, (2) adding a GitHub Actions cron workflow that POSTs to a Cloudflare deploy hook URL on Mondays at 06:00 UTC, and (3) adding a static "Menu last updated" date line to `index.astro` by parsing the already-present `scraped_at` field from `public/menu.json`.

All three workstreams are low-risk. Cloudflare Pages Git integration with Astro static output is a well-documented path. The deploy hook mechanism is a simple HTTP POST with no auth beyond the URL secret itself. The date formatting is a pure build-time string operation in frontmatter — no new dependencies.

**Primary recommendation:** Wire CF Pages first (DEPL-01), then add the GitHub Actions cron (DEPL-02), then add the date stamp (DEPL-03). All three can ship in a single small plan given their independence.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Display "Menu last updated" date in the footer, below the result card (or at bottom of the picker section when no result is shown yet)
- **D-02:** Format: `"Menu last updated: 7 Apr 2026"` — compact, matches ROADMAP.md example
- **D-03:** Data source: `scraped_at` field from `public/menu.json` (already present, ISO-8601 string) — parse and format at build time in `index.astro` frontmatter, pass as a prop to PizzaPicker or render directly in the page
- **D-04:** Styling: small, muted text (`text-sm text-neutral-400 text-center`) — purely informational, should not compete with the picker UI
- **D-05:** Rebuild on BOTH: (a) every push to `main` branch AND (b) weekly cron schedule
- **D-06:** Push-triggered rebuild: use Cloudflare Pages Git integration (CF auto-builds on push) — no Wrangler needed for this path
- **D-07:** Weekly cron: GitHub Actions workflow on `schedule: cron: '0 6 * * 1'` (Monday 06:00 UTC) hits a Cloudflare deploy hook URL stored as a GitHub secret (`CF_DEPLOY_HOOK_URL`)
- **D-08:** CF does the actual build for both paths (CF runs `npm run build`, which triggers `prebuild` scraper) — no separate GitHub Actions build step
- **D-09:** Use the Cloudflare Pages auto-generated `pages.dev` URL — no custom domain, no DNS setup required
- **D-10:** Project name in CF Pages: `zz-pizza-picker` (results in `zz-pizza-picker.pages.dev`) — or whatever CF assigns if that name is taken
- **D-11:** Cron expression: `0 6 * * 1` (Monday 06:00 UTC) — fresh for the week

### Claude's Discretion

- Exact CF Pages project name if `zz-pizza-picker` is taken — any sensible name is fine
- Whether `scraped_at` is formatted in `index.astro` frontmatter or in a small Astro utility function

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPL-01 | App is deployed and publicly accessible on Cloudflare Pages | CF Pages Git integration path verified: connect repo via dashboard, set build command `npm run build`, output dir `dist`. Produces `*.pages.dev` URL. |
| DEPL-02 | Menu is automatically rebuilt weekly via GitHub Actions + Cloudflare deploy hook | CF deploy hooks verified: create hook in dashboard → unique POST URL. GitHub Actions `curl -X POST` on cron schedule confirmed pattern. Secret stored as `CF_DEPLOY_HOOK_URL`. |
| DEPL-03 | UI shows when the menu was last scraped (e.g. "Menu last updated: 7 Apr 2026") | `scraped_at` ISO-8601 field already in `public/menu.json`. Formatting pattern confirmed via UI-SPEC. Pure frontmatter operation in `index.astro`. |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Cloudflare Pages (Git integration) | n/a (platform) | Static hosting + push-triggered builds | Already decided (D-06); free tier, Frankfurt PoP, Git integration auto-builds on push |
| GitHub Actions | n/a (platform) | Cron scheduler for weekly rebuild | Repo is already on GitHub; cron + curl is the zero-dependency path |
| Astro static build | 6.1.5 (installed) | Generates `dist/` output CF Pages serves | Already in project; `output: 'static'` already set in `astro.config.mjs` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `curl` (system) | bundled in `ubuntu-latest` | POST to CF deploy hook from GitHub Actions | Cron job step — no third-party Action needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `curl` in workflow | `cloudflare/pages-action` | Action adds complexity and API token requirement; curl + hook URL is simpler and already decided |
| Git integration (auto-build) | Wrangler CLI in GH Actions | Wrangler needs API token, account ID, builds in GH (not CF); Git integration is zero-config |

**Installation:** No new npm dependencies required for this phase. [VERIFIED: package.json]

---

## Architecture Patterns

### Recommended Project Structure

```
.github/
└── workflows/
    └── weekly-rebuild.yml    # Cron job that POSTs to CF deploy hook

src/
└── pages/
    └── index.astro           # Add scraped_at parsing + date stamp render
```

No other files need to be created or modified.

### Pattern 1: Cloudflare Pages Git Integration Setup

**What:** Connect GitHub repo to CF Pages via dashboard. CF watches `main` branch and auto-builds on every push using your specified build command and output directory.

**When to use:** Always — this is the D-06 locked path.

**Setup steps (manual, one-time in CF dashboard):**

1. Log into dash.cloudflare.com → Workers & Pages → Create application → Pages → Connect to Git
2. Authorize CF GitHub App (first-time only)
3. Select repo `zz-pizza-picker`
4. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Deploy — CF assigns `zz-pizza-picker.pages.dev` (or alternate if taken)

[CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/]
[CITED: https://developers.cloudflare.com/pages/configuration/git-integration/]

### Pattern 2: Cloudflare Deploy Hook

**What:** CF generates a unique HTTPS URL per project. Any HTTP POST to this URL triggers a production build of the connected branch. No auth header required — the URL is the secret.

**When to use:** For the cron-triggered rebuild path (D-07).

**Setup steps (manual, one-time in CF dashboard):**

1. In the CF Pages project → Settings → Build & deployments → Deploy hooks → Add deploy hook
2. Name: `github-actions-weekly`, Branch: `main`
3. CF provides a URL like `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/<uuid>`
4. Copy URL → add to GitHub repo → Settings → Secrets and variables → Actions → New repository secret → name: `CF_DEPLOY_HOOK_URL`

[CITED: https://developers.cloudflare.com/pages/configuration/deploy-hooks/]

### Pattern 3: GitHub Actions Cron Workflow

**What:** A minimal workflow file that runs on a schedule and fires a single `curl -X POST` to the CF deploy hook URL.

**When to use:** DEPL-02 weekly rebuild.

**Example:**

```yaml
# .github/workflows/weekly-rebuild.yml
# Source: documented pattern from Cloudflare Pages deploy hooks + GitHub Actions cron
name: Weekly menu rebuild

on:
  schedule:
    - cron: '0 6 * * 1'   # D-11: Monday 06:00 UTC
  workflow_dispatch:        # Allow manual trigger for testing

jobs:
  trigger-rebuild:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloudflare Pages deploy hook
        run: curl -X POST "$CF_DEPLOY_HOOK_URL"
        env:
          CF_DEPLOY_HOOK_URL: ${{ secrets.CF_DEPLOY_HOOK_URL }}
```

[CITED: https://developers.cloudflare.com/pages/configuration/deploy-hooks/]
[VERIFIED: GitHub Actions cron syntax and secret access pattern — community-standard]

Key points:
- `workflow_dispatch` enables manual runs for smoke-testing the hook before waiting for Monday
- The `env:` block exposes the secret to the shell step without printing it in logs
- CF deploy hook requires POST — GET returns a 405 [CITED: CF deploy hooks doc]

### Pattern 4: DEPL-03 Date Stamp in index.astro

**What:** Parse `scraped_at` from already-imported `menu.json` in the frontmatter, format it as `"Menu last updated: 7 Apr 2026"`, render as a static `<p>` below the `<PizzaPicker>` island.

**When to use:** Single addition — no new component, no Svelte, no runtime JS.

**Example (from UI-SPEC):**

```typescript
// index.astro frontmatter — add after existing `const menu = menuData as MenuData;`
// Source: 03-UI-SPEC.md (verified against index.astro current state)
const scrapedAt = new Date(menu.scraped_at);
const day = scrapedAt.getUTCDate();                          // integer, no leading zero
const month = scrapedAt.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
const year = scrapedAt.getUTCFullYear();
const lastUpdated = `Menu last updated: ${day} ${month} ${year}`;
```

```html
<!-- index.astro body — below <PizzaPicker> island -->
<!-- Source: 03-UI-SPEC.md element contract -->
<div class="w-full max-w-[400px] mx-auto px-4 pb-8">
  <p class="text-sm text-neutral-400 text-center">{lastUpdated}</p>
</div>
```

[VERIFIED: `scraped_at` field exists in public/menu.json as ISO-8601 string]
[VERIFIED: `menu` already typed as `MenuData` and in scope in index.astro frontmatter]
[CITED: 03-UI-SPEC.md — element contract, Tailwind classes, container width]

### Anti-Patterns to Avoid

- **Triggering a build in GitHub Actions instead of CF:** D-08 is explicit that CF does the actual build. The GH Actions cron job only hits the hook — it does not run `npm run build` or `astro build`.
- **Using GET instead of POST for the deploy hook:** CF deploy hooks require HTTP POST. GET returns an error. [CITED: CF deploy hooks doc]
- **Using `new Date().toLocaleString()` without UTC:** `scraped_at` is UTC ISO-8601. Without `timeZone: 'UTC'`, date formatting can shift the day by ±1 depending on the CF build machine's local timezone. Use UTC-aware methods (`getUTCDate()`, `getUTCFullYear()`) consistently.
- **Hardcoding the deploy hook URL in the workflow file:** The URL is a secret. Commit it and it becomes public. Always store in GitHub Secrets and reference via `${{ secrets.CF_DEPLOY_HOOK_URL }}`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron-triggered deploys | Custom server poller | GH Actions `schedule:` cron | Managed, free, reliable — zero infra |
| Static hosting | Self-host on VPS | Cloudflare Pages | Global CDN, free tier, Git integration, zero ops |
| Date formatting | Custom month-name lookup | `toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })` | Built-in JS — already returns "Apr", "Jan", etc. |

**Key insight:** Every problem in this phase has a zero-dependency solution. The GitHub Actions cron + curl pattern is intentionally minimal.

---

## Runtime State Inventory

> Step 2.5: This phase is NOT a rename/refactor/migration phase — it is a greenfield deployment phase. No runtime state inventory applies.

Omitted per execution flow guidance.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro build (`npm run build`) | CF build machine — v22.16.0 | v22.16.0 (CF Pages v3 image default) | Set `NODE_VERSION` env var if needed |
| npm | Package install at build time | Bundled with Node.js | 10.x | — |
| curl | GH Actions cron step | Bundled in `ubuntu-latest` runner | System | Use `wget -O- --post-data='' <URL>` |
| Cloudflare Pages account | DEPL-01 | Requires user action (manual dashboard step) | n/a | — |
| GitHub repo (remote) | GH Actions cron + CF Git integration | git status shows remote exists (master branch) | — | — |
| `CF_DEPLOY_HOOK_URL` secret | DEPL-02 GH Actions | NOT YET SET — must be added by user after creating hook | — | Cannot proceed without this |

[VERIFIED: Node.js v22.16.0 is CF Pages v3 build image default — cited from https://developers.cloudflare.com/pages/configuration/build-image/]
[VERIFIED: ubuntu-latest includes curl — GitHub-hosted runner standard]
[VERIFIED: local Node.js v22.22.2 exceeds CF build target — no mismatch issues]

**Missing dependencies with no fallback:**

- `CF_DEPLOY_HOOK_URL` GitHub Secret — blocks DEPL-02 until user creates the deploy hook in CF dashboard and adds the URL as a secret. This is a mandatory manual step.
- Cloudflare Pages project — blocks DEPL-01 and DEPL-02 until user connects the repo via CF dashboard. This is a mandatory manual step.

**Missing dependencies with fallback:**

- None.

---

## Common Pitfalls

### Pitfall 1: Node.js Version Mismatch at CF Build Time

**What goes wrong:** CF Pages v3 build image uses Node.js v22.16.0 by default. If the project were to depend on a different Node.js version, the build could fail silently or produce different output than local.

**Why it happens:** CF's build image is separate from local dev machine. Local is v22.22.2, CF default is v22.16.0 — both are Node 22, so this is unlikely to cause issues. No `.nvmrc` or `.node-version` file is currently in the project.

**How to avoid:** No action needed — both are Node 22 LTS. If a specific version is ever needed, add `NODE_VERSION=22` as a CF Pages environment variable.

**Warning signs:** Build log shows unexpected Node version; `npm ci` or `astro build` fails during CF build.

### Pitfall 2: `prebuild` Scraper Fails in CF Build Environment

**What goes wrong:** `npm run build` triggers `prebuild` which runs `node scripts/scrape.js` — a live HTTP fetch of `https://zz.pizza/gamlebyen/`. If ZZ Pizza's site is down at build time, the scraper returns 0 items and the build fails (by design, DATA-03).

**Why it happens:** Network-dependent build step in a CI environment; scraper is intentionally strict.

**How to avoid:** Accept this as correct behavior — the build failing loudly is better than deploying stale/empty data. Monitor CF build logs if weekly cron deploy fails. No mitigation needed for now (v2 DATA-05 covers manual rebuild).

**Warning signs:** CF build log shows "0 pizzas found" error from scraper; cron deploy failure notification in GitHub Actions.

### Pitfall 3: Deploy Hook URL Committed to Git

**What goes wrong:** Developer pastes the CF deploy hook URL directly into the workflow YAML. The hook URL is public (no auth header required), meaning anyone who reads the repo can trigger rebuilds.

**Why it happens:** Convenience — easier to hardcode than configure secrets.

**How to avoid:** Always use `${{ secrets.CF_DEPLOY_HOOK_URL }}` in the workflow. Store the URL only in GitHub Secrets.

**Warning signs:** Hook URL visible in git blame or GitHub Actions run logs.

### Pitfall 4: UTC Date Drift in `scraped_at` Formatting

**What goes wrong:** `new Date(menu.scraped_at).getDate()` returns the local day, not UTC. CF build machines may use UTC or another timezone. If `scraped_at` is "2026-04-07T00:30:00.000Z", `getDate()` in a UTC+1 timezone returns 7, but in a UTC-1 timezone returns 6.

**Why it happens:** JavaScript `Date` methods without UTC suffix are timezone-sensitive.

**How to avoid:** Use `getUTCDate()`, `getUTCFullYear()`, and pass `timeZone: 'UTC'` to `toLocaleString()`. The UI-SPEC already specifies this pattern correctly.

**Warning signs:** Displayed date is off by one day compared to the actual scrape timestamp.

### Pitfall 5: Cron Workflow File Location or Syntax Error

**What goes wrong:** GitHub Actions does not pick up the workflow file due to: wrong directory path, invalid YAML indentation, or incorrect cron syntax.

**Why it happens:** `.github/workflows/` directory does not exist yet (confirmed by codebase check). First-time setup; easy to misplace the file.

**How to avoid:** Create `.github/workflows/weekly-rebuild.yml` — note: `.github` at root, not inside `src/`. Validate cron expression: `0 6 * * 1` = minute 0, hour 6, any day-of-month, any month, Monday. Add `workflow_dispatch:` for immediate manual test after commit.

**Warning signs:** Workflow does not appear in GitHub Actions tab after push; YAML parse errors in Actions UI.

---

## Code Examples

Verified patterns from official sources and codebase inspection:

### Complete GitHub Actions Cron Workflow

```yaml
# .github/workflows/weekly-rebuild.yml
# Source: CF deploy hooks doc + GitHub Actions cron pattern
name: Weekly menu rebuild

on:
  schedule:
    - cron: '0 6 * * 1'
  workflow_dispatch:

jobs:
  trigger-rebuild:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloudflare Pages deploy hook
        run: curl -X POST "$CF_DEPLOY_HOOK_URL"
        env:
          CF_DEPLOY_HOOK_URL: ${{ secrets.CF_DEPLOY_HOOK_URL }}
```

### DEPL-03 Date Formatting in index.astro

```typescript
// index.astro frontmatter addition — after existing `const menu = menuData as MenuData;`
// Source: 03-UI-SPEC.md; verified against menu.json scraped_at field format
const scrapedAt = new Date(menu.scraped_at);
const day = scrapedAt.getUTCDate();
const month = scrapedAt.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
const year = scrapedAt.getUTCFullYear();
const lastUpdated = `Menu last updated: ${day} ${month} ${year}`;
```

```html
<!-- index.astro body — below <PizzaPicker client:load /> -->
<!-- Source: 03-UI-SPEC.md element contract -->
<div class="w-full max-w-[400px] mx-auto px-4 pb-8">
  <p class="text-sm text-neutral-400 text-center">{lastUpdated}</p>
</div>
```

### Cloudflare Pages Build Settings (Dashboard)

```
Framework preset:    Astro
Build command:       npm run build
Build output dir:    dist
Root directory:      (leave blank — repo root)
```

[CITED: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CF Pages v2 build image (Node 18) | CF Pages v3 build image (Node 22) | Migration in progress; v2 auto-migrates Feb 2027 | Node 22 is default today — no action needed |
| Wrangler CLI for all CF Pages deploys | Git integration for push-triggered builds | 2023+ | Much simpler: no API tokens for push deploys |

**Deprecated/outdated:**

- CF Pages v2 build image (Node 18.17.1): still available but EOL; v3 with Node 22.16.0 is the current default [CITED: https://developers.cloudflare.com/pages/configuration/build-image/]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CF Pages project name `zz-pizza-picker` is available; results in `zz-pizza-picker.pages.dev` | Architecture Patterns (Pattern 1) | If taken, CF assigns a different name — planner should note this is a best-effort name |
| A2 | `menu.scraped_at` is always a valid ISO-8601 string at build time | Code Examples (DEPL-03) | If field is absent or malformed, `new Date()` returns `Invalid Date` and `getUTCDate()` returns `NaN`. Build would succeed but display "Menu last updated: NaN undefined NaN". Low risk: scraper always writes this field (verified in scrape.js behavior from Phase 1). |

[ASSUMED: A1 — CF project name availability cannot be verified without a logged-in CF account]
[VERIFIED: A2 is low-risk — menu.json confirmed to contain `"scraped_at": "2026-04-10T21:39:28.472Z"`]

**If this table is empty:** N/A — two assumptions documented above.

---

## Open Questions (RESOLVED)

1. **CF Pages project name availability**
   - What we know: D-10 specifies `zz-pizza-picker` as the desired name
   - What's unclear: Whether another CF user has already claimed `zz-pizza-picker.pages.dev`
   - RESOLVED: Plan should note that if the name is taken, any sensible alternative (e.g., `zz-pizza-picker-oslo`, `pizza-picker-zz`) is acceptable per Claude's Discretion

2. **`menu.json` absent during CF build's first install step**
   - What we know: `public/menu.json` is in `.gitignore`, so it is not committed. CF clones the repo, runs `npm install`, then `npm run build` (which triggers `prebuild` = scraper). This means the scraper runs and writes `menu.json` before `astro build` needs it. The ordering is correct.
   - What's unclear: Whether CF's network environment can reach `https://zz.pizza/gamlebyen/` without restriction
   - RESOLVED: No action needed — CF Pages build workers have outbound internet access. If the scraper ever fails, the CF build log will show the error clearly.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on This Phase |
|-----------|---------------------|
| Stack: Astro (static output) | `output: 'static'` already set; `dist/` is the build output CF Pages must serve |
| Stack: Cloudflare Pages | Confirms hosting target; Git integration is the correct setup path |
| Stack: Native `fetch` + `cheerio` for scraping | Scraper runs at CF build time via `prebuild` — no changes needed |
| Simplicity: single tap interaction | No new UI complexity — DEPL-03 is a static text element |
| No custom domain (D-09) | No DNS setup, no `_headers` file, no SSL configuration needed |
| `menu.json` in `.gitignore` (DATA-04) | CF builds must scrape live — confirmed correct; scraper runs during `prebuild` |

---

## Validation Architecture

> `nyquist_validation` is explicitly `false` in `.planning/config.json` — this section is omitted per configuration.

---

## Security Domain

> `security_enforcement` is not set in `.planning/config.json` — treating as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No user auth in this phase |
| V3 Session Management | No | Static site; no sessions |
| V4 Access Control | No | Public site; no access control |
| V5 Input Validation | No | No user input in this phase; date is from build-time JSON |
| V6 Cryptography | No | No encryption needed |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Deploy hook URL exposure | Tampering (unauthorized builds) | Store URL in GitHub Secrets only; never commit to repo |
| Supply chain attack on build | Tampering | `cheerio` already pinned to exact `1.2.0` (no caret) per Phase 1 decision — maintained |
| Scraper fetching malicious redirect | Tampering | `fetch()` follows redirects by default; ZZ Pizza site is trusted and verified static HTML |

**Key finding:** Security surface is minimal. The only secret in this phase is the CF deploy hook URL. It should be treated like a password: GitHub Secrets, never in code, never in logs.

---

## Sources

### Primary (HIGH confidence)

- [CF Pages: Deploy Hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/) — hook URL format, POST method, security model
- [CF Pages: Deploy an Astro Site](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) — build command `npm run build`, output dir `dist`
- [CF Pages: Build Image](https://developers.cloudflare.com/pages/configuration/build-image/) — Node.js v22.16.0 default for v3 image
- [CF Pages: Git Integration](https://developers.cloudflare.com/pages/configuration/git-integration/) — push-triggered builds
- `public/menu.json` (codebase) — confirmed `scraped_at` field as ISO-8601 string
- `src/pages/index.astro` (codebase) — confirmed `menu` already typed and in scope
- `astro.config.mjs` (codebase) — confirmed `output: 'static'`
- `package.json` (codebase) — confirmed `prebuild` wiring; no new dependencies needed
- `.planning/phases/03-deployment/03-UI-SPEC.md` (codebase) — element contract, Tailwind classes, date formatting code

### Secondary (MEDIUM confidence)

- [GitHub Actions cron + curl webhook pattern](https://bradgarropy.com/blog/call-webhooks-from-github-actions) — corroborated by multiple community sources; standard pattern

### Tertiary (LOW confidence)

- None — all critical claims are verified against official CF docs or codebase inspection.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all verified against CF official docs and existing codebase
- Architecture: HIGH — CF Pages Git integration and deploy hook mechanics verified from official docs; GH Actions cron pattern is well-established
- Pitfalls: HIGH — derived from official docs constraints (POST-only hook, UTC date handling) and codebase facts (`.gitignore` for `menu.json`, no `.github` dir yet)

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (CF Pages platform changes infrequently; 30 days)
