/**
 * SYORA — Checkout (/checkout)
 *
 * Collects shipping details, then hands off payment to one of two places:
 *   - "Pay online"        → Razorpay Checkout modal (card/UPI/netbanking)
 *   - "Cash on Delivery"  → order is created immediately, unpaid
 *
 * No card, UPI, or payment details are ever collected on this page or by
 * this site's own code — Razorpay's modal handles that entirely. After a
 * successful payment, Razorpay's handler callback returns a signed receipt
 * (order id, payment id, signature) which is verified server-side in
 * /api/razorpay-verify-payment.js before any order is created — the browser
 * reporting "success" is never trusted on its own.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/shopify/products';
import { trackBeginCheckout } from '../lib/analytics';
import { UNIVERSES } from '../data/universes';
import Navbar from './Navbar';
import Footer from './Footer';
import './Checkout.css';

const INDIAN_STATES = [
  ['AN', 'Andaman and Nicobar Islands'], ['AP', 'Andhra Pradesh'], ['AR', 'Arunachal Pradesh'],
  ['AS', 'Assam'], ['BR', 'Bihar'], ['CH', 'Chandigarh'], ['CT', 'Chhattisgarh'],
  ['DN', 'Dadra and Nagar Haveli and Daman and Diu'], ['DL', 'Delhi'], ['GA', 'Goa'],
  ['GJ', 'Gujarat'], ['HR', 'Haryana'], ['HP', 'Himachal Pradesh'], ['JK', 'Jammu and Kashmir'],
  ['JH', 'Jharkhand'], ['KA', 'Karnataka'], ['KL', 'Kerala'], ['LA', 'Ladakh'],
  ['LD', 'Lakshadweep'], ['MP', 'Madhya Pradesh'], ['MH', 'Maharashtra'], ['MN', 'Manipur'],
  ['ML', 'Meghalaya'], ['MZ', 'Mizoram'], ['NL', 'Nagaland'], ['OR', 'Odisha'],
  ['PY', 'Puducherry'], ['PB', 'Punjab'], ['RJ', 'Rajasthan'], ['SK', 'Sikkim'],
  ['TN', 'Tamil Nadu'], ['TG', 'Telangana'], ['TR', 'Tripura'], ['UP', 'Uttar Pradesh'],
  ['UT', 'Uttarakhand'], ['WB', 'West Bengal'],
];

// Must match api/_lib/shopify.js shippingFeeFor(): free from 999, flat 99 below.
const FREE_DELIVERY_MIN = 999;
const FLAT_DELIVERY_FEE = 99;

const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loadRazorpaySdk() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Could not load the payment SDK. Check your connection and try again.'));
    document.head.appendChild(script);
  });
}

export default function Checkout() {
  const { cart, cartLoading, applyDiscountCode, removeDiscountCode } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address1: '', address2: '', city: '', provinceCode: '', zip: '',
  });
  const [method, setMethod] = useState('online'); // 'online' | 'cod'
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const lines = cart?.lines || [];
  const subtotal = parseFloat(cart?.subtotal?.amount || 0);
  // cart.total is Shopify's own figure after any coupon.
  const cartTotal = parseFloat(cart?.total?.amount ?? cart?.subtotal?.amount ?? 0);
  const discount = Math.max(0, Math.round((subtotal - cartTotal) * 100) / 100);
  const shippingFee = subtotal > 0 && subtotal < FREE_DELIVERY_MIN ? FLAT_DELIVERY_FEE : 0;
  const total = cartTotal + shippingFee;
  const appliedCode = (cart?.discountCodes || []).find((d) => d.applicable)?.code || null;
  const toFree = Math.max(0, FREE_DELIVERY_MIN - subtotal);
  const freePct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_MIN) * 100));
  const money = (amount) => formatMoney({ amount, currencyCode: 'INR' });

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);

  async function handleApplyCoupon(ev) {
    ev.preventDefault();
    const code = couponInput.trim();
    if (!code || couponBusy) return;
    setCouponBusy(true);
    setCouponMsg(null);
    const next = await applyDiscountCode(code);
    if (!next) {
      setCouponMsg({ ok: false, text: 'We could not check that code. Please try again.' });
    } else {
      const hit = (next.discountCodes || []).find((d) => d.code.toLowerCase() === code.toLowerCase());
      if (hit?.applicable) {
        setCouponMsg({ ok: true, text: `${hit.code} applied` });
        setCouponInput('');
      } else {
        await removeDiscountCode(); // don't leave a dead code on the bag
        setCouponMsg({ ok: false, text: "That code isn't valid for this bag." });
      }
    }
    setCouponBusy(false);
  }

  async function handleRemoveCoupon() {
    setCouponMsg(null);
    await removeDiscountCode();
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email';
    if (!PHONE_RE.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (!form.address1.trim()) e.address1 = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.provinceCode) e.provinceCode = 'Required';
    if (!PINCODE_RE.test(form.zip)) e.zip = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!cart?.id || lines.length === 0) return;
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    trackBeginCheckout(cart);

    const payload = {
      cartId: cart.id,
      customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
      shipping: {
        address1: form.address1.trim(),
        address2: form.address2.trim(),
        city: form.city.trim(),
        provinceCode: form.provinceCode,
        zip: form.zip.trim(),
      },
    };

    try {
      if (method === 'cod') {
        const res = await fetch('/api/create-cod-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not place your order.');
        navigate(`/order-confirmation?order_number=${encodeURIComponent(data.orderName)}&cod=1`);
        return;
      }

      const res = await fetch('/api/razorpay-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start payment.');

      const Razorpay = await loadRazorpaySdk();
      const rzp = new Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        order_id: data.orderId,
        name: 'SYORA',
        description: 'Order payment',
        prefill: { name: data.customer.name, email: data.customer.email, contact: data.customer.phone },
        theme: { color: '#5a0f1c' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/razorpay-verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Could not verify your payment.');
            navigate(`/order-confirmation?order_number=${encodeURIComponent(verifyData.orderName)}`);
          } catch (err) {
            setSubmitError(err.message || 'Payment succeeded but something went wrong finalizing your order. Contact us with your payment ID.');
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      rzp.on('payment.failed', (response) => {
        setSubmitError(response.error?.description || 'Payment failed. Please try again.');
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const empty = !cartLoading && lines.length === 0;
  const { palette } = UNIVERSES.icon;

  // One summary body, rendered once in the sidebar (desktop) and once in a
  // collapsible panel above the form (mobile); `sfx` keeps element ids unique.
  const summaryBody = (sfx) => (
    <>
      <ul className="ckt__lines">
        {lines.map((line) => {
          const product = line.variant?.product;
          const opts = (line.variant?.selectedOptions || []).filter((o) => o.name.toLowerCase() !== 'title');
          const name = String(product?.title || '').replace(/^syora\s+/i, '') || product?.title;
          return (
            <li key={line.id} className="ckt__line">
              <div className="ckt__line-img">
                {product?.image?.url ? <img src={product.image.url} alt="" loading="lazy" /> : <span />}
                <span className="ckt__line-qty">{line.quantity}</span>
              </div>
              <div className="ckt__line-info">
                <p className="ckt__line-name">{name}</p>
                {opts.length > 0 && <p className="ckt__line-opts">{opts.map((o) => `${o.name}: ${o.value}`).join(' · ')}</p>}
              </div>
              <p className="ckt__line-total">{formatMoney(line.total)}</p>
            </li>
          );
        })}
      </ul>

      <div className="ckt__coupon">
        {appliedCode ? (
          <div className="ckt__coupon-applied">
            <span className="ckt__coupon-tag">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.2" /></svg>
              {appliedCode}
            </span>
            <button type="button" className="ckt__coupon-remove" onClick={handleRemoveCoupon} disabled={cartLoading} aria-label={`Remove code ${appliedCode}`}>Remove</button>
          </div>
        ) : (
          <form className="ckt__coupon-form" onSubmit={handleApplyCoupon}>
            <label htmlFor={`coupon-${sfx}`} className="ckt__sr">Discount code</label>
            <input id={`coupon-${sfx}`} value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Discount code" autoComplete="off" autoCapitalize="characters" spellCheck="false" />
            <button type="submit" disabled={!couponInput.trim() || couponBusy}>{couponBusy ? '…' : 'Apply'}</button>
          </form>
        )}
        {couponMsg && <p className={`ckt__coupon-msg${couponMsg.ok ? ' is-ok' : ' is-err'}`} role="status">{couponMsg.text}</p>}
      </div>

      <dl className="ckt__totals">
        <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
        {discount > 0 && (
          <div className="ckt__totals-save"><dt>Discount{appliedCode ? ` (${appliedCode})` : ''}</dt><dd>−{money(discount)}</dd></div>
        )}
        <div><dt>Delivery</dt><dd className={shippingFee === 0 ? 'ckt__free' : undefined}>{shippingFee === 0 ? 'Free' : money(shippingFee)}</dd></div>
        <div className="ckt__totals-grand"><dt>Total</dt><dd>{money(total)}</dd></div>
      </dl>
      {discount > 0 && <p className="ckt__saved">You're saving {money(discount)} on this order.</p>}

      {toFree > 0 ? (
        <div className="ckt__ship-meter">
          <p>Add <strong>{money(toFree)}</strong> more for free delivery</p>
          <div className="ckt__ship-bar" role="progressbar" aria-valuemin={0} aria-valuemax={FREE_DELIVERY_MIN} aria-valuenow={Math.round(subtotal)} aria-label="Progress to free delivery"><span style={{ width: `${freePct}%` }} /></div>
        </div>
      ) : (
        <p className="ckt__ship-ok">You've unlocked free delivery.</p>
      )}
    </>
  );

  return (
    <div
      className="universe-page ckt-page"
      style={{ '--u-bg': palette.bg, '--u-accent': palette.accent, '--u-text': palette.text, '--u-muted': palette.muted, '--u-border': palette.border }}
    >
      <title>Checkout — SYORA</title>
      <meta name="robots" content="noindex" />
      <Navbar universeMode solid />

      <main id="main" className="ckt">
        <div className="ckt__inner">
          <header className="ckt__head">
            <ol className="ckt__steps" aria-label="Checkout progress">
              <li><Link to="/cart">Bag</Link></li>
              <li aria-current="step" className="is-current">Delivery &amp; payment</li>
              <li>Confirmation</li>
            </ol>
            <h1 className="ckt__title">Checkout</h1>
          </header>

          {empty ? (
            <div className="ckt__empty">
              <p>Your bag is empty.</p>
              <button type="button" className="ckt__empty-cta" onClick={() => navigate('/shop')}>Shop all products</button>
            </div>
          ) : (
            <div className="ckt__layout">
              <details className="ckt__msum">
                <summary>
                  <span className="ckt__msum-label">Order summary</span>
                  <span className="ckt__msum-total">{money(total)}</span>
                </summary>
                <div className="ckt__msum-body">{summaryBody('m')}</div>
              </details>

              <form className="ckt__form" onSubmit={handleSubmit} noValidate>
                <section className="ckt__section">
                  <h2><span className="ckt__num">1</span>Contact</h2>
                  <div className="ckt__field">
                    <label htmlFor="name">Full name</label>
                    <input id="name" value={form.name} onChange={update('name')} autoComplete="name" />
                    {errors.name && <span className="ckt__err">{errors.name}</span>}
                  </div>
                  <div className="ckt__row">
                    <div className="ckt__field">
                      <label htmlFor="email">Email</label>
                      <input id="email" type="email" value={form.email} onChange={update('email')} autoComplete="email" />
                      {errors.email && <span className="ckt__err">{errors.email}</span>}
                    </div>
                    <div className="ckt__field">
                      <label htmlFor="phone">Mobile number</label>
                      <input id="phone" type="tel" inputMode="numeric" value={form.phone} onChange={update('phone')} autoComplete="tel" placeholder="10-digit mobile number" />
                      {errors.phone && <span className="ckt__err">{errors.phone}</span>}
                    </div>
                  </div>
                </section>

                <section className="ckt__section">
                  <h2><span className="ckt__num">2</span>Shipping address</h2>
                  <div className="ckt__field">
                    <label htmlFor="address1">Address</label>
                    <input id="address1" value={form.address1} onChange={update('address1')} autoComplete="address-line1" placeholder="House no., street, area" />
                    {errors.address1 && <span className="ckt__err">{errors.address1}</span>}
                  </div>
                  <div className="ckt__field">
                    <label htmlFor="address2">Apartment, suite, etc. (optional)</label>
                    <input id="address2" value={form.address2} onChange={update('address2')} autoComplete="address-line2" />
                  </div>
                  <div className="ckt__row ckt__row--3">
                    <div className="ckt__field">
                      <label htmlFor="city">City</label>
                      <input id="city" value={form.city} onChange={update('city')} autoComplete="address-level2" />
                      {errors.city && <span className="ckt__err">{errors.city}</span>}
                    </div>
                    <div className="ckt__field">
                      <label htmlFor="state">State</label>
                      <select id="state" value={form.provinceCode} onChange={update('provinceCode')} autoComplete="address-level1">
                        <option value="">Select</option>
                        {INDIAN_STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                      </select>
                      {errors.provinceCode && <span className="ckt__err">{errors.provinceCode}</span>}
                    </div>
                    <div className="ckt__field">
                      <label htmlFor="zip">PIN code</label>
                      <input id="zip" inputMode="numeric" value={form.zip} onChange={update('zip')} autoComplete="postal-code" />
                      {errors.zip && <span className="ckt__err">{errors.zip}</span>}
                    </div>
                  </div>
                </section>

                <section className="ckt__section">
                  <h2><span className="ckt__num">3</span>Delivery</h2>
                  <div className="ckt__ship-card">
                    <div>
                      <p className="ckt__ship-title">Standard delivery</p>
                      <p className="ckt__ship-sub">Arrives in 3–7 business days</p>
                    </div>
                    <p className={`ckt__ship-price${shippingFee === 0 ? ' ckt__free' : ''}`}>{shippingFee === 0 ? 'Free' : money(shippingFee)}</p>
                  </div>
                </section>

                <section className="ckt__section">
                  <h2><span className="ckt__num">4</span>Payment</h2>
                  <div className="ckt__pay-options" role="radiogroup" aria-label="Payment method">
                    <label className={`ckt__pay-opt${method === 'online' ? ' ckt__pay-opt--active' : ''}`}>
                      <input type="radio" name="method" value="online" checked={method === 'online'} onChange={() => setMethod('online')} />
                      <span className="ckt__pay-opt-title">Pay online</span>
                      <span className="ckt__pay-opt-sub">Cards, UPI, netbanking &amp; wallets via Razorpay</span>
                    </label>
                    <label className={`ckt__pay-opt${method === 'cod' ? ' ckt__pay-opt--active' : ''}`}>
                      <input type="radio" name="method" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} />
                      <span className="ckt__pay-opt-title">Cash on Delivery</span>
                      <span className="ckt__pay-opt-sub">Pay in cash when your order arrives*</span>
                    </label>
                  </div>
                  <p className="ckt__fine">*Where your PIN code and courier are serviceable. Card and UPI details are entered only in Razorpay's secure payment window — never on this site.</p>
                </section>

                {submitError && <div className="ckt__submit-error" role="alert">{submitError}</div>}

                <button type="submit" className="ckt__submit" disabled={submitting}>
                  {submitting ? 'Please wait…' : method === 'cod' ? `Place order · ${money(total)}` : `Pay ${money(total)}`}
                </button>

                <ul className="ckt__trust">
                  <li>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                    Secure payment
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9a8 8 0 0 1 14-3l2 2" /><path d="M20 4v4h-4" /><path d="M20 15a8 8 0 0 1-14 3l-2-2" /><path d="M4 20v-4h4" /></svg>
                    <Link to="/info/exchanges">Easy exchanges · 48 hours</Link>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7.5" cy="17.5" r="1.7" /><circle cx="17.5" cy="17.5" r="1.7" /></svg>
                    <Link to="/info/shipping-delivery">Delivery across India</Link>
                  </li>
                </ul>
              </form>

              <aside className="ckt__summary" aria-label="Order summary">
                <h2>Order summary</h2>
                {summaryBody('d')}
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
