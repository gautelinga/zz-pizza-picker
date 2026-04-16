# Requirements: ZZ Pizza Picker

**Defined:** 2026-04-08
**Core Value:** One tap gives you a pizza — no deliberation, no regret, just a result.

## v1 Requirements

### Data Pipeline

- [x] **DATA-01**: Build-time scraper fetches ZZ Pizza's menu from their website and writes structured JSON
- [x] **DATA-02**: Scraped data includes pizza name, description, price (as integer NOK), and vegetarian flag
- [x] **DATA-03**: Build fails with an error if scraper returns 0 items (no silent failure)
- [x] **DATA-04**: menu.json is committed to .gitignore (not tracked in git)

### Core Interaction

- [ ] **CORE-01**: User can trigger a random pizza reveal with a single tap/click
- [ ] **CORE-02**: User can re-spin to get a different random pizza without reloading
- [ ] **CORE-03**: User sees pizza name, description, and price on the result card

### Filters

- [ ] **FILT-01**: User can toggle between all pizzas, vegetarian only, or meat only
- [ ] **FILT-02**: User sees a live count of eligible pizzas before spinning
- [ ] **FILT-03**: Spin button is disabled (with explanation) when no pizzas match the active filter

### Deployment

- [ ] **DEPL-01**: App is deployed and publicly accessible on Cloudflare Pages
- [ ] **DEPL-02**: Menu is automatically rebuilt weekly via GitHub Actions + Cloudflare deploy hook
- [ ] **DEPL-03**: UI shows when the menu was last scraped (e.g. "Menu last updated: 7 Apr 2026")

## v2 Requirements

### Core Interaction

- **CORE-04**: User can share the result via a link or clipboard copy
- **CORE-05**: Soft de-duplication so the same pizza isn't picked twice in a row

### Filters

- **FILT-04**: User can filter by price range

### Data Pipeline

- **DATA-05**: Admin can trigger a manual menu rebuild without a code deploy

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Browser is sufficient; no install friction needed |
| Full ingredient/topping filtering | Small menu (~14 items) makes this overkill |
| User accounts / saved preferences | Adds complexity with no clear value for this use case |
| Ordering integration | Just picks; doesn't place orders |
| Weighted randomness / boosting | Contradicts the core value of committed randomness |
| Multiple restaurant locations | Single ZZ Pizza menu is the scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 1 | Complete |
| CORE-01 | Phase 2 | Pending |
| CORE-02 | Phase 2 | Pending |
| CORE-03 | Phase 2 | Pending |
| FILT-01 | Phase 2 | Pending |
| FILT-02 | Phase 2 | Pending |
| FILT-03 | Phase 2 | Pending |
| DEPL-01 | Phase 3 | Pending |
| DEPL-02 | Phase 3 | Pending |
| DEPL-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after initial definition*
