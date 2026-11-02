/**
 * SYORA — storefront product search
 * Uses the Storefront API `search` query and the same card normaliser as the collection pages,
 * so a search result looks and links exactly like a product anywhere else on the site.
 */
import { shopifyFetch } from './client';
import { normaliseProductCard } from './products';

const SEARCH_QUERY = `
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: [PRODUCT]) {
      edges {
        node {
          ... on Product {
            id
            title
            handle
            availableForSale
            productType
            tags
            featuredImage { url altText }
            priceRange { minVariantPrice { amount currencyCode } }
            compareAtPriceRange { minVariantPrice { amount currencyCode } }
          }
        }
      }
    }
  }
`;

/** @returns {Promise<Array>} normalised product cards matching `term` */
export async function searchProducts(term, first = 8) {
  const query = String(term || '').trim();
  if (query.length < 2) return [];
  const data = await shopifyFetch({ query: SEARCH_QUERY, variables: { query, first } });
  return (data?.search?.edges || []).map((e) => e.node).filter((n) => n && n.handle).map(normaliseProductCard);
}

/** Customer account page on the Shopify store (login, orders). */
export function accountUrl() {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
  return domain ? `https://${domain}/account` : '';
}
