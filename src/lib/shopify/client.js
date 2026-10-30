/**
 * SYORA — Shopify Storefront API Client
 *
 * Central GraphQL fetch utility.
 * All Shopify Storefront API calls route through this single function.
 *
 * Security:
 *   - Uses the public Storefront API token (VITE_ prefix is safe for client bundles).
 *   - Token is never logged, never returned in responses, never sent to third parties.
 *   - Admin API credentials must never be used here.
 *
 * API version: 2025-01 (stable, non-deprecated as of implementation date)
 */

const STOREFRONT_API_URL = `https://${import.meta.env.VITE_SHOPIFY_STORE_DOMAIN}/api/2025-01/graphql.json`;
const STOREFRONT_TOKEN   = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

/**
 * Execute a GraphQL operation against the Shopify Storefront API.
 *
 * @param {string}  query     - GraphQL query or mutation string
 * @param {Object}  [variables] - Optional GraphQL variables
 * @returns {Promise<Object>}   - Parsed `data` field from the GraphQL response
 * @throws  {Error}             - On network failure, HTTP error, or GraphQL errors
 */
export async function shopifyFetch({ query, variables = {} }) {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 10_000); // 10 s timeout

  try {
    const response = await fetch(STOREFRONT_API_URL, {
      method:  'POST',
      signal:  controller.signal,
      headers: {
        'Content-Type':                      'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API HTTP error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors?.length) {
      const messages = json.errors.map((e) => e.message).join(', ');
      throw new Error(`Shopify API GraphQL error: ${messages}`);
    }

    return json.data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Shopify API request timed out after 10 seconds.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
