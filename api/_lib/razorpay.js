/**
 * SYORA — Razorpay server-side helpers
 *
 * RAZORPAY_KEY_SECRET (and RAZORPAY_WEBHOOK_SECRET) never leave the server.
 * Used only by /api/razorpay-create-order.js, /api/razorpay-verify-payment.js,
 * and /api/razorpay-webhook.js.
 */

import crypto from 'node:crypto';

const KEY_ID     = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET; // separate from KEY_SECRET - set when the webhook is configured in the Razorpay dashboard

const BASE_URL = 'https://api.razorpay.com/v1';
const AUTH_HEADER = 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

/**
 * Create a Razorpay order. Amount must be in paise (smallest INR subunit).
 *
 * @param {Object} opts
 * @param {number} opts.amountPaise
 * @param {string} opts.receipt   - internal reference, max 40 chars, unique
 * @param {Object} [opts.notes]   - up to 15 flat string key/value pairs, 256 chars each
 * @returns {Promise<{id: string, amount: number}>}
 */
export async function createRazorpayOrder({ amountPaise, receipt, notes }) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: AUTH_HEADER },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Razorpay create order failed: ${json.error?.description || res.status}`);
  }
  return { id: json.id, amount: json.amount };
}

/** Fetch an order back from Razorpay (used to read its authoritative notes at verification time). */
export async function getRazorpayOrder(orderId) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
    headers: { Authorization: AUTH_HEADER },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Razorpay get order failed: ${json.error?.description || res.status}`);
  return json;
}

/**
 * Verify the signature returned by Razorpay Checkout's client-side handler.
 * Formula: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
 */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Verify a Razorpay webhook's signature.
 * Formula: HMAC-SHA256(raw_body, webhook_secret) -> hex, compared to X-Razorpay-Signature.
 * Requires RAZORPAY_WEBHOOK_SECRET to be set (configured when the webhook is added in the dashboard).
 */
export function verifyWebhookSignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
  if (!rawBody || !signature) return false;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function paiseToRupees(paise) {
  return paise / 100;
}

export function rupeesToPaise(rupees) {
  return Math.round(rupees * 100);
}
