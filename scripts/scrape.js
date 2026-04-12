// scripts/scrape.js
// Phase 1 — ZZ Pizza menu scraper
// Fetches the Gamlebyen menu page, parses pizzas with Cheerio,
// validates the result, and writes public/menu.json.
//
// Requirements: DATA-01, DATA-02, DATA-03
// Decisions: D-01 (veg via labels — none exist, fall through to D-02),
//            D-02 (veg inferred by meat keyword scan),
//            D-03, D-04 (target: https://zz.pizza/gamlebyen/),
//            D-06 (output: public/menu.json),
//            D-07 (fail on 0 items).

import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'node:fs';

const TARGET_URL = 'https://zz.pizza/gamlebyen/';
const OUTPUT_PATH = 'public/menu.json';
const TIMEOUT_MS = 10_000;

// Meat keywords for vegetarian inference (D-02).
// Mix of Norwegian and English to cover translated ingredient text.
const MEAT_KEYWORDS = [
  'pepperoni', 'salami', 'prosciutto', 'pancetta', 'guanciale',
  'mortadella', 'coppa', 'nduja', 'chorizo', 'bacon',
  'skinke', 'kjøtt', 'kylling', 'laks', 'reker', 'oksehale',
  'oksekraft', 'beef', 'chicken', 'ham', 'pork', 'oxtail',
  'anchovy', 'ansjos', 'tunfisk', 'tuna',
];

function isVegetarian(text) {
  const lower = text.toLowerCase();
  return !MEAT_KEYWORDS.some((kw) => lower.includes(kw));
}

async function scrape() {
  let response;
  try {
    response = await fetch(TARGET_URL, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    console.error(
      `Scrape failed: could not reach ${TARGET_URL} within ${TIMEOUT_MS}ms: ${err.message}`,
    );
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
    // Pizza headings have the form "N. NAME". Skip FAQ / other h3s.
    if (!/^\d+\./.test(heading)) return;

    const name = heading.replace(/^\d+\.\s*/, '').trim();

    // First sibling <div> after the heading is the description.
    // The live HTML uses Breakdance <div class="bde-text-*"> wrappers, not <p> tags.
    const description = $(el).next('div').text().trim();

    // Price is in a sibling <div> of the h3's parent div that matches "NNN,-".
    // Structure: h3 > (parent inner div) > (outer div) > price div sibling
    // Strategy: search $(el).parent().parent() children for a div containing NNN,-
    const priceEl = $(el)
      .parent()
      .parent()
      .find('div')
      .filter((_, p) => /^\s*\d+,-\s*$/.test($(p).text()))
      .first();
    const priceText = priceEl.text().trim();
    const price_nok = parseInt(priceText.replace(/[^0-9]/g, ''), 10);

    if (
      !name ||
      !description ||
      !Number.isInteger(price_nok) ||
      price_nok <= 0
    ) {
      console.error(
        `Parse error on pizza entry: heading="${heading}", description="${description}", price="${priceText}"`,
      );
      process.exit(1);
    }

    pizzas.push({
      name,
      description,
      price_nok,
      vegetarian: isVegetarian(name + ' ' + description),
    });
  });

  // DATA-03: fail loud on zero items.
  if (pizzas.length === 0) {
    console.error(
      'Scrape error: 0 pizzas extracted from ' +
        TARGET_URL +
        '. ZZ Pizza site structure may have changed. Aborting build.',
    );
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
