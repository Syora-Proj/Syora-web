/**
 * SYORA — Order Confirmation Page
 *
 * Shown when a customer returns from Cashfree's hosted checkout, or
 * immediately after placing a Cash on Delivery order.
 *
 * IMPORTANT RULES:
 * - We NEVER mark an order as paid based solely on the customer landing here.
 * - For online payments, the Shopify order is created by the Cashfree
 *   webhook (/api/cashfree-webhook.js), not by this page — Cashfree +
 *   Shopify are the source of truth, not the URL the browser lands on.
 * - The purchase analytics event fires once per order ID, guarded by sessionStorage.
 *
 * Query params:
 *   ?cf_order_id=...   — set on Cashfree's return_url (online payment just attempted)
 *   ?order_number=...  — set by this site after a Cash on Delivery order is placed
 * Neither is trusted to confirm payment status — informational only.
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

  // Read order data from the return URL (Cashfree return_url or our own COD redirect)
  const cfOrderId   = searchParams.get('cf_order_id');
  const orderNumber = searchParams.get('order_number');
  const isCod        = searchParams.get('cod') === '1';
  const orderId      = cfOrderId || orderNumber;

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
              : <>If your payment went through, you'll receive a confirmation email shortly.<br />Having trouble? Check your email or contact us before trying again.</>}
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
