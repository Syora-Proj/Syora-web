/**
 * SYORA — Shopify Cart API Helper
 *
 * All cart operations (create, add, update, remove, retrieve) route
 * through this module. No prices are trusted from the client; all
 * prices shown in the cart UI come directly from Shopify's response.
 *
 * Cart ID is persisted in localStorage under the key 'syora_cart_id'.
 * The ID is a Shopify-issued opaque string — it is not user-readable data.
 *
 * Checkout URL is obtained exclusively from the Shopify cart object.
 * No payment details are collected or stored in the frontend.
 */

import { shopifyFetch } from './client';
import {
  CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from './queries';

const CART_ID_KEY = 'syora_cart_id';

/* ─────────────────────────────────────────────────────────────
   Local storage helpers
───────────────────────────────────────────────────────────── */

function saveCartId(id) {
  try { localStorage.setItem(CART_ID_KEY, id); } catch (_) {}
}

function loadCartId() {
  try { return localStorage.getItem(CART_ID_KEY); } catch (_) { return null; }
}

function clearCartId() {
  try { localStorage.removeItem(CART_ID_KEY); } catch (_) {}
}

/* ─────────────────────────────────────────────────────────────
   Cart normaliser
───────────────────────────────────────────────────────────── */

/**
 * Convert a raw Shopify cart GraphQL object into a clean, component-
 * friendly shape. All prices come from Shopify — never from the client.
 */
function normaliseCart(cart) {
  if (!cart) return null;
  return {
    id:           cart.id,
    checkoutUrl:  cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal:     cart.cost?.subtotalAmount,
    total:        cart.cost?.totalAmount,
    lines: (cart.lines?.edges || []).map((e) => {
      const line = e.node;
      return {
        id:       line.id,
        quantity: line.quantity,
        total:    line.cost?.totalAmount,
        variant: {
          id:      line.merchandise?.id,
          title:   line.merchandise?.title,
          sku:     line.merchandise?.sku,
          price:   line.merchandise?.price,
          product: {
            id:     line.merchandise?.product?.id,
            title:  line.merchandise?.product?.title,
            handle: line.merchandise?.product?.handle,
            image:  line.merchandise?.product?.featuredImage,
          },
          selectedOptions: line.merchandise?.selectedOptions || [],
        },
      };
    }),
    discountCodes: cart.discountCodes || [],
  };
}

/* ─────────────────────────────────────────────────────────────
   Handle user errors from cart mutations
───────────────────────────────────────────────────────────── */

function throwIfUserErrors(userErrors, operation) {
  if (userErrors?.length) {
    const msgs = userErrors.map((e) => e.message).join(', ');
    throw new Error(`Cart ${operation} failed: ${msgs}`);
  }
}

/* ─────────────────────────────────────────────────────────────
   Public API
───────────────────────────────────────────────────────────── */

/**
 * Retrieve the current cart from Shopify.
 * If the stored cart ID is invalid/expired, clears storage and returns null.
 *
 * @returns {Promise<Object|null>} - Normalised cart, or null
 */
export async function getCart() {
  const cartId = loadCartId();
  if (!cartId) return null;

  try {
    const data = await shopifyFetch({ query: CART_QUERY, variables: { cartId } });
    if (!data?.cart) {
      // Cart has expired on Shopify's side (carts expire after ~10 days of inactivity)
      clearCartId();
      return null;
    }
    return normaliseCart(data.cart);
  } catch (_) {
    // If the cart ID is no longer valid, start fresh
    clearCartId();
    return null;
  }
}

/**
 * Create a new cart and persist its ID.
 *
 * @returns {Promise<Object>} - Normalised cart
 */
export async function createCart() {
  const data = await shopifyFetch({
    query:     CART_CREATE_MUTATION,
    variables: { input: {} },
  });
  throwIfUserErrors(data?.cartCreate?.userErrors, 'create');
  const cart = normaliseCart(data?.cartCreate?.cart);
  if (cart?.id) saveCartId(cart.id);
  return cart;
}

/**
 * Add a single variant to the cart.
 * Creates a cart first if none exists.
 * Guards against duplicate add-to-cart calls (Shopify handles qty merging server-side).
 *
 * @param {string} variantId  - Shopify variant GID (e.g. "gid://shopify/ProductVariant/123")
 * @param {number} [quantity=1]
 * @returns {Promise<Object>} - Updated normalised cart
 */
export async function addToCart(variantId, quantity = 1) {
  let cartId = loadCartId();

  if (!cartId) {
    // Create cart with first item
    const data = await shopifyFetch({
      query:     CART_CREATE_MUTATION,
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity }],
        },
      },
    });
    throwIfUserErrors(data?.cartCreate?.userErrors, 'create');
    const cart = normaliseCart(data?.cartCreate?.cart);
    if (cart?.id) saveCartId(cart.id);
    return cart;
  }

  // Cart already exists — add lines
  const data = await shopifyFetch({
    query:     CART_LINES_ADD_MUTATION,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
  });
  throwIfUserErrors(data?.cartLinesAdd?.userErrors, 'lines add');
  return normaliseCart(data?.cartLinesAdd?.cart);
}

/**
 * Update the quantity of a specific cart line.
 *
 * @param {string} lineId    - Shopify cart line ID
 * @param {number} quantity  - New quantity (0 to remove the line)
 * @returns {Promise<Object>} - Updated normalised cart
 */
export async function updateCartLine(lineId, quantity) {
  const cartId = loadCartId();
  if (!cartId) throw new Error('No active cart.');

  const data = await shopifyFetch({
    query:     CART_LINES_UPDATE_MUTATION,
    variables: {
      cartId,
      lines: [{ id: lineId, quantity }],
    },
  });
  throwIfUserErrors(data?.cartLinesUpdate?.userErrors, 'lines update');
  return normaliseCart(data?.cartLinesUpdate?.cart);
}

/**
 * Remove a line item from the cart.
 *
 * @param {string} lineId    - Shopify cart line ID
 * @returns {Promise<Object>} - Updated normalised cart
 */
export async function removeFromCart(lineId) {
  const cartId = loadCartId();
  if (!cartId) throw new Error('No active cart.');

  const data = await shopifyFetch({
    query:     CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
  });
  throwIfUserErrors(data?.cartLinesRemove?.userErrors, 'lines remove');
  return normaliseCart(data?.cartLinesRemove?.cart);
}

/**
 * Get the Shopify-hosted checkout URL from the current cart.
 * Returns null if no cart exists.
 *
 * @returns {Promise<string|null>} - The Shopify checkout URL
 */
export async function getCheckoutUrl() {
  const cart = await getCart();
  return cart?.checkoutUrl || null;
}
