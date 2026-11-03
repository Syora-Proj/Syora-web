/**
 * SYORA — POST /api/cashfree-webhook
 *
 * Cashfree calls this once a payment's status changes. We verify the
 * signature against the RAW body (bodyParser disabled below — a parsed/
 * re-serialized body will not hash the same as what Cashfree signed),
 * then on PAYMENT_SUCCESS create the real Shopify order.
 *
 * Idempotent: Cashfree retries webhook delivery, so we check for an
 * existing order tagged with this Cashfree order_id before creating one.
 *
 * IMPORTANT: order_note at creation time carries the only copy of the
 * shipping address + customer info (no database in this project). If a
 * cart has expired on Shopify's side by the time this fires (carts last
 * ~10 days), the line-item re-fetch below will fail — this function
 * returns 500 so Cashfree retries, but a cart dead for that long won't
 * recover on retry either. That's a real gap worth a database if order
 * volume grows.
 */

import { verifyWebhookSignature } from './_lib/cashfree.js';
import { getAuthoritativeCart, createShopifyOrder, findOrderByCashfreeOrderId } from './_lib/shopify.js';

export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await readRawBody(req);
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];

  if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
    console.error('[cashfree-webhook] signature verification failed');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Only PAYMENT_SUCCESS creates an order. Other events (failed, dropped,
  // user cancelled, refunds) are acknowledged but not acted on here.
  if (payload.type !== 'PAYMENT_SUCCESS_WEBHOOK') {
    return res.status(200).json({ received: true, ignored: payload.type });
  }

  const cfOrderId = payload.data?.order?.order_id;
  const cartId = payload.data?.order?.order_tags?.cart_id;
  const paymentAmount = payload.data?.payment?.payment_amount;
  const cfPaymentId = payload.data?.payment?.cf_payment_id;

  if (!cfOrderId || !cartId) {
    console.error('[cashfree-webhook] missing order_id or cart_id in payload', payload.data?.order);
    return res.status(400).json({ error: 'Malformed payload' });
  }

  try {
    const existing = await findOrderByCashfreeOrderId(cfOrderId);
    if (existing) {
      return res.status(200).json({ received: true, alreadyCreated: existing.name });
    }

    let meta;
    try {
      meta = JSON.parse(payload.data.order.order_note);
    } catch {
      throw new Error('Could not parse order_note — shipping/customer details lost');
    }
    const { customer, shipping, shippingFee } = meta;

    const cart = await getAuthoritativeCart(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found or expired — cannot rebuild line items`);

    const [firstName, ...rest] = (customer.name || '').trim().split(/\s+/);

    const { orderName } = await createShopifyOrder({
      lines: cart.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
      address: {
        firstName: firstName || customer.name,
        lastName: rest.join(' ') || '',
        address1: shipping.address1,
        address2: shipping.address2,
        city: shipping.city,
        provinceCode: shipping.provinceCode,
        zip: shipping.zip,
        phone: customer.phone,
      },
      email: customer.email,
      shippingFee: shippingFee ?? 0,
      tags: [`cf_order_id:${cfOrderId}`, `cf_payment_id:${cfPaymentId}`, 'source:cashfree'],
      note: `Paid via Cashfree. Order ID: ${cfOrderId}, Payment ID: ${cfPaymentId}, Amount: ₹${paymentAmount}`,
      paymentPending: false,
    });

    console.log(`[cashfree-webhook] created ${orderName} for Cashfree order ${cfOrderId}`);
    return res.status(200).json({ received: true, order: orderName });
  } catch (err) {
    console.error('[cashfree-webhook] order creation failed', err);
    // 500 so Cashfree retries delivery — do not acknowledge a payment we
    // failed to turn into an order.
    return res.status(500).json({ error: 'Order creation failed' });
  }
}
