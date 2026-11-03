/**
 * SYORA — Checkout (/checkout)
 *
 * Collects shipping details, then hands off payment to one of two places:
 *   - "Pay online"        → Cashfree's hosted checkout (card/UPI/netbanking)
 *   - "Cash on Delivery"  → order is created immediately, unpaid
 *
 * No card, UPI, or payment details are ever collected on this page or by
 * this site's own code — Cashfree's hosted page handles that entirely.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loadCashfreeSdk() {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve(window.Cashfree);
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error('Could not load the payment SDK. Check your connection and try again.'));
    document.head.appendChild(script);
  });
}

export default function Checkout() {
  const { cart, cartLoading } = useCart();
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
  const shippingFee = subtotal > 0 && subtotal < 999 ? 99 : 0;
  const total = subtotal + shippingFee;

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

      const res = await fetch('/api/cashfree-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start payment.');

      const Cashfree = await loadCashfreeSdk();
      // Only production Cashfree credentials exist for this account — see CASHFREE_ENV server-side.
      const cashfree = Cashfree({ mode: 'production' });
      cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: '_self' });
      // Browser navigates away to Cashfree's hosted page here.
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const empty = !cartLoading && lines.length === 0;
  const { palette } = UNIVERSES.icon;

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
            <p className="ckt__eyebrow">CHECKOUT</p>
            <h1 className="ckt__title">Delivery &amp; payment</h1>
          </header>

          {empty ? (
            <div className="ckt__empty">
              <p>Your bag is empty.</p>
              <button type="button" className="ckt__empty-cta" onClick={() => navigate('/shop')}>Shop all products</button>
            </div>
          ) : (
            <div className="ckt__layout">
              <form className="ckt__form" onSubmit={handleSubmit} noValidate>
                <section className="ckt__section">
                  <h2>Contact</h2>
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
                  <h2>Shipping address</h2>
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
                  <h2>Payment</h2>
                  <div className="ckt__pay-options" role="radiogroup" aria-label="Payment method">
                    <label className={`ckt__pay-opt${method === 'online' ? ' ckt__pay-opt--active' : ''}`}>
                      <input type="radio" name="method" value="online" checked={method === 'online'} onChange={() => setMethod('online')} />
                      <span className="ckt__pay-opt-title">Pay online</span>
                      <span className="ckt__pay-opt-sub">Cards, UPI, netbanking &amp; wallets via Cashfree</span>
                    </label>
                    <label className={`ckt__pay-opt${method === 'cod' ? ' ckt__pay-opt--active' : ''}`}>
                      <input type="radio" name="method" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} />
                      <span className="ckt__pay-opt-title">Cash on Delivery</span>
                      <span className="ckt__pay-opt-sub">Pay in cash when your order arrives*</span>
                    </label>
                  </div>
                  <p className="ckt__fine">*Where your PIN code and courier are serviceable. Card and UPI details are entered only on Cashfree's secure payment page — never on this site.</p>
                </section>

                {submitError && <div className="ckt__submit-error" role="alert">{submitError}</div>}

                <button type="submit" className="ckt__submit" disabled={submitting}>
                  {submitting ? 'Please wait…' : method === 'cod' ? 'Place order' : `Pay ${formatMoney({ amount: total, currencyCode: 'INR' })}`}
                </button>
              </form>

              <aside className="ckt__summary" aria-label="Order summary">
                <h2>Order summary</h2>
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
                <dl className="ckt__totals">
                  <div><dt>Subtotal</dt><dd>{formatMoney({ amount: subtotal, currencyCode: 'INR' })}</dd></div>
                  <div><dt>Delivery</dt><dd>{shippingFee === 0 ? 'Free' : formatMoney({ amount: shippingFee, currencyCode: 'INR' })}</dd></div>
                  <div className="ckt__totals-grand"><dt>Total</dt><dd>{formatMoney({ amount: total, currencyCode: 'INR' })}</dd></div>
                </dl>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
