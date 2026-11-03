/**
 * SYORA — Cashfree Payment Gateway server-side helpers
 *
 * CASHFREE_CLIENT_SECRET never leaves the server. Used only by
 * /api/cashfree-create-order.js and /api/cashfree-webhook.js.
 */

import crypto from 'node:crypto';

const CLIENT_ID     = process.env.CASHFREE_CLIENT_ID;
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const API_VERSION   = process.env.CASHFREE_API_VERSION || '2026-01-01';
const BASE_URL = process.env.CASHFREE_ENV === 'sandbox'
  ? 'https://sandbox.cashfree.com/pg'
  : 'https://api.cashfree.com/pg';

/**
 * Create a Cashfree order and return its payment session.
 *
 * @param {Object} opts
 * @param {string} opts.orderId
 * @param {number} opts.amount
 * @param {Object} opts.customer - { id, name, email, phone }
 * @param {string} opts.returnUrl
 * @param {string} opts.notifyUrl
 * @param {Object} [opts.orderTags] - flat string key/value map, echoed back on the webhook
 * @param {string} [opts.orderNote] - free text, echoed back on the webhook
 * @returns {Promise<{paymentSessionId: string, cfOrderId: string}>}
 */
export async function createCashfreeOrder({ orderId, amount, customer, returnUrl, notifyUrl, orderTags, orderNote }) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': CLIENT_ID,
      'x-client-secret': CLIENT_SECRET,
    },
    body: JSON.stringify({
      order_id: orderId,
      order_currency: 'INR',
      order_amount: amount,
      customer_details: {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
      },
      order_tags: orderTags,
      order_note: orderNote,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Cashfree create order failed: ${json.message || res.status}`);
  }
  return { paymentSessionId: json.payment_session_id, cfOrderId: json.cf_order_id };
}

/**
 * Verify a Cashfree webhook's signature.
 * Formula: Base64(HMAC-SHA256(timestamp + rawBody, client_secret))
 *
 * @param {string} rawBody   - the exact, unparsed request body
 * @param {string} timestamp - the `x-webhook-timestamp` header
 * @param {string} signature - the `x-webhook-signature` header
 * @returns {boolean}
 */
export function verifyWebhookSignature(rawBody, timestamp, signature) {
  if (!rawBody || !timestamp || !signature) return false;
  const expected = crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(timestamp + rawBody)
    .digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
