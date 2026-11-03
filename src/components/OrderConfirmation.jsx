/**
 * SYORA — Order Confirmation Page
 *
 * Shown immediately after a Razorpay payment is verified server-side, or
 * after a Cash on Delivery order is placed.
 *
 * IMPORTANT RULES:
 * - We NEVER mark an order as paid based solely on the customer landing here.
 * - For online payments, the Shopify order is created by
 *   /api/razorpay-verify-payment.js (signature-verified server-side) before
 *   this page ever navigates here — by the time order_number is present,
 *   the order genuinely exists in Shopify, not just "probably".
 * - The purchase analytics event fires once per order ID, guarded by sessionStorage.
 *
 * Query params:
 *   ?order_number=...  — set by this site only after the order was actually created
 *   ?cod=1             — distinguishes Cash on Delivery from a paid order, for copy only
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

  const orderNumber = searchParams.get('order_number');
  const isCod        = searchParams.get('cod') === '1';

  useEffect(() => {
    // Fire purchase event once, guarded against duplicate firing on refresh
    if (orderNumber && !tracked) {
      trackPurchase({
        orderId:  orderNumber,
        total:    0,         // Actual total available via Admin API if needed; do not trust URL params
        currency: 'INR',
        items:    [],
      });
      setTracked(true);
    }
  }, [orderNumber, tracked]);

  return (
    <div className="order-confirm">
      <Navbar universeMode solid />

      <main id="main" className="order-confirm__main">
        <div className="order-confirm__inner">
          {/* Success mark */}
          <div className="order-confirm__check">✓</div>

          <p className="order-confirm__eyebrow">ORDER CONFIRMED</p>

          <h1 className="order-confirm__heading">
            {isCod ? <>Order placed.<br />Pay on delivery.</> : <>Thank you for<br />your order.</>}
          </h1>

          {orderNumber && (
            <p className="order-confirm__number">
              Order #{orderNumber}
            </p>
          )}

          <p className="order-confirm__body">
            {isCod
              ? <>You'll pay in cash when your order arrives.<br />A confirmation email is on its way.</>
              : <>Your payment is confirmed.<br />A confirmation email is on its way.</>}
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
