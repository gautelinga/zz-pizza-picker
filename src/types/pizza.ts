/**
 * Shape of a single pizza record, matching the output of the Phase 1 scraper
 * (see public/menu.json). The scraper contract is locked; this type must not
 * drift from it.
 */
export interface Pizza {
  name: string;
  description: string;
  price_nok: number;
  vegetarian: boolean;
}

/**
 * Full shape of menu.json as produced by scripts/scrape.js in Phase 1.
 */
export interface MenuData {
  scraped_at: string;
  source_url: string;
  pizzas: Pizza[];
}

/**
 * Active filter for the picker UI.
 * - 'all'  → show every pizza
 * - 'veg'  → show only vegetarian = true
 * - 'meat' → show only vegetarian = false
 *
 * Values align with the filter pill labels in 02-UI-SPEC.md: All / Veg / Meat.
 */
export type Filter = 'all' | 'veg' | 'meat';
