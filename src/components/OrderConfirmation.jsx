/**
 * SYORA — Order Confirmation Page
 *
 * Shown when a customer returns from Shopify checkout.
 *
 * IMPORTANT RULES:
 * - We NEVER mark an order as paid based solely on the customer landing here.
 * - Shopify is the source of truth for order status.
 * - The purchase analytics event fires once per order ID, guarded by sessionStorage.
 * - No duplicate order records are created; Shopify creates and owns the order.
 *
 * Shopify appends order info to the return URL as query parameters.
 * The return URL is set in your Shopify checkout settings.
 *
 * Shopify may provide: ?order_id=... &order_number=... &checkout_token=...
 * These are informational only — never trust them to confirm payment.
 * Payment status must be verified through Shopify Admin or webhooks.
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { trackPurchase } from '../lib/analytics';

export default function OrderConfirmation() {
  const [searchParams]    = useSearchParams();
  const navigate           = useNavigate();
  const [tracked, setTracked] = useState(false);

  // Read order data from Shopify's return URL parameters
  const orderId     = searchParams.get('order_id') || searchParams.get('orderId');
  const orderNumber = searchParams.get('order_number') || searchParams.get('orderNumber');

  useEffect(() => {
    // Fire purchase event once, guarded against duplicate firing on refresh
    if (orderId && !tracked) {
      trackPurchase({
        orderId,
        total:    0,         // Actual total fetched via webhook/Admin API; do not trust URL params
        currency: 'INR',
        items:    [],        // Items populated by webhook; not from client-side state
      });
      setTracked(true);
    }
  }, [orderId, tracked]);

  return (
    <div className="order-confirm">
      <Navbar />

      <main className="order-confirm__main">
        <div className="order-confirm__inner">
          {/* Success mark */}
          <div className="order-confirm__check">✓</div>

          <p className="order-confirm__eyebrow">ORDER CONFIRMED</p>

          <h1 className="order-confirm__heading">
            Thank you for<br />your order.
          </h1>

          {orderNumber && (
            <p className="order-confirm__number">
              Order #{orderNumber}
            </p>
          )}

          <p className="order-confirm__body">
            You will receive a confirmation email shortly.<br />
            Your payment and order status are managed by Shopify.<br />
            For order details, check your email or contact us.
          </p>

          <div className="order-confirm__actions">
            <button
              className="order-confirm__cta"
              onClick={() => navigate('/')}
            >
              RETURN TO THE MULTIVERSE →
            </button>
          </div>

          <p className="order-confirm__note">
            If you have questions about your order, email us at{' '}
            <a href="mailto:hello@syora.in">hello@syora.in</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
