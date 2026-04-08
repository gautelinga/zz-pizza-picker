# Feature Landscape

**Domain:** Randomizer / decision-helper web app (menu-constrained)
**Project:** ZZ Pizza Picker
**Researched:** 2026-04-08
**Confidence:** HIGH for table stakes (well-established patterns across multiple apps); MEDIUM for differentiators (varies by audience)

---

## Table Stakes

Features users expect in any randomizer/decision-helper. Missing one makes the app feel broken or unfinished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Single-tap spin trigger | The entire value prop is one tap — anything more is friction | Low | Button must be large, thumb-reachable on mobile |
| Animated reveal | Static result with no transition feels low-effort; animation signals "something is happening" and adds perceived fairness | Low-Med | Can be CSS spin/flip/slot; does NOT need to be a full wheel |
| Clear result display | Pizza name, price, and a short description must be legible immediately after reveal | Low | No hunting for the answer |
| Re-spin ("pick again") | Users need an escape hatch — not to cheat randomness, but for legitimacy ("I'll accept whatever it picks next") | Low | Single button; no confirmation needed |
| Vegetarian / meat toggle | Core stated requirement; filters out a whole dietary category | Low | Binary toggle, not multi-select |
| Price range filter | Core stated requirement; $$ vs $$$ is a real constraint for groups | Low-Med | Slider or predefined tiers (budget / any / splurge) |
| Mobile-responsive layout | Target users are on phones; desktop is secondary | Low | Standard responsive CSS; test on 375px viewport |
| Current menu data | If the app shows a pizza that doesn't exist, trust collapses | Med | Requires scraping strategy + freshness plan |

---

## Differentiators

Features that are not expected but create delight or competitive advantage. None are required for MVP. Each has a clear "when to add" trigger.

| Feature | Value Proposition | Complexity | When to Add | Notes |
|---------|-------------------|------------|-------------|-------|
| Result share / copy | Group use case — "we eat what it picks" needs a shareable outcome so everyone sees the same pick | Low | After core works | Share as URL or plain text; not a full social share sheet |
| Exclude last result | Prevents the same pizza appearing twice in a row; removes psychological doubt about randomness | Low | First user complaint about repeats | Keep a small session-scoped exclusion list |
| Result history (session) | Groups sometimes want to see the last 3 picks before committing | Low | If group use increases | Session storage only, no persistence |
| Suspense / reveal mode | Hide pizza name until a tap — adds group drama for "we eat what it picks" mode | Low | If group use is the dominant pattern | Simple toggle: auto-reveal vs tap-to-reveal |
| Pizza detail card | Photo, full ingredient list, allergen notes on the result — reduces "what even is that?" friction | Med | After menu scraping is stable | Depends on what ZZ Pizza's site exposes |
| Persistent filter memory | Remembers veg/price preference across sessions via localStorage | Low | Second-visit retention becomes a concern | Zero backend required |

---

## Anti-Features

Features to deliberately NOT build. Each is a scope trap that adds complexity without proportional value for this app.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User accounts / login | Stated out of scope; adds auth complexity, GDPR surface, and session management for zero user benefit at this scale | localStorage for any persistence needs |
| Full topping / ingredient filtering | Stated out of scope; ZZ Pizza has a small menu — veg/meat covers the meaningful split | Keep veg toggle |
| Location detection | This app is always ZZ Pizza Oslo; location is already known | Hardcode the restaurant context |
| Ordering / cart integration | Scope explosion; ZZ Pizza may not have an API; creates a support surface | Show result only; let users order themselves |
| Weighted randomness / "boost a pizza" | Defeats the point — the app's value is committed randomness | Pure uniform random |
| Saved custom wheels / add-your-own | The menu is fixed; this is not a general-purpose randomizer | Static dataset from scrape |
| AI recommendations ("you might also like") | Overengineering for a "just pick one" use case | Random is the feature |
| Ratings / reviews | Adds a social layer the project doesn't need; ZZ Pizza has Google reviews | Link to Google Maps if needed |
| Offline / PWA / install prompt | Adds service worker complexity; "browser-based" is sufficient | Responsive web page |
| Dark mode toggle | Not a core UX concern at this stage | Use system `prefers-color-scheme` passively if desired |

---

## Feature Dependencies

```
Menu data (scrape) → All features (nothing works without a pizza list)

Vegetarian flag per pizza → Veg/meat toggle filter
Price per pizza         → Price range filter
Pizza name + description → Result display
Photo URL               → Pizza detail card (differentiator)
Ingredient list         → Pizza detail card (differentiator)

Result display → Re-spin
Result display → Share result (differentiator)
Result display → Exclude last result (differentiator)
Result display → Suspense/reveal mode (differentiator)

Price range filter → depends on price range being a discrete field, not a fuzzy label
```

---

## MVP Recommendation

Build exactly these, in order:

1. **Menu data pipeline** — scrape ZZ Pizza, produce a clean JSON list with name, price, and veg flag. Everything else is blocked on this.
2. **Single result display** — show one random pizza from the full list. Name + price + veg indicator.
3. **Animated reveal** — spin/flip/slot animation before result appears. Low effort, high perceived quality.
4. **Re-spin button** — one tap, no friction.
5. **Veg/meat toggle** — filters the pool before picking.
6. **Price range filter** — filters the pool before picking.

Defer everything in the Differentiators table until core is live and tested on real mobile hardware. The share feature is the most likely first addition given the group use case.

---

## Sources

- [ChooseMy.Food — feature inventory from live app](https://choosemy.food/) — HIGH confidence (direct observation)
- [SpinTheWheel.app — feature set of general randomizer](https://spinthewheel.app/) — HIGH confidence (direct observation)
- [PickerWheel.com — result reveal, re-spin, exclude patterns](https://pickerwheel.com/) — MEDIUM confidence (search-observed)
- [Spin The Wheel Random Picker (Google Play)](https://play.google.com/store/apps/details?id=com.dreamclippers.randomizerpro&hl=en_US) — MEDIUM confidence (app store listing)
- [Random Food Picker (Firebase app)](https://food-roulette-3dd83.firebaseapp.com/) — MEDIUM confidence (search-observed)
- [JustDecide — random decision maker](https://justdecideapp.com/) — MEDIUM confidence (search-observed)
- UX pattern synthesis from WebSearch across multiple sources — MEDIUM confidence
