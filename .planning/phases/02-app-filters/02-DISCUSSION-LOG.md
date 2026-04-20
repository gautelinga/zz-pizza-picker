# Phase 2: App & Filters - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 02-app-filters
**Areas discussed:** Spin animation, Result card, Filter controls, Page layout

---

## Spin Animation

| Option | Description | Selected |
|--------|-------------|----------|
| Slot machine | Names cycle rapidly then slow and land on the chosen pizza | |
| Pizza spin | A pizza or emoji spins (rotation animation) while suspense builds, then result reveals | ✓ |
| Card reveal | Card flips or fades in with the result — clean, minimal, no cycling | |
| You decide | Leave the animation style to the planner/executor | |

**User's choice:** Pizza spin

| Option | Description | Selected |
|--------|-------------|----------|
| Short (~0.8s) | Quick pop of suspense — snappy and responsive | |
| Medium (~1.5s) | Satisfying buildup without making users wait | ✓ |
| Long (~2.5s) | Drawn-out drama — fun once, potentially tedious on re-spin | |

**User's choice:** Medium (~1.5s)

| Option | Description | Selected |
|--------|-------------|----------|
| Mystery during spin | Show a "?" or pulsing placeholder while spinning — result hidden until animation completes | |
| Pizza spinning | Show a pizza emoji (🍕) or icon rotating — the spin IS the reveal motion | ✓ |
| You decide | Leave this detail to the planner | |

**User's choice:** Pizza spinning

---

## Result Card

| Option | Description | Selected |
|--------|-------------|----------|
| Pizza name big | Large name dominates, description below in smaller text, price as a badge or footnote | ✓ |
| Balanced layout | Name, description, and price given roughly equal visual weight in a structured card | |
| Price prominent | Price is highlighted — useful if cost is a key factor | |

**User's choice:** Pizza name big

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — show a badge | Small tag like "🌱 Vegetarian" or "🥩 Meat" on the card | ✓ |
| No — skip it | Name, description, price is enough | |
| You decide | Leave to planner | |

**User's choice:** Yes — show a veg/meat badge

| Option | Description | Selected |
|--------|-------------|----------|
| Below the spin button | Button at top, result appears below after spin | ✓ |
| Replaces the spin button area | Result fills the central hero area, re-spin button appears on or below the card | |
| Above the spin button | Result sits in a fixed upper zone, spin button always visible at the bottom | |

**User's choice:** Below the spin button

---

## Filter Controls

| Option | Description | Selected |
|--------|-------------|----------|
| Pill toggles | Three rounded pill/chip buttons in a row, active one highlighted | ✓ |
| Segmented control | Single bar split into 3 segments, like iOS control | |
| Icon + label buttons | Each option has an emoji plus a label | |

**User's choice:** Pill toggles

| Option | Description | Selected |
|--------|-------------|----------|
| Above the spin button | Filters first, then spin — set your preference before committing | ✓ |
| Below the spin button | Spin button is the first thing you see, filters are secondary controls below | |
| Below the result card | Filters appear after first spin | |

**User's choice:** Above the spin button

| Option | Description | Selected |
|--------|-------------|----------|
| Near the filter pills | Small text like "6 pizzas" shown next to or below the filter row | |
| Near the spin button | Count appears above or below the spin button | |
| You decide | Leave placement to the planner | ✓ |

**User's choice:** You decide (Claude's discretion)

---

## Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Centered hero, fills viewport | Content vertically centered in the screen, app-like | ✓ |
| Top-aligned, scrollable | Standard web page with max-width container, content starts at the top | |
| Fullscreen immersive | 100vh with no visible browser chrome gaps, dark/bold background | |

**User's choice:** Centered hero, fills viewport

| Option | Description | Selected |
|--------|-------------|----------|
| Warm and food-inspired | Warm reds, oranges, creams — pizza colors, appetizing feel | |
| Clean and minimal | White/off-white background, neutral tones, pops of color only on active elements | ✓ |
| Bold and playful | High contrast, bright accent color, fun typography | |
| You decide | Leave color palette to the planner/executor | |

**User's choice:** Clean and minimal

| Option | Description | Selected |
|--------|-------------|----------|
| Narrow column (~400px) | Looks like a phone on desktop — single-purpose tool feel | ✓ |
| Medium column (~600px) | Comfortable reading width, more breathing room | |
| Full width | Stretches to fill the window on desktop | |

**User's choice:** Narrow column (~400px)

---

## Claude's Discretion

- Pizza count (FILT-02) placement — near filters or spin button, whichever reads most clearly
- Specific Tailwind color tokens for the clean/minimal palette
- Typography choices
- Exact disabled-button state styling for FILT-03
- Svelte component structure

## Deferred Ideas

- Share result via link (CORE-04, v2)
- Soft de-duplication (CORE-05, v2)
- Price range filter (FILT-04, v2)
- "Menu last updated" display (DEPL-03, Phase 3)
- Allergen data and pizza images (Phase 1 deferred item)
