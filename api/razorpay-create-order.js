/**
 * SYORA — POST /api/razorpay-create-order
 *
 * Starts an online (Razorpay) payment. Re-prices the cart server-side —
 * amounts are never trusted from the client. Returns the Razorpay order id
 * for the frontend to hand to Razorpay Checkout's modal.
 *
 * The resulting Shopify order is created by /api/razorpay-verify-payment.js
 * once the browser's checkout handler reports a signed, successful payment
 * (with /api/razorpay-webhook.js as a backup path — see that file).
 */

import { getAuthoritativeCart, shippingFeeFor } from './_lib/shopify.js';
import { createRazorpayOrder, rupeesToPaise } from './_lib/razorpay.js';

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
    // cart.total already has any applicable coupon taken off.
    const total = Math.round((cart.total + shippingFee) * 100) / 100;

    const receipt = `syora_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const order = await createRazorpayOrder({
      amountPaise: rupeesToPaise(total),
      receipt,
      notes: {
        cart_id: cartId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address1: shipping.address1,
        address2: shipping.address2 || '',
        city: shipping.city,
        provinceCode: shipping.provinceCode,
        zip: shipping.zip,
        shipping_fee: String(shippingFee),
        discount_amount: String(cart.discountAmount || 0),
        discount_code: (cart.discountCodes || []).join(',').slice(0, 100),
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
      total,
      customer: { name: customer.name, email: customer.email, phone: customer.phone },
    });
  } catch (err) {
    console.error('[razorpay-create-order]', err);
    return res.status(500).json({ error: 'Could not start payment. Please try again.' });
  }
}
