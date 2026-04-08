# Domain Pitfalls

**Domain:** Static web app — build-time menu scraper + randomizer UI
**Project:** ZZ Pizza Picker
**Researched:** 2026-04-08

---

## Critical Pitfalls

Mistakes that cause rewrites, silent failures, or a broken deployed app.

---

### Pitfall 1: Scraping a JavaScript-Rendered Menu That Cheerio Cannot See

**What goes wrong:** The scraper is built with Axios + Cheerio (HTTP-only, no JS execution). The target site later lazy-loads menu content via JavaScript after the initial HTML response. Cheerio receives the shell HTML but the pizza list is absent. The build succeeds, `menu.json` is written with zero entries, and the deployed app silently presents no pizzas to pick.

**Why it happens:** ZZ Pizza's Gamlebyen page currently serves menu content as static HTML inside a WordPress + Breakdance setup (verified 2026-04-08). However, Breakdance is a JavaScript-heavy page builder; a CMS plugin update or layout refresh could shift menu items into a JS-rendered component without warning.

**Consequences:** Silent empty build. No runtime error. `menu.json` contains `[]`. The UI has no items to randomize. Users see a broken or empty state with no indication something went wrong.

**Prevention:**
- At scraper build time, assert `menu.json` has at least N items (N = expected minimum, e.g., 8). Fail the build loudly if below threshold.
- Structure the scraper to detect empty output and exit with a non-zero code so Cloudflare Pages marks the build as failed rather than deploying broken data.
- Keep Playwright available as a fallback dependency. If Cheerio returns zero items, re-run the extraction with Playwright headless before failing.

**Detection (warning signs):**
- `menu.json` item count drops to 0 or drops more than 50% from the last known count.
- Build logs show "0 pizzas found" with no error.
- Deployed site shows the spinner but no result on reveal.

**Phase:** Scraper build phase (Phase 1 / data pipeline).

---

### Pitfall 2: CSS Selector Rot — Selectors Break When WordPress Theme Updates

**What goes wrong:** The scraper targets specific CSS class names or DOM paths (e.g., `.bde-heading h3`, `.breakdance-menu-item .price`). The ZZ Pizza team updates their Breakdance theme or rebuilds the page, renaming or restructuring elements. Selectors silently return empty strings or wrong data. Prices appear as `undefined`, pizza names are blank, or the entire extraction returns nothing.

**Why it happens:** Auto-generated Breakdance/WordPress class names (e.g., `.css-a1b2c3`) are especially fragile — they change with every theme or plugin version. Even semantic selectors can drift after a site redesign.

**Consequences:** `menu.json` contains malformed entries. Randomizer shows unnamed pizzas, missing prices, or crashes filtering logic.

**Prevention:**
- Target the most semantic, stable markers: heading level (h3), price suffix text (",-"), allergen keyword ("Allergener:"). Text-pattern matching is more stable than class-name matching for this site's structure.
- Store a snapshot of the scraped raw HTML (e.g., `menu-snapshot.html`) during each build. On subsequent builds, diff the structure to detect DOM changes before they cause silent failures.
- Validate every scraped pizza object has required fields (`name` string, `price` number) before writing `menu.json`.

**Detection (warning signs):**
- Pizza objects in `menu.json` have empty or `null` name/price fields.
- Item count is plausible (non-zero) but data looks wrong.
- Price filter in the UI produces no results even at maximum range.

**Phase:** Scraper build phase; revisit at any milestone where site structure may have changed.

---

### Pitfall 3: Stale Menu Data With No User-Visible Staleness Signal

**What goes wrong:** The app is deployed once and never rebuilt. ZZ Pizza removes items, adds seasonal specials, or changes prices. The randomizer confidently presents outdated menu items (e.g., a discontinued pizza, wrong price). Users arrive at the restaurant, try to order the suggested pizza, and find it is not available.

**Why it happens:** Static sites do not auto-refresh. Cloudflare Pages only rebuilds on a git push unless a scheduled build hook is configured. The menu data timestamp is invisible to the end user.

**Consequences:** Eroded trust in the app's core value proposition ("one tap gives you a pizza you can actually order"). For a restaurant-specific tool, stale data is not a minor annoyance — it breaks the real-world use case.

**Prevention:**
- Embed `lastScraped` ISO timestamp in `menu.json` and surface it in the UI ("Menu last updated: 3 days ago").
- Configure a scheduled rebuild via Cloudflare Pages deploy hook + GitHub Actions cron (weekly is sufficient for a stable restaurant menu).
- Display a visible warning in the UI if `lastScraped` is older than 14 days.

**Detection (warning signs):**
- No build has run in the last week.
- `lastScraped` field in `menu.json` is older than 2 weeks.

**Phase:** Deployment / CI phase. Must be addressed before first production deploy, not deferred.

---

### Pitfall 4: Filter Combination Creates a Dead End With No Recovery Path

**What goes wrong:** User enables "Vegetarian only" and also drags the price range slider to a narrow band. Zero pizzas match. The app shows nothing — no result, no explanation, no way out. The user is confused and leaves.

**Why it happens:** Price range + category toggle are independent controls. Their intersection is not validated before the spin action is triggered. With a small menu (ZZ Pizza has roughly 14 items at time of research), even a modest price band combined with a veg filter can produce zero matches.

**Consequences:** The core UX promise ("one tap, one pizza") breaks. User effort is wasted. On mobile the empty state is especially disorienting.

**Prevention:**
- Show a live item count as filters change: "8 pizzas available". Counter updates in real time as filters move.
- Disable or visually dim the spin button when zero items match; replace with an inline message ("No pizzas match — try widening the price range").
- Set default price range to cover the full menu, not a narrow sub-range.
- On very small menus (< 3 matches), surface a soft nudge to relax filters rather than just showing empty.

**Detection (warning signs):**
- Spin button activated but reveals nothing / throws a divide-by-zero or array-out-of-bounds error.
- Any combination of legal filter values produces 0 results and the UI does not communicate this.

**Phase:** UI/filter phase. Address in initial UI design, not as a polish pass.

---

## Moderate Pitfalls

---

### Pitfall 5: Spin Animation Outcome Is Predetermined Before Animation Completes

**What goes wrong:** The random selection runs immediately on button press, then a CSS/JS spin animation plays for visual effect. If the animation references the result mid-spin (e.g., to slow down "correctly"), the user can inspect the DOM and see the result before the animation ends. On slow devices, the animation and reveal logic can fall out of sync, double-revealing, or showing a flash of the result before the animation begins.

**Why it happens:** Common pattern: `result = pick(); animate(); showResult(result)`. The result is in the DOM immediately.

**Prevention:**
- Keep the result out of the DOM until the animation completes. Use a callback or Promise that resolves on `animationend` before injecting the pizza name.
- Compute the random selection at animation-end time, not at button-press time. This is simpler and avoids sync issues entirely (no predetermined result to leak).

**Detection (warning signs):**
- Inspecting DOM during animation shows result text.
- `console.log` traces show pizza name before animation ends.

**Phase:** UI/animation phase.

---

### Pitfall 6: `Math.random()` Produces Perceptible Repetition on Small Menus

**What goes wrong:** `Math.random()` is a PRNG, not a true shuffle. On a 14-item menu, consecutive spins can return the same pizza multiple times in a row. For a "decide for us" use case, repeated results erode the impression of fairness.

**Why it happens:** `Math.random()` has no memory of prior calls. Runs of 2-3 identical results are statistically normal but feel broken to users.

**Prevention:**
- Maintain a local session history of recent picks and exclude the last 1-2 results from the candidate pool (soft de-duplication without full shuffle).
- This does not require cryptographic randomness; simple array tracking in component state is sufficient.
- Do not use `Math.round()` for index selection — use `Math.floor(Math.random() * array.length)` which gives uniform distribution.

**Detection (warning signs):**
- Manual testing: spin 10 times, observe if same pizza appears 3+ times consecutively.

**Phase:** UI/randomizer logic phase.

---

### Pitfall 7: Build Script Has No Timeout — Hangs Indefinitely on Network Issues

**What goes wrong:** The scraper hits ZZ Pizza's server; the request hangs waiting for a response (DNS timeout, slow server, flaky network). The Cloudflare Pages build runs for its maximum allowed time (20 minutes by default) doing nothing, then fails with a generic timeout error. No useful diagnostic is emitted.

**Why it happens:** Node.js `fetch` / Axios defaults have no timeout. Playwright page loads have a 30s default but it can be disabled.

**Prevention:**
- Set explicit request timeouts: Axios `timeout: 10000`, Playwright `page.goto(url, { timeout: 15000 })`.
- Wrap the scraper in a top-level try/catch that emits a descriptive error ("Scrape failed: ZZ Pizza unreachable after 10s") and exits with code 1.
- Keep total scraper execution time under 60 seconds for the entire build step.

**Detection (warning signs):**
- Build log shows no output for > 30 seconds during the scrape step.
- Build duration approaches the Cloudflare Pages timeout ceiling.

**Phase:** Scraper build phase.

---

### Pitfall 8: Encoding and Character Issues With Norwegian Menu Text

**What goes wrong:** Norwegian menu items contain characters like `ø`, `æ`, `å`. If the scraper does not correctly detect or force UTF-8 encoding, these characters appear as mojibake (`Ã¸`, `Ã¦`, `Ã¥`) in `menu.json`. The UI displays garbled pizza names.

**Why it happens:** Axios infers encoding from headers; if the server response omits or mis-states charset, Cheerio may default to latin1. Playwright mitigates this because it uses a real browser with full encoding support.

**Prevention:**
- With Axios + Cheerio: explicitly check `Content-Type` response header for `charset=utf-8`. Pass `responseEncoding: 'utf8'` in Axios options.
- Validate `menu.json` after writing: assert that common Norwegian characters appear uncorrupted in at least one entry.
- With Playwright: encoding is handled by the browser engine; this pitfall is mostly avoided.

**Detection (warning signs):**
- Pizza names in `menu.json` contain `Ã` sequences.
- UI displays replacement characters or strange symbols in Norwegian words.

**Phase:** Scraper build phase.

---

## Minor Pitfalls

---

### Pitfall 9: Price Data Scraped as String, Compared as String

**What goes wrong:** Prices are scraped as the string `"195,-"` and stored as `"195"` (string). The price range filter does string comparison rather than numeric comparison. String ordering (`"95" > "195"` evaluates false) produces wrong filter results.

**Prevention:**
- In the scraper, `parseInt(priceText.replace(/[^0-9]/g, ''), 10)` before writing to `menu.json`. Store prices as JSON numbers, not strings.
- Add a validation step: assert all price fields in `menu.json` are `typeof number` and > 0.

**Phase:** Scraper build phase.

---

### Pitfall 10: Mobile Touch Target Too Small for the Spin Button

**What goes wrong:** The spin button is styled with a small hit area on desktop and never validated on mobile. On iOS/Android the button is difficult to tap; users misfire and nothing happens. The core one-tap interaction fails its own stated goal.

**Prevention:**
- Minimum touch target: 44x44px (Apple HIG) / 48x48dp (Material). Make the spin button generously large — it is the primary and only critical interactive element.
- Test on actual mobile viewport during UI phase, not just desktop resize.

**Phase:** UI phase.

---

### Pitfall 11: `menu.json` Committed to Git Becomes the "Real" Source of Truth

**What goes wrong:** `menu.json` is committed to the repository for convenience during development. Over time, developers rely on the committed file and stop testing the scraper. The scraper bitrotts silently. When it matters, the scraper is broken and no one notices because the committed file masks the failure.

**Prevention:**
- Add `menu.json` to `.gitignore`. It is a build artifact, not source code.
- The build pipeline must always regenerate it from a live scrape (or fail loudly).
- Keep a `menu.json.example` fixture with fake data for offline development and testing.

**Phase:** Project setup / repository hygiene phase.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Scraper implementation | Selector rot from Breakdance class names | Target text patterns and semantic heading levels, not generated class names |
| Scraper implementation | Empty output deployed silently | Assert item count > N before build succeeds; exit 1 on empty |
| Scraper implementation | Norwegian character encoding failure | Explicit UTF-8 decode; validate post-scrape |
| Build pipeline / CI | Stale menu never updates | Schedule weekly rebuild via deploy hook; surface `lastScraped` in UI |
| Build pipeline / CI | `menu.json` committed, scraper never tested | `.gitignore` the artifact; always regenerate at build time |
| Filter UI | Dead-end empty state with no recovery | Live item counter; disable spin on zero matches with inline guidance |
| Randomizer logic | Perceptible PRNG repetition on small menu | Soft de-duplication: exclude last 1-2 picks from candidate pool |
| Animation / reveal | Result visible in DOM before animation ends | Inject result text only at `animationend` callback |
| Deployment | Build hangs indefinitely on network failure | Explicit scraper timeouts; fail fast with descriptive error |

---

## Sources

- [Web Scraping With Node.js in 2026: Axios + Cheerio, Playwright, Crawlee](https://dev.to/vhub_systems_ed5641f65d59/web-scraping-with-nodejs-in-2026-axios-cheerio-playwright-crawlee-4f4g)
- [Cheerio vs Puppeteer for Web Scraping in 2026 — Proxyway](https://proxyway.com/guides/cheerio-vs-puppeteer-for-web-scraping)
- [When the Scraper Breaks Itself: Self-Healing CSS Selector Repair — DEV Community](https://dev.to/viniciuspuerto/when-the-scraper-breaks-itself-building-a-self-healing-css-selector-repair-system-312d)
- [Deploy Hooks — Cloudflare Pages docs](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)
- [Scheduling Cloudflare Pages builds with cron triggers — Codemzy's Blog](https://www.codemzy.com/blog/scheduling-builds-cloudflare)
- [There's Math.random(), and then there's Math.random() — V8 Blog](https://v8.dev/blog/math-random)
- [Common Issues with JavaScript's Math.random and How to Fix Them — Machinet](https://www.machinet.net/tutorial-eng/common-issues-with-javascript-math-random-and-how-to-fix-them)
- [Designing "no results found" pages that can engage users — LogRocket](https://blog.logrocket.com/ux-design/no-results-found-page-ux/)
- [Filter UI Design: Best UX Practices and Real-Life Examples — Insaim](https://www.insaim.design/blog/filter-ui-design-best-ux-practices-and-examples)
- [Psychology Behind the Spin — Yu-kai Chou Octalysis](https://yukaichou.com/gamification-analysis/the-spinning-wheel-a-comprehensive-guide-to-boosting-user-engagement/)
- ZZ Pizza Gamlebyen page structure: verified via direct fetch 2026-04-08 — WordPress + Breakdance, static HTML menu, minimal anti-bot protection
