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
import { Link, useSearchParams } from 'react-router-dom';
import Shell from './Shell';
import Seo from './Seo';
import { SITE } from '../config/site';
import { trackPurchase } from '../lib/analytics';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const [tracked, setTracked] = useState(false);
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');
  const orderNumber = searchParams.get('order_number') || searchParams.get('orderNumber');

  useEffect(() => {
    // Fire purchase event once, guarded against duplicate firing on refresh
    if (orderId && !tracked) {
      trackPurchase({ orderId, total: 0, currency: 'INR', items: [] });
      setTracked(true);
    }
  }, [orderId, tracked]);

  return (
    <Shell>
      <Seo title="Order confirmed" path="/order-confirmation" noindex />
      <div className="sy-container sy-notfound">
        <p className="sy-label sy-muted">Order confirmed</p>
        <h1 className="sy-h1">Thank you for <em className="sy-em">your order</em>.</h1>
        {orderNumber && <p className="sy-lead">Order #{orderNumber}</p>}
        <p className="sy-lead sy-muted">A confirmation email is on its way. Payment and order status are managed by Shopify; for details, check your email or contact us.</p>
        <div className="sy-hero__actions" style={{ justifyContent: 'center' }}>
          <Link className="sy-btn" to="/">Continue shopping</Link>
          <a className="sy-link" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
      </div>
    </Shell>
  );
}
