/**
 * SYORA — POST /api/create-cod-order
 *
 * Cash on Delivery path — advertised on the cart page ("Cash on Delivery*
 * ... where your PIN code and courier are serviceable"), so it's kept as
 * a real option alongside Cashfree. No external payment gateway involved:
 * the order is created immediately as unpaid (financial_status: pending).
 */

import { getAuthoritativeCart, shippingFeeFor, createShopifyOrder } from './_lib/shopify.js';

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
    const [firstName, ...rest] = customer.name.trim().split(/\s+/);

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
      shippingFee,
      tags: ['source:cod'],
      note: 'Cash on Delivery — payment due at delivery.',
      paymentPending: true,
    });

    return res.status(200).json({ orderName });
  } catch (err) {
    console.error('[create-cod-order]', err);
    return res.status(500).json({ error: 'Could not place your order. Please try again.' });
  }
}
