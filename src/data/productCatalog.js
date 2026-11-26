/**
 * SYORA — product naming & SEO overrides
 *
 * The store's product titles/handles (e.g. "SYORA Flat 5" / syora-flat-5) are internal. This file maps each
 * Shopify HANDLE to the public name, a clean URL slug and optional search text. Nothing else in the app
 * needs to change when you add a line: names, URLs, page titles and share previews all pick it up.
 *
 *   handle:      the product's handle in Shopify (what you see in the Shopify admin URL)
 *   name:        the customer-facing name (no "SYORA" prefix — the brand is already everywhere)
 *   slug:        the URL: /product/<slug>   (lowercase, words joined by hyphens)
 *   description: optional ~150-char search-result text (falls back to the Shopify description)
 *
 * The long-term fix is to rename the product + its URL handle inside Shopify too (tick "Redirect old URL").
 * Until then this file keeps the website itself clean. Old /product/<handle> links redirect to the new slug.
 */
export const PRODUCT_CATALOG = {
  // Keys must be the product's CURRENT Shopify handle. Entries whose handle no longer exists in the store
  // (black-pump, glitter-flat, kitten-heels, zebra-flats) were removed: they pointed at products that were
  // renamed/removed in Shopify, and 'black-pumps' made /product/colette-black-bow-pumps resolve to a dead handle.
  'colette-black-bow-pumps': {
    name: 'Colette Black Patent Bow Pumps',
    slug: 'colette-black-bow-pumps',
    description: 'Colette bow pumps in black with a glossy patent finish and soft cushioned insole, made for all-day comfort. By SYORA.',
  },
  // Add the rest here, e.g.
  // 'syora-flat-5': { name: '…', slug: '…', description: '…' },
};

const bySlug = Object.fromEntries(Object.entries(PRODUCT_CATALOG).map(([handle, v]) => [v.slug, handle]));

/** The public URL path for a product (its clean slug when it has one, otherwise its handle). */
export const productPath = (handle) => `/product/${encodeURIComponent(PRODUCT_CATALOG[handle]?.slug || handle)}`;

/** Accepts a slug OR a handle from the URL and returns the real Shopify handle. */
export const resolveHandle = (param) => bySlug[param] || param;

/** The slug a handle should be served under (or null when it has no clean slug). */
export const slugFor = (handle) => PRODUCT_CATALOG[handle]?.slug || null;

/** Public display name for a product: the override, else the Shopify title. */
export const displayName = (handle, shopifyTitle) => PRODUCT_CATALOG[handle]?.name || shopifyTitle;
