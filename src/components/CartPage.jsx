import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/shopify/products';
import { getBestSellers } from '../lib/shopify/catalog';
import { useAsyncData } from '../hooks/useAsyncData';
import { trackBeginCheckout, trackViewCart } from '../lib/analytics';
import { UNIVERSES } from '../data/universes';
import { ProductCard } from './ProductGrid';
import Navbar from './Navbar';
import Footer from './Footer';
import './CartPage.css';

const hasStoredCart = () => {
  try { return !!window.localStorage.getItem('syora_cart_id'); } catch { return false; }
};

/**
 * SYORA — your bag (/cart)
 * The full-page view of the bag: items with quantity and remove, an order summary and a clear
 * route to Shopify's secure checkout (where card / UPI details are entered — never on this site).
 */
export default function CartPage() {
  const { cart, cartLoading, cartError, updateCartLine, removeFromCart, goToCheckout } = useCart();
  const lines = cart?.lines || [];
  const { palette } = UNIVERSES.icon;

  // The stored cart loads asynchronously: don't flash "empty" while it is still on its way.
  const [waited, setWaited] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setWaited(true), 2500); return () => window.clearTimeout(t); }, []);
  const loadingCart = !cart && hasStoredCart() && !waited && !cartError;

  useEffect(() => { if (cart && cart.lines?.length) trackViewCart(cart); }, [cart?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const suggested = useAsyncData(() => getBestSellers(4), [], true);
  const inBag = new Set(lines.map((l) => l.variant?.product?.handle));
  const picks = (suggested.data || []).filter((p) => !inBag.has(p.handle)).slice(0, 4);

  const count = cart?.totalQuantity || 0;

  return (
    <div
      className="universe-page"
      style={{ '--u-bg': palette.bg, '--u-accent': palette.accent, '--u-text': palette.text, '--u-muted': palette.muted, '--u-border': palette.border }}
    >
      <title>Your Bag — SYORA</title>
      <meta name="robots" content="noindex" />
      <Navbar universeMode solid />

      <main className="cp">
        <div className="cp__inner">
          <header className="cp__head">
            <p className="cp__eyebrow">YOUR BAG</p>
            <h1 className="cp__title">{count > 0 ? <>Your Bag <span>({count})</span></> : 'Your Bag'}</h1>
          </header>

          {cartError && <div className="cp__error" role="alert">{cartError}</div>}

          {loadingCart ? (
            <div className="u-products-loading" role="status" aria-label="Loading your bag"><div className="u-loading-spinner" /></div>
          ) : lines.length === 0 ? (
            <div className="cp__empty">
              <p className="cp__empty-title">Your bag is empty.</p>
              <p className="cp__empty-sub">Find a pair you love and it will wait for you here.</p>
              <div className="cp__empty-actions">
                <Link to="/shop" className="cp__btn">Shop all products</Link>
                {['icon', 'heritage', 'everyday', 'motion'].map((id) => (
                  <Link key={id} to={`/universe/${id}`} className="cp__chip">{UNIVERSES[id].name}</Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="cp__layout">
              <ul className="cp__lines" aria-label="Items in your bag">
                {lines.map((line) => {
                  const product = line.variant?.product;
                  const opts = (line.variant?.selectedOptions || []).filter((o) => o.name.toLowerCase() !== 'title');
                  const href = product?.handle ? `/product/${encodeURIComponent(product.handle)}` : '/shop';
                  const name = String(product?.title || '').replace(/^syora\s+/i, '') || product?.title;
                  return (
                    <li key={line.id} className="cp__line">
                      <Link to={href} className="cp__img" aria-hidden="true" tabIndex={-1}>
                        {product?.image?.url ? <img src={product.image.url} alt="" loading="lazy" /> : <span />}
                      </Link>
                      <div className="cp__info">
                        <h2 className="cp__name"><Link to={href}>{name}</Link></h2>
                        {opts.length > 0 && <p className="cp__opts">{opts.map((o) => `${o.name}: ${o.value}`).join(' · ')}</p>}
                        <p className="cp__unit">{formatMoney(line.variant?.price)}</p>
                        <div className="cp__controls">
                          <div className="cp__qty" role="group" aria-label={`Quantity for ${name}`}>
                            <button type="button" disabled={cartLoading || line.quantity <= 1} onClick={() => updateCartLine(line.id, line.quantity - 1)} aria-label="Decrease quantity">−</button>
                            <span aria-live="polite">{line.quantity}</span>
                            <button type="button" disabled={cartLoading} onClick={() => updateCartLine(line.id, line.quantity + 1)} aria-label="Increase quantity">+</button>
                          </div>
                          <button type="button" className="cp__remove" disabled={cartLoading} onClick={() => removeFromCart(line.id)} aria-label={`Remove ${name} from bag`}>Remove</button>
                        </div>
                      </div>
                      <p className="cp__total">{formatMoney(line.total)}</p>
                    </li>
                  );
                })}
              </ul>

              <aside className="cp__summary" aria-label="Order summary">
                <h2 className="cp__sum-title">Order summary</h2>
                <dl className="cp__sum">
                  <div><dt>Subtotal</dt><dd>{formatMoney(cart?.subtotal)}</dd></div>
                  <div><dt>Delivery</dt><dd>Calculated at checkout</dd></div>
                  <div className="cp__sum-total"><dt>Total</dt><dd>{formatMoney(cart?.total || cart?.subtotal)}</dd></div>
                </dl>
                <p className="cp__tax">Inclusive of applicable taxes. Final delivery charges are shown before you pay.</p>
                <button type="button" className="cp__checkout" disabled={cartLoading} onClick={() => { trackBeginCheckout(cart); goToCheckout(); }}>
                  {cartLoading ? 'Updating…' : 'Secure checkout'} <span aria-hidden="true">→</span>
                </button>
                <ul className="cp__pay" aria-label="Payment options">
                  <li>Cards</li><li>UPI</li><li>Cash on Delivery*</li>
                </ul>
                <p className="cp__fine">*Where your PIN code and courier are serviceable. You'll enter payment details on our secure checkout, not on this page.</p>
                <ul className="cp__assure">
                  <li><strong>3–7 days delivery</strong><span>Across India</span></li>
                  <li><strong>Easy exchanges</strong><span>Within 48 hours · <Link to="/info/exchanges">how it works</Link></span></li>
                  <li><strong>Secure payments</strong><span><Link to="/info/payments">Payment options</Link></span></li>
                </ul>
                <Link to="/shop" className="cp__continue">← Continue shopping</Link>
              </aside>
            </div>
          )}

          {picks.length > 0 && (
            <section className="cp__more product-grid" aria-labelledby="cp-more-title">
              <h2 id="cp-more-title" className="cp__more-title">You may also love</h2>
              <div className="product-grid__cards">
                {picks.map((p) => (<ProductCard key={p.id} product={{ ...p, imgHover: p.imgSecond || p.imgHover }} />))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
