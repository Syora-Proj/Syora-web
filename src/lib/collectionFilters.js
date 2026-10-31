/**
 * SYORA — collection filtering & sorting
 *
 * Pure helpers for the collection (PLP) experience. They work on the normalised
 * product-card shape produced by `normaliseProductCard`, so filters are always
 * derived from the live Shopify data and never hardcoded.
 *
 * Semantics: values inside one facet are OR-ed (Size 5 OR 6), facets are AND-ed
 * (Category AND Size AND Price …).
 */

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
];

export const EMPTY_FILTERS = Object.freeze({
  category: [],
  size: [],
  colour: [],
  price: [],
  inStockOnly: false,
});

const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function sizeSort(a, b) {
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b));
}

/** Up to four price bands, rounded to a tidy step, derived from the actual range. */
export function buildPriceBands(products) {
  const prices = products.map((p) => p.priceRaw).filter((n) => Number.isFinite(n) && n > 0);
  if (prices.length < 2) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max - min < 300) return [];

  const step = max > 8000 ? 1000 : max > 3000 ? 500 : 250;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil((max + 1) / step) * step;
  const bandCount = Math.min(4, Math.max(2, Math.round((hi - lo) / step)));
  const width = Math.ceil((hi - lo) / bandCount / step) * step;

  const bands = [];
  for (let i = 0; i < bandCount; i += 1) {
    const from = lo + i * width;
    const to = i === bandCount - 1 ? Infinity : lo + (i + 1) * width;
    if (from > max) break;
    const label =
      i === 0 ? `Under ${inr(to)}` : to === Infinity ? `${inr(from)} & above` : `${inr(from)} – ${inr(to)}`;
    bands.push({ id: `${from}-${to === Infinity ? 'up' : to}`, from, to, label });
  }
  // Drop bands that contain no product, so a filter can never lead to an empty result.
  return bands.filter((b) => products.some((p) => p.priceRaw >= b.from && p.priceRaw < b.to));
}

/** Facet option lists for the filter drawer. Facets with nothing to choose from are omitted. */
export function buildFacets(products) {
  const uniq = (list) => [...new Set(list.filter(Boolean))];
  const categories = uniq(products.map((p) => p.category)).sort((a, b) => a.localeCompare(b));
  const sizes = uniq(products.flatMap((p) => p.sizesAvailable || [])).sort(sizeSort);
  const colours = uniq(products.flatMap((p) => p.colours || [])).sort((a, b) => a.localeCompare(b));
  const priceBands = buildPriceBands(products);
  const hasSoldOut = products.some((p) => p.availableForSale === false);

  return {
    category: categories.length > 1 ? categories : [],
    size: sizes,
    colour: colours.length > 1 ? colours : [],
    price: priceBands,
    availability: hasSoldOut,
  };
}

export function countActiveFilters(filters) {
  return (
    filters.category.length +
    filters.size.length +
    filters.colour.length +
    filters.price.length +
    (filters.inStockOnly ? 1 : 0)
  );
}

export function applyFilters(products, filters, priceBands = []) {
  const bands = priceBands.filter((b) => filters.price.includes(b.id));
  return products.filter((p) => {
    if (filters.inStockOnly && p.availableForSale === false) return false;
    if (filters.category.length && !filters.category.includes(p.category)) return false;
    if (filters.size.length && !(p.sizesAvailable || []).some((s) => filters.size.includes(s))) return false;
    if (filters.colour.length && !(p.colours || []).some((c) => filters.colour.includes(c))) return false;
    if (bands.length && !bands.some((b) => p.priceRaw >= b.from && p.priceRaw < b.to)) return false;
    return true;
  });
}

export function sortProducts(products, sortId) {
  if (sortId === 'featured') return products; // Shopify's collection (best-selling) order
  const list = [...products];
  if (sortId === 'price-asc') list.sort((a, b) => a.priceRaw - b.priceRaw);
  else if (sortId === 'price-desc') list.sort((a, b) => b.priceRaw - a.priceRaw);
  else if (sortId === 'newest') {
    list.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
  }
  return list;
}

/**
 * Badges only help when they single a product out. If one label is on a large share
 * of the grid (everything "Bestseller"), it stops communicating anything, so it is
 * suppressed. Returns the set of badge labels that are still meaningful.
 */
export function meaningfulBadges(products) {
  const total = products.length;
  if (total === 0) return new Set();
  const counts = {};
  products.forEach((p) => {
    if (p.badge) counts[p.badge] = (counts[p.badge] || 0) + 1;
  });
  const keep = new Set();
  Object.entries(counts).forEach(([label, n]) => {
    // Small grids (<5) can't be judged on share; otherwise cap a label at ~1 in 4 products.
    if (total < 5 || n / total <= 0.25) keep.add(label);
  });
  return keep;
}
