/**
 * SYORA — Shopify server-side helpers (Admin + Storefront)
 *
 * Used only by /api serverless functions. Never imported by frontend code.
 * Files under api/_lib are not treated as routes by Vercel (underscore prefix).
 */

const STORE_DOMAIN  = process.env.SHOPIFY_STORE_DOMAIN;
const API_VERSION   = process.env.SHOPIFY_API_VERSION || '2026-10';
const ADMIN_CLIENT_ID     = process.env.SHOPIFY_ADMIN_CLIENT_ID;
const ADMIN_CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const ADMIN_URL       = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
const STOREFRONT_URL  = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;
const OAUTH_TOKEN_URL = `https://${STORE_DOMAIN}/admin/oauth/access_token`;

// Admin access tokens minted from this OAuth app have been observed to go
// invalid well before their stated 24h expiry (e.g. a concurrent token
// request can silently invalidate the previous one) — so instead of pinning
// one token in an env var and manually replacing it when it dies, we mint a
// fresh one from the (non-expiring) client id/secret on cold start, cache it
// briefly, and transparently re-mint on any auth failure.
let cachedAdminToken = null;
let cachedAdminTokenAt = 0;
const ADMIN_TOKEN_CACHE_MS = 10 * 60 * 1000;

async function mintAdminToken() {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: ADMIN_CLIENT_ID,
      client_secret: ADMIN_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.access_token) {
    throw new Error(`Shopify admin token exchange failed: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

async function getAdminToken(forceRefresh) {
  const stale = !cachedAdminToken || forceRefresh || Date.now() - cachedAdminTokenAt > ADMIN_TOKEN_CACHE_MS;
  if (stale) {
    cachedAdminToken = await mintAdminToken();
    cachedAdminTokenAt = Date.now();
  }
  return cachedAdminToken;
}

async function gql(url, headers, query, variables) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json().catch(() => null);
  const authError = res.status === 401
    || (typeof json?.errors === 'string' && /invalid api key|access token/i.test(json.errors));
  if (!res.ok || authError) {
    const err = new Error(`Shopify HTTP error ${res.status}: ${json ? JSON.stringify(json.errors) : ''}`);
    err.authError = authError;
    throw err;
  }
  if (json.errors?.length) throw new Error(`Shopify GraphQL error: ${json.errors.map((e) => e.message).join(', ')}`);
  return json.data;
}

/** Admin API call — mints/refreshes its own token; never exposes it to the client. */
export async function adminFetch(query, variables) {
  const token = await getAdminToken();
  try {
    return await gql(ADMIN_URL, { 'X-Shopify-Access-Token': token }, query, variables);
  } catch (err) {
    if (!err.authError) throw err;
    const freshToken = await getAdminToken(true);
    return gql(ADMIN_URL, { 'X-Shopify-Access-Token': freshToken }, query, variables);
  }
}

/** Storefront API call (public token, but used server-side here for authoritative cart pricing). */
export function storefrontFetch(query, variables) {
  return gql(STOREFRONT_URL, { 'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN }, query, variables);
}

const CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      totalQuantity
      cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
      discountCodes { code applicable }
      lines(first: 100) {
        edges {
          node {
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                product { title handle }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Re-fetch a cart server-side by its Shopify-issued ID.
 * This is the ONLY source of truth for line items and pricing used in order
 * creation — amounts are never trusted from the client.
 *
 * @returns {Promise<{id, subtotal: number, currency: string, lines: Array<{variantId, quantity, title, price}>}>}
 */
export async function getAuthoritativeCart(cartId) {
  const data = await storefrontFetch(CART_QUERY, { cartId });
  const cart = data?.cart;
  if (!cart || !cart.lines?.edges?.length) return null;

  const lines = cart.lines.edges.map((e) => ({
    variantId: e.node.merchandise.id,
    quantity: e.node.quantity,
    title: `${e.node.merchandise.product?.title || ''} — ${e.node.merchandise.title}`.trim(),
    price: parseFloat(e.node.merchandise.price.amount),
  }));
  const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
  // totalAmount is what the customer owes after any applicable discount code.
  const total = parseFloat((cart.cost.totalAmount || cart.cost.subtotalAmount).amount);
  // Order lines are created at list price, so the discount is whatever list price
  // minus the cart's own total says it is — never a figure sent from the browser.
  const listSubtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const discountAmount = Math.max(0, Math.round((listSubtotal - total) * 100) / 100);
  const discountCodes = (cart.discountCodes || []).filter((d) => d.applicable).map((d) => d.code);

  return {
    id: cart.id,
    subtotal,
    total,
    discountAmount,
    discountCodes,
    currency: cart.cost.subtotalAmount.currencyCode,
    lines,
  };
}

/** Free shipping over ₹999 (matches the policy stated on every PDP), flat ₹99 fee below it. */
export function shippingFeeFor(subtotal) {
  return subtotal >= 999 ? 0 : 99;
}

const DRAFT_ORDER_CREATE = `
  mutation DraftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder { id }
      userErrors { field message }
    }
  }
`;

// paymentPending is marked deprecated in favour of PaymentTerms, but remains
// a supported argument. Revisit if Shopify removes it outright.
const DRAFT_ORDER_COMPLETE = `
  mutation DraftOrderComplete($id: ID!, $paymentPending: Boolean) {
    draftOrderComplete(id: $id, paymentPending: $paymentPending) {
      draftOrder { id order { id name } }
      userErrors { field message }
    }
  }
`;

/**
 * Create and complete a real Shopify order from a cart + shipping address.
 *
 * @param {Object} opts
 * @param {Array}  opts.lines      - [{ variantId, quantity }]
 * @param {Object} opts.address    - { firstName, lastName, address1, address2, city, provinceCode, zip, phone }
 * @param {string} opts.email
 * @param {number} opts.shippingFee
 * @param {Array<string>} opts.tags
 * @param {string} opts.note
 * @param {{amount:number,title?:string}} [opts.discount] - order-level discount (coupon), fixed rupee amount
 * @param {boolean} opts.paymentPending - true for COD (unpaid), false/omit for already-paid (Razorpay)
 * @returns {Promise<{orderId: string, orderName: string}>}
 */
export async function createShopifyOrder({ lines, address, email, shippingFee, tags, note, paymentPending, discount }) {
  const input = {
    lineItems: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
    shippingAddress: {
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      address2: address.address2 || undefined,
      city: address.city,
      provinceCode: address.provinceCode,
      countryCode: 'IN',
      zip: address.zip,
      phone: address.phone,
    },
    email,
    note,
    tags,
    ...(discount && discount.amount > 0
      ? { appliedDiscount: { title: discount.title || 'Discount', description: discount.title ? `Coupon ${discount.title}` : 'Discount', value: discount.amount, valueType: 'FIXED_AMOUNT' } }
      : {}),
    shippingLine: { title: shippingFee > 0 ? 'Standard Delivery' : 'Free Delivery', price: shippingFee.toFixed(2) },
  };

  const createData = await adminFetch(DRAFT_ORDER_CREATE, { input });
  const createErrs = createData.draftOrderCreate.userErrors;
  if (createErrs?.length) throw new Error(`draftOrderCreate failed: ${createErrs.map((e) => e.message).join(', ')}`);

  const draftId = createData.draftOrderCreate.draftOrder.id;

  const completeData = await adminFetch(DRAFT_ORDER_COMPLETE, { id: draftId, paymentPending: !!paymentPending });
  const completeErrs = completeData.draftOrderComplete.userErrors;
  if (completeErrs?.length) throw new Error(`draftOrderComplete failed: ${completeErrs.map((e) => e.message).join(', ')}`);

  const order = completeData.draftOrderComplete.draftOrder.order;
  return { orderId: order.id, orderName: order.name };
}

/**
 * Idempotency guard: has an order already been created for this payment gateway's order id?
 *
 * KNOWN LIMITATION (verified directly): Shopify's order search index lags
 * writes by a few seconds. Two calls to this within that window - e.g. the
 * Razorpay client-side verify call and the Razorpay webhook firing almost
 * simultaneously after a real payment - can both miss the other's order and
 * create a duplicate. Low-risk today since only one gateway order-creation
 * path is ever live at a time (the webhook is inert until
 * RAZORPAY_WEBHOOK_SECRET is configured), but revisit with real locking
 * (e.g. Vercel KV) before running both paths concurrently in production.
 */
export async function findOrderByGatewayOrderId(gatewayOrderId) {
  const data = await adminFetch(
    `query($q: String!) { orders(first: 1, query: $q) { edges { node { id name } } } }`,
    { q: `tag:'gateway_order_id:${gatewayOrderId}'` },
  );
  return data.orders.edges[0]?.node || null;
}
