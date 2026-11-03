/**
 * SYORA — POST /api/razorpay-verify-payment
 *
 * Called by the frontend immediately after Razorpay Checkout's handler
 * callback fires with a completed payment. Verifies the signature
 * server-side (never trust the client's claim alone), re-fetches the
 * order's authoritative notes from Razorpay (not from the request body),
 * re-fetches the cart from Shopify for authoritative line items, and
 * creates the real paid order.
 *
 * Idempotent: if /api/razorpay-webhook.js already created the order for
 * this payment (e.g. the browser was closed right after paying, before
 * this call completed), this is a safe no-op.
 */

import { getAuthoritativeCart, createShopifyOrder, findOrderByGatewayOrderId } from './_lib/shopify.js';
import { verifyPaymentSignature, getRazorpayOrder } from './_lib/razorpay.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const valid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (!valid) {
      console.error('[razorpay-verify-payment] signature mismatch', razorpay_order_id);
      return res.status(401).json({ error: 'Payment verification failed' });
    }

    // Idempotency: the webhook (if configured) may have already created this order.
    const existing = await findOrderByGatewayOrderId(razorpay_order_id);
    if (existing) {
      return res.status(200).json({ orderName: existing.name });
    }

    const order = await getRazorpayOrder(razorpay_order_id);
    const notes = order.notes || {};
    const cartId = notes.cart_id;
    if (!cartId) throw new Error('Razorpay order notes missing cart_id');

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
      tags: [`gateway_order_id:${razorpay_order_id}`, `razorpay_payment_id:${razorpay_payment_id}`, 'source:razorpay'],
      note: `Paid via Razorpay. Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}`,
      paymentPending: false,
      discount: parseFloat(notes.discount_amount || '0') > 0
        ? { amount: parseFloat(notes.discount_amount), title: notes.discount_code || undefined }
        : undefined,
    });

    return res.status(200).json({ orderName });
  } catch (err) {
    console.error('[razorpay-verify-payment]', err);
    return res.status(500).json({ error: 'Payment succeeded but we could not finalize your order. Contact us with your payment ID.' });
  }
}
