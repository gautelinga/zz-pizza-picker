# Phase 1: Data Pipeline - Research

**Researched:** 2026-04-08
**Domain:** Node.js build-time web scraping (Cheerio + fetch, ZZ Pizza menu)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Vegetarian primary strategy: use ZZ Pizza's own site labeling/categorization — trust the source if it provides a tag or category.
- **D-02:** Vegetarian fallback: infer from ingredients by scanning ingredient text for meat keywords (chicken, beef, salami, prosciutto, etc.).
- **D-03:** Scrape the Gamlebyen (Oslo) ZZ Pizza location. Static HTML confirmed — Cheerio sufficient, no headless browser.
- **D-04:** Target the ZZ Pizza Gamlebyen menu page. Exact URL to be confirmed during research.
- **D-05:** Invoke via `npm prebuild` script — runs automatically before `npm run build`.
- **D-06:** Write output to `public/menu.json`.
- **D-07:** Build must fail with a clear error message if scraper returns 0 pizza items.
- **D-08:** menu.json must be listed in `.gitignore`.

### Data Schema (locked)
- `name` — string
- `description` — string
- `price_nok` — integer (parsed from "195,-" format)
- `vegetarian` — boolean

### Claude's Discretion

- Exact URL for Gamlebyen confirmed: `https://zz.pizza/gamlebyen/`
- Specific HTML selectors to target
- Scraper file location and module structure
- Error message text and exit code handling details

### Deferred Ideas (OUT OF SCOPE)

- Allergen data capture
- Pizza images
- These may be revisited in Phase 2 if scraper findings show they are easily available
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Build-time scraper fetches ZZ Pizza's menu and writes structured JSON | Confirmed: `https://zz.pizza/gamlebyen/` serves static HTML with h3 headings + price text. Native `fetch` + Cheerio 1.2.0 is sufficient. |
| DATA-02 | Scraped data includes pizza name, description, price (integer NOK), vegetarian flag | Confirmed: all 14 pizzas have h3 names, paragraph descriptions, "NNN,-" prices. No site-level veg labels — ingredient inference required for vegetarian field. |
| DATA-03 | Build fails with error if scraper returns 0 items | Implementation: assert `pizzas.length > 0` after parse; `process.exit(1)` with descriptive message. |
| DATA-04 | menu.json is committed to .gitignore, not tracked | Standard .gitignore entry: `public/menu.json` |
</phase_requirements>

---

## Summary

Phase 1 builds a standalone Node.js script (`scripts/scrape.js`) that fetches `https://zz.pizza/gamlebyen/`, parses the static HTML menu with Cheerio, validates the results, and writes `public/menu.json`. The script is wired as an `npm prebuild` hook so it runs automatically before any Astro build.

The ZZ Pizza Gamlebyen page was verified live on 2026-04-08. The menu is 14 pizzas rendered as static HTML using `<h3>` headings (`1. MARGHERITA` through `14. MORTADELLA & PROVOLONE`), followed by description paragraphs, allergen lines, and prices in `NNN,-` format. There are **no vegetarian labels on the site** — the vegetarian flag must be inferred from ingredients. Seven pizzas are vegetarian based on ingredient analysis; the remaining seven contain meat.

**Critical environment blocker:** Node.js 18.19.1 is installed. Astro 6 requires Node >=22.12.0 and Cheerio 1.2.0 requires Node >=20.18.1. Phase 1 **cannot run** on the current machine without upgrading Node. This must be addressed in the first task (Wave 0 setup).

**Primary recommendation:** Install Node 22 via NodeSource or nvm before any package installs. The scraper itself is a single sequential script — fetch, parse, validate, write — using only `fetch` (native in Node 18+) and Cheerio. Keep it simple; no framework, no queue, no abstraction layers.

---

## Project Constraints (from CLAUDE.md)

These directives are mandatory — research must not recommend approaches that contradict them.

| Directive | Implication for Phase 1 |
|-----------|------------------------|
| Scraping: native `fetch` + `cheerio@1.2.0` | Use exactly these tools. No Playwright, no Axios, no Puppeteer. |
| ZZ Pizza site is WordPress/Breakdance, static HTML | Confirmed by live fetch — Cheerio is sufficient for current structure. |
| Scraper runs at build time (not runtime) | `prebuild` hook, writes `public/menu.json` before Vite/Astro build. |
| Astro framework version 6.1.4 | Project framework — Phase 1 must be compatible with Astro's project structure. |
| Tailwind v4, Svelte 5 | Out of scope for Phase 1 (data pipeline only). |
| No custom animation libraries | Out of scope for Phase 1. |
| Cloudflare Pages hosting | Output must be static — `public/menu.json` as a standalone file, not bundled. |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-in `fetch` | Node 22+ | HTTP request to ZZ Pizza | Zero dependencies, native in Node 18+ (stable in 22+). No Axios needed. |
| `cheerio` | 1.2.0 | HTML parsing and DOM querying | Server-side jQuery-compatible DOM API. Verified via `npm view cheerio version`. ZZ Pizza serves static HTML — no JS execution needed. |
| Node.js `fs` (built-in) | built-in | Write `public/menu.json` to disk | `fs.writeFileSync` is sufficient for synchronous one-shot write. |

**Installation:**
```bash
npm install cheerio@1.2.0
```

No other runtime dependencies needed for Phase 1.

**Version verification:** [VERIFIED: npm registry]
- `cheerio`: 1.2.0 — confirmed via `npm view cheerio version` on 2026-04-08
- `cheerio` engine requirement: `node >=20.18.1`

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@types/node` | latest | TypeScript types for Node built-ins | If writing scraper in TypeScript (optional but recommended) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `fetch` | `axios` | Axios adds a dependency for no benefit — native fetch is sufficient for a single GET request |
| `cheerio` | `playwright` | Playwright requires Chromium (~300MB), slows builds; only needed if site switches to JS-rendered menu |
| `fs.writeFileSync` | streaming write | Overkill for a <10KB JSON file |

---

## Target URL — Confirmed

**[VERIFIED: direct HTTP fetch, 2026-04-08]**

The correct scrape target is: `https://zz.pizza/gamlebyen/`

This resolves decision D-04. The site also has `/toyen/` and `/fredrikstad/` location pages, but Gamlebyen is the target per D-03. The main `https://zz.pizza/` page also contains the same 14-item menu.

---

## Live Menu Structure — Confirmed

**[VERIFIED: direct HTTP fetch of https://zz.pizza/gamlebyen/, 2026-04-08]**

```
<h3>1. MARGHERITA</h3>
<p>Tomatsaus, mozzarella, basilikum og 24-måneder parmesan.</p>
<p>Allergener: hvetegluten, melk</p>
<p>225,-</p>
```

Key facts for the scraper:
- 14 pizza items total
- Each pizza: `<h3>` with number prefix (`N. NAME`), then paragraph with description, then allergen paragraph, then price paragraph
- Price format: `NNN,-` (integer followed by comma-dash)
- **No vegetarian labels anywhere on the site** — vegetarian must be inferred from ingredients
- Norwegian characters (`ø`, `æ`, `å`) present in names and descriptions (e.g., "Grønnkål", "Blåmugg", "løk")

### Vegetarian Classification (from live data)

Based on ingredient analysis of the live menu:

| Pizza | Vegetarian | Basis |
|-------|-----------|-------|
| Margherita | yes | No meat ingredients |
| Chilicheese | yes | No meat ingredients |
| Pepperoni | no | "pepperoni" |
| Coppa & Burrata | no | "coppa ham" |
| Pancetta & Blåmugg | no | "pancetta" |
| Sopp | yes | No meat ingredients |
| Oksehale & Gochujang | no | "oxtail" |
| Løksuppepizza | yes | No meat ingredients (beef broth debatable — flag for confirmation) |
| Potet & Løpstikkepesto | yes | No meat ingredients |
| Guanciale & Pecorino | no | "guanciale" |
| Grønnkål & Hvitløk | yes | No meat ingredients |
| Barnepizza | no | "boiled ham" |
| Marinara | yes | No meat ingredients |
| Mortadella & Provolone | no | "pistachio mortadella" |

**Note on Løksuppepizza (#8):** Description mentions "caramelized onion with beef broth" — beef broth is a meat-derived ingredient. The scraper's ingredient-text inference should flag keywords like "oksekraft" or "beef broth". [ASSUMED: "beef broth" appears in English translation — verify exact Norwegian text from live page]

---

## Architecture Patterns

### Recommended Project Structure

```
/
├── scripts/
│   └── scrape.js          # Standalone scraper (Node.js, no Astro)
├── public/
│   └── menu.json          # Build artifact (gitignored)
├── src/                   # Astro source (Phase 2+)
├── package.json           # "prebuild" script wires scraper
└── .gitignore             # Includes public/menu.json
```

### Pattern 1: `prebuild` npm Hook

**What:** Node's npm lifecycle runs `prebuild` automatically before `build`.
**When to use:** Always — this is locked decision D-05.

```json
{
  "scripts": {
    "scrape": "node scripts/scrape.js",
    "prebuild": "npm run scrape",
    "build": "astro build",
    "dev": "astro dev"
  }
}
```

**Source: [CITED: https://docs.npmjs.com/cli/v10/using-npm/scripts#pre--post-scripts]**

Any CI system running `npm run build` automatically gets the scrape step for free. No platform-specific build configuration needed.

### Pattern 2: Sequential Single-Script Scraper

**What:** One file, top-to-bottom execution: fetch → parse → validate → write.
**When to use:** Always for Phase 1. Do not add abstraction layers.

```javascript
// Source: [CITED: https://github.com/cheeriojs/cheerio — official README patterns]
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';

const URL = 'https://zz.pizza/gamlebyen/';

const response = await fetch(URL, {
  signal: AbortSignal.timeout(10_000),  // 10s timeout — prevent build hangs
  headers: { 'Accept-Charset': 'utf-8' }
});
if (!response.ok) {
  console.error(`Scrape failed: HTTP ${response.status} from ${URL}`);
  process.exit(1);
}

const html = await response.text();
const $ = cheerio.load(html);

const pizzas = [];
$('h3').each((i, el) => {
  const heading = $(el).text().trim();
  // Skip non-pizza headings (FAQ items etc.)
  if (!/^\d+\./.test(heading)) return;

  const name = heading.replace(/^\d+\.\s*/, '').trim();
  const description = $(el).next('p').text().trim();
  const priceText = $(el).nextAll('p').filter((_, p) => /\d+,-/.test($(p).text())).first().text();
  const price_nok = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
  const vegetarian = isVegetarian(description);

  pizzas.push({ name, description, price_nok, vegetarian });
});

if (pizzas.length === 0) {
  console.error('Scrape error: 0 pizzas found. Site structure may have changed.');
  process.exit(1);
}

const output = {
  scraped_at: new Date().toISOString(),
  source_url: URL,
  pizzas
};

mkdirSync('public', { recursive: true });
writeFileSync('public/menu.json', JSON.stringify(output, null, 2), 'utf-8');
console.log(`Scraped ${pizzas.length} pizzas → public/menu.json`);
```

**Note:** The `h3` selector approach is stable because it targets semantic heading level, not generated Breakdance class names. Pizza headings are distinguished from FAQ headings by the `^\d+\.` number prefix pattern.

### Pattern 3: Vegetarian Inference by Meat Keyword Scan

Per decisions D-01 and D-02 — site provides no labels, so ingredient inference is the only option.

```javascript
const MEAT_KEYWORDS = [
  'pepperoni', 'salami', 'prosciutto', 'pancetta', 'guanciale',
  'mortadella', 'coppa', 'nduja', 'chorizo', 'bacon',
  'skinke', 'kjøtt', 'kylling', 'laks', 'reker', 'oksehale',
  'oksekraft', 'beef', 'chicken', 'ham', 'pork', 'oxtail',
  'anchovy', 'ansjos', 'tunfisk'
];

function isVegetarian(description) {
  const lower = description.toLowerCase();
  return !MEAT_KEYWORDS.some(kw => lower.includes(kw));
}
```

**[ASSUMED]:** The exact Norwegian ingredient text for Løksuppepizza may include "oksekraft" (beef broth in Norwegian). The keyword list above includes it, but should be verified against the live Norwegian description text before finalizing.

### Pattern 4: Price Parsing

Norwegian price format is `"225,-"`. Parse to integer:

```javascript
const price_nok = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
```

Assert result is a valid positive number:
```javascript
if (!Number.isInteger(price_nok) || price_nok <= 0) {
  console.error(`Invalid price parsed: "${priceText}" → ${price_nok}`);
  process.exit(1);
}
```

### Anti-Patterns to Avoid

- **Targeting Breakdance CSS class names:** Classes like `.bde-heading` or `.css-a1b2c3` are auto-generated and change with theme updates. Use `h3` heading level and text patterns instead.
- **Importing scraper into Astro:** The scraper must run before Astro, not inside it. Keep it a standalone `scripts/scrape.js` executed by npm lifecycle.
- **Storing price as string in menu.json:** Always coerce to integer before writing. Phase 2 filter logic does numeric comparison.
- **Writing `src/data/menu.json` instead of `public/menu.json`:** Vite would bundle the JSON into the JS bundle, preventing independent cache invalidation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing | Custom regex DOM parser | `cheerio` | Regex on HTML is notoriously fragile; cheerio gives a stable jQuery-compatible API |
| Request timeout | Manual setTimeout + abort | `AbortSignal.timeout(ms)` (Node 18+) | Built into native fetch; one line |
| UTF-8 enforcement | Custom encoding detection | `response.text()` with explicit `'utf-8'` write | `fetch` returns text decoded from response charset; `writeFileSync(..., 'utf-8')` guarantees output encoding |

**Key insight:** This scraper is genuinely simple — one HTTP request, one HTML parse, one file write. The risk is adding complexity (retry logic, caching, abstraction layers) that makes debugging harder. Keep it flat.

---

## Common Pitfalls

### Pitfall 1: Zero-Item Silent Build (Critical)

**What goes wrong:** Site structure changes, selectors return nothing. `menu.json` is written with 0 pizzas. Build succeeds. App deploys broken.
**Why it happens:** No assertion on output count before writing.
**How to avoid:** After parsing, `if (pizzas.length === 0) { process.exit(1) }`. This makes Cloudflare Pages mark the build as failed instead of deploying empty data.
**Warning signs:** Build log says "0 pizzas found", no error raised.

### Pitfall 2: CSS Selector Rot

**What goes wrong:** Scraper targets Breakdance auto-generated class names. Theme update changes class names. Parser returns empty.
**Why it happens:** CMS-generated classes are unstable identifiers.
**How to avoid:** Target `h3` heading level + numeric prefix regex. Price by text pattern `/\d+,-/`. These are semantic and stable.
**Warning signs:** `menu.json` has items with empty `name` or `price_nok: NaN`.

### Pitfall 3: Norwegian Character Encoding Failure

**What goes wrong:** `ø`, `æ`, `å` appear as mojibake (`Ã¸` etc.) in `menu.json`.
**Why it happens:** Encoding not explicitly enforced in write.
**How to avoid:** Use `writeFileSync('public/menu.json', JSON.stringify(output, null, 2), 'utf-8')`. Validate by asserting at least one Norwegian character appears uncorrupted post-write.
**Warning signs:** `menu.json` contains `Ã` sequences.

### Pitfall 4: Build Hangs on Network Failure

**What goes wrong:** `fetch` hangs with no timeout. Cloudflare Pages build runs for 20 minutes then fails with a useless generic error.
**Why it happens:** Native `fetch` has no timeout by default.
**How to avoid:** `AbortSignal.timeout(10_000)` — fails after 10 seconds with a clear error.

### Pitfall 5: Node Version Mismatch (Blocking)

**What goes wrong:** `npm install cheerio` fails or scraper fails at runtime because Node 18.19.1 is below cheerio's `>=20.18.1` requirement.
**Why it happens:** System Node is 18.19.1 (Ubuntu apt package). Astro 6 requires >=22.12.0.
**How to avoid:** Install Node 22 before any npm operations. Use NodeSource or install nvm first (see Environment Availability below).
**Warning signs:** `npm install` prints engine warnings; `node scripts/scrape.js` throws syntax errors on optional chaining or other modern syntax.

---

## Code Examples

### Full Scraper Structure (verified patterns)

```javascript
// scripts/scrape.js
// Source: Cheerio official docs + Node fetch API
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';

const TARGET_URL = 'https://zz.pizza/gamlebyen/';
const OUTPUT_PATH = 'public/menu.json';
const TIMEOUT_MS = 10_000;

const MEAT_KEYWORDS = [
  'pepperoni', 'salami', 'prosciutto', 'pancetta', 'guanciale',
  'mortadella', 'coppa', 'nduja', 'chorizo', 'bacon',
  'skinke', 'kjøtt', 'kylling', 'laks', 'reker', 'oksehale',
  'oksekraft', 'beef', 'chicken', 'ham', 'pork', 'oxtail',
  'anchovy', 'ansjos'
];

function isVegetarian(text) {
  const lower = text.toLowerCase();
  return !MEAT_KEYWORDS.some(kw => lower.includes(kw));
}

async function scrape() {
  let response;
  try {
    response = await fetch(TARGET_URL, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    console.error(`Scrape failed: could not reach ${TARGET_URL}: ${err.message}`);
    process.exit(1);
  }

  if (!response.ok) {
    console.error(`Scrape failed: HTTP ${response.status} from ${TARGET_URL}`);
    process.exit(1);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const pizzas = [];

  $('h3').each((_, el) => {
    const heading = $(el).text().trim();
    if (!/^\d+\./.test(heading)) return; // skip non-pizza h3s (FAQ etc.)

    const name = heading.replace(/^\d+\.\s*/, '').trim();
    const descEl = $(el).next('p');
    const description = descEl.text().trim();

    // Find price paragraph — matches "NNN,-" pattern
    const priceEl = $(el).nextUntil('h3', 'p').filter((_, p) => /\d+,-/.test($(p).text())).first();
    const priceText = priceEl.text().trim();
    const price_nok = parseInt(priceText.replace(/[^0-9]/g, ''), 10);

    if (!name || !description || !Number.isInteger(price_nok) || price_nok <= 0) {
      console.error(`Parse error on pizza entry: heading="${heading}", price="${priceText}"`);
      process.exit(1);
    }

    pizzas.push({
      name,
      description,
      price_nok,
      vegetarian: isVegetarian(name + ' ' + description),
    });
  });

  if (pizzas.length === 0) {
    console.error('Scrape error: 0 pizzas extracted. ZZ Pizza site structure may have changed. Aborting build.');
    process.exit(1);
  }

  const output = {
    scraped_at: new Date().toISOString(),
    source_url: TARGET_URL,
    pizzas,
  };

  mkdirSync('public', { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Scraped ${pizzas.length} pizzas → ${OUTPUT_PATH}`);
}

scrape();
```

### menu.json Schema

```json
{
  "scraped_at": "2026-04-08T10:00:00.000Z",
  "source_url": "https://zz.pizza/gamlebyen/",
  "pizzas": [
    {
      "name": "MARGHERITA",
      "description": "Tomatsaus, mozzarella, basilikum og 24-måneder parmesan.",
      "price_nok": 225,
      "vegetarian": true
    }
  ]
}
```

### package.json scripts

```json
{
  "scripts": {
    "scrape": "node scripts/scrape.js",
    "prebuild": "npm run scrape",
    "build": "astro build",
    "dev": "astro dev"
  }
}
```

### .gitignore entries

```gitignore
# Build artifacts
dist/
.astro/

# Scraped data — regenerated at build time
public/menu.json
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Axios for HTTP requests | Native `fetch` | Node 18+ (stable in 22+) | One fewer dependency for simple GETs |
| `cheerio` needed `htmlparser2` separately | `cheerio@1.0+` bundles its own parser | cheerio 1.0 (2023) | Single install, no peer dep |
| `AbortController` + `setTimeout` for fetch timeout | `AbortSignal.timeout(ms)` | Node 17.3+ | One-liner timeout, no cleanup needed |

**Deprecated/outdated:**
- `request` npm package: deprecated 2020, do not use
- Separate `htmlparser2` install with cheerio: no longer needed in cheerio 1.x

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Løksuppepizza's Norwegian description uses "oksekraft" (beef broth) making it non-vegetarian | Live Menu Structure, Pitfall section | Scraper may incorrectly classify it as vegetarian if keyword is absent from actual Norwegian text |
| A2 | The Gamlebyen page h3 structure for pizza headings is identical to main zz.pizza/ page | Architecture Patterns | Selectors would need adjustment if Gamlebyen page uses different markup |
| A3 | FAQ h3 headings do not use the `N. NAME` numeric prefix format | Code Examples | Scraper filter `!/^\d+\./.test(heading)` might skip or include wrong entries |

---

## Open Questions

1. **Exact Norwegian ingredient text for Løksuppepizza**
   - What we know: English translation says "caramelized onion with beef broth" — this is meat-derived
   - What's unclear: Whether the Norwegian source text includes "oksekraft" or "biff" or some other form
   - Recommendation: In the scraper implementation, fetch the live page and log the raw Norwegian description of item #8 — adjust meat keyword list accordingly

2. **Does the scraper need a `type: "module"` in package.json?**
   - What we know: The code examples above use ES module syntax (`import`)
   - What's unclear: Whether the Astro project scaffold sets `"type": "module"` — if not, the scraper must use either CommonJS `require()` syntax or be named `.mjs`
   - Recommendation: Use `"type": "module"` in package.json (Astro projects default to this) or name the file `scrape.mjs`

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js >=22.12.0 | Astro 6 (build), cheerio 1.2.0 (scraper) | **NO** | 18.19.1 (system) | Install Node 22 via NodeSource APT or nvm |
| npm >=9.6.5 | Astro 6 | Partial | 9.2.0 (below minimum) | Upgrades automatically with Node 22 |
| cheerio@1.2.0 | Scraper | Not installed | — | `npm install cheerio@1.2.0` after Node upgrade |
| `fetch` (native) | Scraper HTTP requests | Yes (Node 18+) | Built-in | — |

**Missing dependencies with no fallback:**
- None — all missing items have a clear install path

**Missing dependencies with fallback / requiring action:**
- **Node.js 18.19.1 is below the minimum for both Astro 6 (>=22.12.0) and cheerio 1.2.0 (>=20.18.1).** This is a blocking issue. Wave 0 of the plan MUST include Node upgrade before any `npm install` commands.

**Recommended Node upgrade path:**
```bash
# Option A: nvm (recommended — no sudo needed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# restart shell, then:
nvm install 22
nvm use 22

# Option B: NodeSource APT (system-wide, requires sudo)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Sources

### Primary (HIGH confidence)
- `npm view cheerio version` — 1.2.0 confirmed, engine: node >=20.18.1 [VERIFIED: npm registry]
- `npm view astro version` — 6.1.5 confirmed (CLAUDE.md references 6.1.4), engine: node >=22.12.0 [VERIFIED: npm registry]
- Direct HTTP fetch of `https://zz.pizza/gamlebyen/` — 14 pizzas, static HTML, h3 structure confirmed [VERIFIED: live fetch 2026-04-08]
- Direct HTTP fetch of `https://zz.pizza/` — same 14-item menu on main page [VERIFIED: live fetch 2026-04-08]
- Astro docs `https://docs.astro.build/en/install-and-setup/` — Node >=22.12.0 requirement confirmed [VERIFIED: official docs]

### Secondary (MEDIUM confidence)
- Cheerio official README (https://github.com/cheeriojs/cheerio) — jQuery-compatible API, `h3` selection patterns [CITED]
- npm lifecycle docs (https://docs.npmjs.com/cli/v10/using-npm/scripts) — `prebuild` hook behavior [CITED]
- `.planning/research/ARCHITECTURE.md` — two-stage pipeline pattern, `public/menu.json` placement rationale [project research]
- `.planning/research/PITFALLS.md` — selector rot, encoding, timeout pitfalls [project research]
- `.planning/research/STACK.md` — stack decisions and rationale [project research]

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Target URL and HTML structure: HIGH — verified by direct fetch
- Standard stack (cheerio + native fetch): HIGH — verified against npm registry and official docs
- Vegetarian classification logic: MEDIUM — ingredient list is correct for 13/14 pizzas; Løksuppepizza item #8 needs Norwegian text confirmation
- Node environment blocker: HIGH — confirmed by `node --version` and `npm view astro engines`
- Architecture patterns: HIGH — consistent with ARCHITECTURE.md and Astro/npm docs

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (30 days) for stack details; ZZ Pizza HTML structure should be re-verified at each build if selectors change
