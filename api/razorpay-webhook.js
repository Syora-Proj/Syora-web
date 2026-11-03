/**
 * SYORA — POST /api/razorpay-webhook
 *
 * Backup path for order creation. The primary path is
 * /api/razorpay-verify-payment.js, called synchronously by the browser the
 * moment Checkout's handler callback fires. This webhook exists for the
 * case where that call never completes (tab closed, network drop right
 * after paying) — Razorpay's payment.captured event lets the order still
 * get created even if the browser never confirms anything.
 *
 * Requires RAZORPAY_WEBHOOK_SECRET, configured separately from
 * RAZORPAY_KEY_SECRET when the webhook is added in the Razorpay dashboard
 * (Settings -> Webhooks). Until that's set up, this endpoint 500s safely
 * without ever creating an unverified order.
 *
 * Idempotent against /api/razorpay-verify-payment.js via the same
 * gateway_order_id tag check — whichever path runs first wins, the second
 * is a no-op.
 */

import { verifyWebhookSignature } from './_lib/razorpay.js';
import { getAuthoritativeCart, createShopifyOrder, findOrderByGatewayOrderId } from './_lib/shopify.js';

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
  const signature = req.headers['x-razorpay-signature'];

  let valid;
  try {
    valid = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error('[razorpay-webhook]', err.message);
    return res.status(500).json({ error: 'Webhook not configured' });
  }
  if (!valid) {
    console.error('[razorpay-webhook] signature verification failed');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (payload.event !== 'payment.captured') {
    return res.status(200).json({ received: true, ignored: payload.event });
  }

  const payment = payload.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  const razorpayPaymentId = payment?.id;
  const notes = payment?.notes || {};
  const cartId = notes.cart_id;

  if (!razorpayOrderId || !cartId) {
    console.error('[razorpay-webhook] missing order_id or cart_id in payload', payment);
    return res.status(400).json({ error: 'Malformed payload' });
  }

  try {
    const existing = await findOrderByGatewayOrderId(razorpayOrderId);
    if (existing) {
      return res.status(200).json({ received: true, alreadyCreated: existing.name });
    }

    const cart = await getAuthoritativeCart(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found or expired — cannot rebuild line items`);

    const [firstName, ...rest] = (notes.name || '').trim().split(/\s+/);

    const { orderName } = await createShopifyOrder({
      lines: cart.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
      address: {
        firstName: firstName || notes.name,
        lastName: rest.join(' ') || '',
        address1: notes.address1,
        address2: notes.address2,
        city: notes.city,
        provinceCode: notes.provinceCode,
        zip: notes.zip,
        phone: notes.phone,
      },
      email: notes.email,
      shippingFee: parseFloat(notes.shipping_fee || '0'),
      tags: [`gateway_order_id:${razorpayOrderId}`, `razorpay_payment_id:${razorpayPaymentId}`, 'source:razorpay'],
      note: `Paid via Razorpay (webhook). Order ID: ${razorpayOrderId}, Payment ID: ${razorpayPaymentId}`,
      paymentPending: false,
    });

    console.log(`[razorpay-webhook] created ${orderName} for Razorpay order ${razorpayOrderId}`);
    return res.status(200).json({ received: true, order: orderName });
  } catch (err) {
    console.error('[razorpay-webhook] order creation failed', err);
    return res.status(500).json({ error: 'Order creation failed' });
  }
}
