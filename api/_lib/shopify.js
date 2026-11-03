/**
 * SYORA — Shopify server-side helpers (Admin + Storefront)
 *
 * Used only by /api serverless functions. Never imported by frontend code.
 * Files under api/_lib are not treated as routes by Vercel (underscore prefix).
 */

const STORE_DOMAIN  = process.env.SHOPIFY_STORE_DOMAIN;
const API_VERSION   = process.env.SHOPIFY_API_VERSION || '2026-10';
const ADMIN_TOKEN    = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const ADMIN_URL      = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
const STOREFRONT_URL = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

async function gql(url, headers, query, variables) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify HTTP error ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`Shopify GraphQL error: ${json.errors.map((e) => e.message).join(', ')}`);
  return json.data;
}

/** Admin API call — never expose ADMIN_TOKEN to the client. */
export function adminFetch(query, variables) {
  return gql(ADMIN_URL, { 'X-Shopify-Access-Token': ADMIN_TOKEN }, query, variables);
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
      cost { subtotalAmount { amount currencyCode } }
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

  return {
    id: cart.id,
    subtotal: parseFloat(cart.cost.subtotalAmount.amount),
    currency: cart.cost.subtotalAmount.currencyCode,
    lines: cart.lines.edges.map((e) => ({
      variantId: e.node.merchandise.id,
      quantity: e.node.quantity,
      title: `${e.node.merchandise.product?.title || ''} — ${e.node.merchandise.title}`.trim(),
      price: parseFloat(e.node.merchandise.price.amount),
    })),
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
 * @param {boolean} opts.paymentPending - true for COD (unpaid), false/omit for already-paid (Cashfree)
 * @returns {Promise<{orderId: string, orderName: string}>}
 */
export async function createShopifyOrder({ lines, address, email, shippingFee, tags, note, paymentPending }) {
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

/** Idempotency guard: has an order already been created for this Cashfree order_id? */
export async function findOrderByCashfreeOrderId(cfOrderId) {
  const data = await adminFetch(
    `query($q: String!) { orders(first: 1, query: $q) { edges { node { id name } } } }`,
    { q: `tag:'cf_order_id:${cfOrderId}'` },
  );
  return data.orders.edges[0]?.node || null;
}
