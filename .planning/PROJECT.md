# ZZ Pizza Picker

## What This Is

A web app that randomly selects a pizza from ZZ Pizza's menu in Oslo. You open it, hit spin, and it tells you what you're eating tonight. Works for solo indecision and group "we'll eat whatever it picks" situations.

## Core Value

One tap gives you a pizza — no deliberation, no regret, just a result.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Scrape ZZ Pizza's menu from their website
- [ ] Display a random pizza on demand (spin & reveal)
- [ ] Basic filters: vegetarian/meat toggle, price range
- [ ] Works in any web browser, mobile-friendly

### Out of Scope

- Native mobile app — browser is sufficient for the use case
- Full ingredient/topping filtering — basic filters cover the need
- User accounts / saved preferences — adds complexity without clear value
- Ordering integration — just picks, doesn't place orders

## Context

- Target restaurant: ZZ Pizza, Oslo
- Menu source: scraped from ZZ Pizza's website (needs URL and scraping strategy)
- Two main use cases: solo "I can't decide" and group "we eat what it picks"
- Simple, fast, fun — not a complex product

## Constraints

- **Data**: Menu must be scraped from ZZ Pizza's site — no official API
- **Simplicity**: The core interaction is a single tap; don't complicate it

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web browser over native app | Lower friction, no install required | — Pending |
| Scrape menu vs hardcode | Stays current if menu changes | — Pending |
| Spin & reveal vs shortlist | Commits to the randomness, simpler UX | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-08 after initialization*
