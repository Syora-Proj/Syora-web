/**
 * SYORA — catalogue queries beyond a single collection
 *
 * Best sellers, new arrivals, the full catalogue, free-text search and "these handles" (wishlist).
 * Everything comes from the live Storefront API and is normalised into the same card shape the
 * collection pages use, so a product looks and links identically wherever it appears.
 */
import { shopifyFetch } from './client';
import { PRODUCT_CARD_FRAGMENT } from './queries';
import { normaliseProductCard } from './products';

const LIST_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query CatalogProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      edges { node { ...ProductCardFields } }
    }
  }
`;

const SEARCH_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query SearchCatalog($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: [PRODUCT]) {
      edges { node { ... on Product { ...ProductCardFields } } }
    }
  }
`;

const cards = (edges = []) => edges.map((e) => e?.node).filter((n) => n && n.handle).map(normaliseProductCard);

async function list({ first, sortKey, reverse = false }) {
  const data = await shopifyFetch({ query: LIST_QUERY, variables: { first, sortKey, reverse } });
  return cards(data?.products?.edges);
}

export const getBestSellers = (first = 8) => list({ first, sortKey: 'BEST_SELLING' });
export const getNewArrivals = (first = 8) => list({ first, sortKey: 'CREATED_AT', reverse: true });
export const getAllProducts = (first = 60) => list({ first, sortKey: 'BEST_SELLING' });

/** Free-text search (title, tags, type…). Returns [] for terms shorter than 2 characters. */
export async function searchCatalog(term, first = 24) {
  const query = String(term || '').trim();
  if (query.length < 2) return [];
  const data = await shopifyFetch({ query: SEARCH_QUERY, variables: { query, first } });
  return cards(data?.search?.edges);
}

/** Fetch specific products by handle (used by the wishlist). Missing/unpublished handles are skipped. */
export async function getProductsByHandles(handles = []) {
  const unique = [...new Set(handles.filter(Boolean))].slice(0, 30);
  if (unique.length === 0) return [];
  const vars = unique.map((_, i) => `$h${i}: String!`).join(', ');
  const body = unique.map((_, i) => `p${i}: product(handle: $h${i}) { ...ProductCardFields }`).join('\n');
  const variables = Object.fromEntries(unique.map((h, i) => [`h${i}`, h]));
  const data = await shopifyFetch({ query: `${PRODUCT_CARD_FRAGMENT}\nquery ByHandles(${vars}) {\n${body}\n}`, variables });
  return unique.map((_, i) => data?.[`p${i}`]).filter((n) => n && n.handle).map(normaliseProductCard);
}
