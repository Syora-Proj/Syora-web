/**
 * SYORA — Shopify product helpers
 *
 * Normalises Storefront API products into the shapes the UI uses.
 * Fully generic: no product handle, id, count or image index is written here.
 * Whatever options and variants a product defines are what the page renders.
 */
import { shopifyFetch } from './client';
import { PRODUCT_METAFIELDS } from '../../config/site';

/* ── Formatters ─────────────────────────────────────────── */
export function formatMoney(money) {
  if (!money) return '';
  const amount = parseFloat(money.amount);
  if (money.currencyCode === 'INR') return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: money.currencyCode, maximumFractionDigits: 0 }).format(amount);
}
export const parsePrice = (amount) => parseFloat(amount || '0');

export function computeDiscountPercent(price, compareAtPrice) {
  if (!compareAtPrice) return 0;
  const sale = parsePrice(price?.amount);
  const orig = parsePrice(compareAtPrice?.amount);
  return !orig || orig <= sale ? 0 : Math.round(((orig - sale) / orig) * 100);
}

/** `universe:icon` tag -> 'icon' */
export function getUniverseFromTags(tags = []) {
  const tag = tags.find((t) => t.toLowerCase().startsWith('universe:'));
  return tag ? tag.split(':')[1].trim().toLowerCase() : null;
}

/* ── Card shape (collection grids, new in, search, recommendations) ── */
export function normaliseProductCard(node) {
  const price = node.priceRange?.minVariantPrice;
  const compareAt = node.compareAtPriceRange?.minVariantPrice;
  const featured = node.featuredImage || null;
  const second = (node.images?.edges || []).map((e) => e.node).find((i) => i?.url && i.url !== featured?.url) || null;
  const badgeTag = (node.tags || []).find((t) => t.toLowerCase().startsWith('badge:'));
  return {
    id: node.handle,
    shopifyId: node.id,
    handle: node.handle,
    name: node.title,
    img: featured?.url || '',
    imgW: featured?.width || null,
    imgH: featured?.height || null,
    imgAlt: featured?.altText || node.title,
    imgHover: second?.url || '',
    price: formatMoney(price),
    priceRaw: parsePrice(price?.amount),
    originalPrice: formatMoney(compareAt),
    originalPriceRaw: parsePrice(compareAt?.amount),
    badge: badgeTag ? badgeTag.split(':')[1].trim().toUpperCase() : null,
    availableForSale: node.availableForSale,
    universeId: getUniverseFromTags(node.tags),
  };
}

/* ── Full product (product page) ─────────────────────────── */
const metaIds = () => PRODUCT_METAFIELDS.map(({ namespace, key }) => ({ namespace, key }));

const PRODUCT_QUERY = `
  query ProductPage($handle: String!, $ids: [HasMetafieldsIdentifier!]!) {
    product(handle: $handle) {
      id title handle description availableForSale tags vendor productType
      featuredImage { url altText width height }
      images(first: 30) { edges { node { url altText width height } } }
      options { name values }
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      variants(first: 100) { edges { node {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { url altText width height }
      } } }
      collections(first: 8) { edges { node { handle title } } }
      seo { title description }
      metafields(identifiers: $ids) { namespace key value }
    }
  }
`;

const kindOf = (name = '') => (/colou?r/i.test(name) ? 'colour' : /size/i.test(name) ? 'size' : 'other');

export function normaliseProduct(node) {
  if (!node) return null;
  const images = (node.images?.edges || []).map((e) => e.node).filter((i) => i?.url);
  if (!images.length && node.featuredImage?.url) images.push(node.featuredImage);

  const variants = (node.variants?.edges || []).map((e) => {
    const v = e.node;
    return {
      id: v.id,
      title: v.title,
      available: v.availableForSale !== false,
      price: v.price,
      compareAt: v.compareAtPrice,
      options: Object.fromEntries((v.selectedOptions || []).map((o) => [o.name, o.value])),
      image: v.image?.url || null,
    };
  });

  // Options exactly as Shopify defines them. A lone "Default Title" is not a choice.
  const options = (node.options || [])
    .filter((o) => !(o.values.length === 1 && /^default title$/i.test(o.values[0])))
    .map((o) => ({ name: o.name, kind: kindOf(o.name), values: o.values }));

  const price = node.priceRange?.minVariantPrice;
  const compareAt = node.compareAtPriceRange?.minVariantPrice;
  const collections = (node.collections?.edges || []).map((e) => e.node);
  const metaByKey = new Map((node.metafields || []).filter(Boolean).map((m) => [`${m.namespace}.${m.key}`, m.value]));
  const metafields = PRODUCT_METAFIELDS
    .map(({ namespace, key, label }) => ({ label, value: metaByKey.get(`${namespace}.${key}`) }))
    .filter((m) => m.value && String(m.value).trim());
  const materialTag = (node.tags || []).find((t) => t.toLowerCase().startsWith('material:'));
  if (materialTag && !metafields.some((m) => /material/i.test(m.label))) {
    metafields.unshift({ label: 'Material', value: materialTag.split(':').slice(1).join(':').trim() });
  }

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    description: (node.description || '').trim(),
    vendor: node.vendor || '',
    productType: node.productType || '',
    tags: node.tags || [],
    availableForSale: node.availableForSale,
    images,
    options,
    variants,
    price: parsePrice(price?.amount),
    compareAt: parsePrice(compareAt?.amount),
    currency: price?.currencyCode || 'INR',
    discountPercent: computeDiscountPercent(price, compareAt),
    universeId: getUniverseFromTags(node.tags) || (collections.find((c) => ['icon', 'heritage', 'everyday', 'motion'].includes(c.handle))?.handle ?? null),
    collections,
    metafields,
    seoTitle: node.seo?.title || '',
    seoDescription: node.seo?.description || '',
  };
}

export async function getProductByHandle(handle) {
  const data = await shopifyFetch({ query: PRODUCT_QUERY, variables: { handle, ids: metaIds() } });
  return normaliseProduct(data?.product);
}
