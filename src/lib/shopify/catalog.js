/**
 * SYORA — Catalogue data layer (Storefront API, read-only)
 *
 * Everything the storefront shows comes through here: collections with cursor
 * pagination, server-side sort and filters, search, newest products,
 * recommendations, category collections looked up by handle.
 *
 * Rules: no product handle, product id or product count is written in this
 * file. Collection handles come from config (src/config/site.js).
 */
import { shopifyFetch } from './client';
import { normaliseProductCard } from './products';

export const PAGE_SIZE = 24;

const CARD_FIELDS = `
  fragment CardFields on Product {
    id title handle availableForSale tags
    featuredImage { url altText width height }
    images(first: 2) { edges { node { url altText width height } } }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
  }
`;

const FILTER_FIELDS = `id label type values { id label count input }`;

const COLLECTION_PAGE = `
  ${CARD_FIELDS}
  query CollectionPage($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
    collection(handle: $handle) {
      id title handle description
      image { url altText width height }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        filters { ${FILTER_FIELDS} }
        pageInfo { hasNextPage endCursor }
        edges { node { ...CardFields } }
      }
    }
  }
`;

const ALL_PRODUCTS = `
  ${CARD_FIELDS}
  query AllProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      pageInfo { hasNextPage endCursor }
      edges { node { ...CardFields } }
    }
  }
`;

const SEARCH = `
  ${CARD_FIELDS}
  query SearchProducts($query: String!, $first: Int!, $after: String, $filters: [ProductFilter!], $sortKey: SearchSortKeys, $reverse: Boolean) {
    search(query: $query, first: $first, after: $after, types: [PRODUCT], productFilters: $filters, sortKey: $sortKey, reverse: $reverse) {
      totalCount
      productFilters { ${FILTER_FIELDS} }
      pageInfo { hasNextPage endCursor }
      edges { node { ... on Product { ...CardFields } } }
    }
  }
`;

const NEW_IN = `
  ${CARD_FIELDS}
  query NewIn($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) { edges { node { ...CardFields } } }
  }
`;

const RECOMMENDATIONS = `
  ${CARD_FIELDS}
  query Recommendations($productId: ID!) {
    productRecommendations(productId: $productId, intent: RELATED) { ...CardFields }
  }
`;

/** Sort keys differ between collection, all-products and search queries. */
export const SORTS = [
  { id: 'featured', label: 'Featured',          collection: ['BEST_SELLING', false], all: ['BEST_SELLING', false], search: ['RELEVANCE', false] },
  { id: 'newest',   label: 'Newest',            collection: ['CREATED', true],       all: ['CREATED_AT', true],    search: ['RELEVANCE', false] },
  { id: 'price-asc',  label: 'Price: low to high', collection: ['PRICE', false],     all: ['PRICE', false],        search: ['PRICE', false] },
  { id: 'price-desc', label: 'Price: high to low', collection: ['PRICE', true],      all: ['PRICE', true],         search: ['PRICE', true] },
];

function sortFor(kind, sortId) {
  const s = SORTS.find((x) => x.id === sortId) || SORTS[0];
  const [sortKey, reverse] = s[kind];
  return { sortKey, reverse };
}

const parseFilters = (inputs = []) => inputs.map((i) => (typeof i === 'string' ? JSON.parse(i) : i));
const toCards = (edges = []) => edges.map((e) => e.node).filter(Boolean).map(normaliseProductCard);
const toFilters = (list = []) =>
  list.filter((f) => f.values?.length).map((f) => ({ id: f.id, label: f.label, type: f.type, values: f.values }));

/**
 * One page of a collection. Returns null `collection` when Shopify has no
 * collection with this handle (the UI renders a "coming soon" state, not an error).
 */
export async function fetchCollectionPage({ handle, after = null, sort = 'featured', filters = [], first = PAGE_SIZE }) {
  const { sortKey, reverse } = sortFor('collection', sort);
  const data = await shopifyFetch({ query: COLLECTION_PAGE, variables: { handle, first, after, sortKey, reverse, filters: parseFilters(filters) } });
  const c = data?.collection;
  if (!c) return { collection: null, items: [], hasMore: false, cursor: null, filters: [] };
  return {
    collection: { id: c.id, title: c.title, handle: c.handle, description: c.description, image: c.image },
    items: toCards(c.products?.edges),
    hasMore: !!c.products?.pageInfo?.hasNextPage,
    cursor: c.products?.pageInfo?.endCursor || null,
    filters: toFilters(c.products?.filters),
  };
}

/** One page of every product (used by the Shop page). Sort only: no filters here. */
export async function fetchAllProductsPage({ after = null, sort = 'featured', first = PAGE_SIZE }) {
  const { sortKey, reverse } = sortFor('all', sort);
  const data = await shopifyFetch({ query: ALL_PRODUCTS, variables: { first, after, sortKey, reverse } });
  return {
    collection: { title: 'Shop', handle: 'all' },
    items: toCards(data?.products?.edges),
    hasMore: !!data?.products?.pageInfo?.hasNextPage,
    cursor: data?.products?.pageInfo?.endCursor || null,
    filters: [],
  };
}

export async function fetchSearchPage({ query, after = null, sort = 'featured', filters = [], first = PAGE_SIZE }) {
  const { sortKey, reverse } = sortFor('search', sort);
  const data = await shopifyFetch({ query: SEARCH, variables: { query, first, after, sortKey, reverse, filters: parseFilters(filters) } });
  const s = data?.search;
  return {
    collection: { title: `Results for "${query}"`, handle: 'search' },
    total: s?.totalCount ?? 0,
    items: toCards(s?.edges),
    hasMore: !!s?.pageInfo?.hasNextPage,
    cursor: s?.pageInfo?.endCursor || null,
    filters: toFilters(s?.productFilters),
  };
}

/** Newest products: never a fixed list. */
export async function fetchNewIn(first = 8) {
  const data = await shopifyFetch({ query: NEW_IN, variables: { first } });
  return toCards(data?.products?.edges);
}

export async function fetchRecommendations(productId) {
  if (!productId) return [];
  const data = await shopifyFetch({ query: RECOMMENDATIONS, variables: { productId } });
  return (data?.productRecommendations || []).map(normaliseProductCard);
}

/**
 * Category collections by handle, in one request. A handle Shopify does not
 * know comes back as `exists: false` so the UI can show "Coming soon".
 * Handles come from config only (never user input), so building aliases is safe.
 */
export async function fetchCategories(categories) {
  if (!categories?.length) return [];
  const safe = categories.filter((c) => /^[a-z0-9-]+$/.test(c.handle));
  const body = safe
    .map((c, i) => `c${i}: collection(handle: "${c.handle}") { handle title image { url altText width height } products(first: 1) { edges { node { featuredImage { url altText width height } } } } }`)
    .join('\n');
  const data = await shopifyFetch({ query: `query Categories { ${body} }` });
  return safe.map((c, i) => {
    const node = data?.[`c${i}`];
    const img = node?.image || node?.products?.edges?.[0]?.node?.featuredImage || null;
    return { ...c, exists: !!node, image: img };
  });
}
