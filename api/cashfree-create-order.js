/**
 * SYORA — POST /api/cashfree-create-order
 *
 * Starts an online (Cashfree) payment. Re-prices the cart server-side —
 * amounts are never trusted from the client. Returns a payment_session_id
 * for the frontend to hand to Cashfree's checkout SDK.
 *
 * The resulting Shopify order is NOT created here — it's created by
 * /api/cashfree-webhook.js once Cashfree confirms payment succeeded.
 */

import { getAuthoritativeCart, shippingFeeFor } from './_lib/shopify.js';
import { createCashfreeOrder } from './_lib/cashfree.js';

const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { cartId, customer, shipping } = req.body || {};

    if (!cartId) return res.status(400).json({ error: 'Missing cartId' });
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({ error: 'Missing customer name, email, or phone' });
    }
    if (!PHONE_RE.test(customer.phone)) return res.status(400).json({ error: 'Invalid phone number' });
    if (!shipping?.address1 || !shipping?.city || !shipping?.provinceCode || !shipping?.zip) {
      return res.status(400).json({ error: 'Missing shipping address fields' });
    }
    if (!PINCODE_RE.test(shipping.zip)) return res.status(400).json({ error: 'Invalid PIN code' });

    const cart = await getAuthoritativeCart(cartId);
    if (!cart) return res.status(400).json({ error: 'Cart not found or empty' });

    const shippingFee = shippingFeeFor(cart.subtotal);
    const total = cart.subtotal + shippingFee;

    const orderId = `syora_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const siteUrl = process.env.SITE_URL;

    const { paymentSessionId } = await createCashfreeOrder({
      orderId,
      amount: total,
      customer: { id: cartId.replace(/\W/g, '').slice(-32), name: customer.name, email: customer.email, phone: customer.phone },
      returnUrl: `${siteUrl}/order-confirmation?cf_order_id=${orderId}`,
      notifyUrl: `${siteUrl}/api/cashfree-webhook`,
      orderTags: { cart_id: cartId },
      orderNote: JSON.stringify({ customer, shipping, shippingFee }),
    });

    return res.status(200).json({ orderId, paymentSessionId, total });
  } catch (err) {
    console.error('[cashfree-create-order]', err);
    return res.status(500).json({ error: 'Could not start payment. Please try again.' });
  }
}
