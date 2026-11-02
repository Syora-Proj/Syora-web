/**
 * SYORA — SEO helpers (pure functions: safe to import from the browser AND from the build-time
 * pre-render script in scripts/prerender.mjs, so both always produce identical tags).
 *
 * Nothing here invents data: ratings are only emitted when real reviews exist, and every field
 * is skipped when the product does not have it.
 */

export const DEFAULT_SITE_ORIGIN = 'https://syora.co.in';

/** Production origin used for canonical URLs, sitemaps and structured data. */
export function siteOrigin() {
  let fromEnv = '';
  try { fromEnv = import.meta.env?.VITE_SITE_URL || ''; } catch { /* not in Vite */ }
  return String(fromEnv || DEFAULT_SITE_ORIGIN).replace(/\/+$/, '');
}

const clean = (text = '') => String(text).replace(/\s+/g, ' ').trim();

/** Trim to a search-snippet length at a word boundary. */
export function snippet(text = '', max = 155) {
  const s = clean(text);
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 80)).replace(/[,;:\-–—\s]+$/, '')}…`;
}

const absolute = (origin, url) => (!url ? '' : /^https?:\/\//i.test(url) ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`);
const isFact = (v) => v && !/^(—|-|n\/a)$/i.test(String(v).trim());

/**
 * @param {object} product   normalised product (see lib/shopify/products.js)
 * @param {{ origin?: string, universe?: { id: string, name: string } | null }} [opts]
 */
export function buildProductSeo(product, { origin = siteOrigin(), universe = null } = {}) {
  const url = `${origin}/product/${encodeURIComponent(product.handle || product.id)}`;
  // The default "<name> — SYORA" repeats the brand for products already named "SYORA …": use a useful suffix instead.
  const autoTitle = `${product.name} — SYORA`;
  const rawTitle = clean(product.pageTitle || autoTitle);
  const title = rawTitle === autoTitle && /^syora\b/i.test(product.name || '')
    ? `${product.name} | Women's Footwear`
    : rawTitle;
  const description = snippet(
    product.pageDescription || product.description
      || `${product.name} by SYORA — premium Indian women's footwear. Easy exchanges and delivery across India.`,
  );
  const images = (product.images || []).filter(Boolean).slice(0, 6).map((u) => absolute(origin, u));
  const image = images[0] || '';

  const inStock = product.availableForSale !== false;
  const offer = product.price > 0 ? {
    '@type': 'Offer',
    url,
    priceCurrency: 'INR',
    price: Number(product.price).toFixed(2),
    availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@type': 'Organization', name: 'SYORA' },
  } : undefined;

  const hasRating = Number(product.rating) > 0 && Number(product.reviewCount) > 0;
  const colourNames = (product.colours || []).map((c) => c.name).filter(Boolean);

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: clean(product.description) || description,
    image: images.length ? images : undefined,
    url,
    brand: { '@type': 'Brand', name: product.vendor || 'SYORA' },
    category: universe?.name ? `Women's footwear — ${universe.name}` : "Women's footwear",
    material: isFact(product.material) ? product.material : undefined,
    color: colourNames.length === 1 ? colourNames[0] : undefined,
    offers: offer,
    aggregateRating: hasRating
      ? { '@type': 'AggregateRating', ratingValue: Number(product.rating).toFixed(1), reviewCount: Number(product.reviewCount) }
      : undefined,
  };

  const crumbs = [{ name: 'Home', item: `${origin}/` }];
  if (universe?.id) crumbs.push({ name: universe.name.charAt(0) + universe.name.slice(1).toLowerCase(), item: `${origin}/universe/${universe.id}` });
  crumbs.push({ name: product.name, item: url });
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
  };

  return { url, title, description, image, images, jsonLd: [productLd, breadcrumbLd], price: product.price, inStock };
}

/** JSON for a <script type="application/ld+json"> — `<` is escaped so it can never close the tag. */
export const jsonLdString = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The same head tags as an HTML string — used by the pre-render script. Marked data-prerender so the app can swap them for its own. */
export function productHeadHtml(seo) {
  const m = (attr, name, content) => (content ? `<meta ${attr}="${name}" content="${esc(content)}" data-prerender>` : '');
  return [
    `<link rel="canonical" href="${esc(seo.url)}" data-prerender>`,
    m('property', 'og:type', 'product'),
    m('property', 'og:site_name', 'SYORA'),
    m('property', 'og:title', seo.title),
    m('property', 'og:description', seo.description),
    m('property', 'og:url', seo.url),
    m('property', 'og:image', seo.image),
    seo.price > 0 ? m('property', 'product:price:amount', Number(seo.price).toFixed(2)) : '',
    seo.price > 0 ? m('property', 'product:price:currency', 'INR') : '',
    m('name', 'twitter:card', seo.image ? 'summary_large_image' : 'summary'),
    m('name', 'twitter:title', seo.title),
    m('name', 'twitter:description', seo.description),
    m('name', 'twitter:image', seo.image),
    ...seo.jsonLd.map((ld) => `<script type="application/ld+json" data-prerender>${jsonLdString(ld)}</script>`),
  ].filter(Boolean).join('\n    ');
}
