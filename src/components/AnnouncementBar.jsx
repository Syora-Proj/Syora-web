import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './AnnouncementBar.css';

/*
 * SYORA announcement bar — one short message at a time, rotating.
 *
 * Only claims that the storefront and checkout actually honour are `live`.
 *  - Free delivery above ₹999 / flat ₹99 below  -> api/_lib/shopify.js (shippingFeeFor)
 *  - Exchanges within 48 hours, exchanges only  -> /info/exchanges
 *  - Online payment or Cash on Delivery         -> checkout payment step
 * The 5%-prepaid and Buy-2 offers are written but switched off (`live: false`):
 * checkout does not currently apply either discount, so advertising them would
 * promise something the cart cannot deliver. Flip `live` to true once the
 * discount exists in Shopify/checkout, and state the real combine rule in the copy.
 * "Handcrafted in India" is deliberately not used: it is a brand claim that is
 * not verified for every product, and belongs on the story page, not here.
 */
const MESSAGES = [
  { id: 'delivery', live: true, icon: 'truck', to: '/info/shipping-delivery', lead: 'Free delivery', rest: 'on orders above ₹999' },
  { id: 'exchange', live: true, icon: 'exchange', to: '/info/exchanges', lead: 'Easy exchanges', rest: 'within 48 hours of delivery' },
  { id: 'payment', live: true, icon: 'wallet', to: '/info/payments', lead: 'Pay online', rest: 'or Cash on Delivery' },
  { id: 'prepaid', live: false, icon: 'spark', to: '/info/payments', lead: '5% off', rest: 'on prepaid orders' },
  { id: 'bundle', live: false, icon: 'pair', to: '/shop', lead: 'Buy 2', rest: 'get 10% off' },
];

const ICONS = {
  truck: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7.5" cy="17.5" r="1.7" /><circle cx="17.5" cy="17.5" r="1.7" /></>,
  exchange: <><path d="M4 9a8 8 0 0 1 14-3l2 2" /><path d="M20 4v4h-4" /><path d="M20 15a8 8 0 0 1-14 3l-2-2" /><path d="M4 20v-4h4" /></>,
  wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5z" /><path d="M19 9.5h-4a2 2 0 0 0 0 4h4" /></>,
  spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6 6 2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></>,
  pair: <><path d="M5 17c2-1 3-4 3-8l3 1c0 3 1 6 3 7" /><path d="M13 17c2-1 3-4 3-8l3 1c0 3 1 6 3 7" opacity="0.6" /></>,
};

const SLIDES = MESSAGES.filter((m) => m.live);
const INTERVAL_MS = 5200;

function Icon({ name }) {
  return (
    <svg className="ann__icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [shown, setShown] = useState(false);
  const count = SLIDES.length;
  const rootRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Hidden on first paint so the opening screen stays clean; slides in after the
  // first scroll and tucks away again when the visitor is back at the very top.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setShown((prev) => (prev ? y > 8 : y > 40));
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, []);

  // Lets the pinned navbar (App.css) sit just beneath the bar while it is showing.
  useEffect(() => {
    document.documentElement.classList.toggle('ann-on', shown);
    return () => document.documentElement.classList.remove('ann-on');
  }, [shown]);

  const rotating = count > 1 && shown && !paused && !reduced && !hidden;
  useEffect(() => {
    if (!rotating) return undefined;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [rotating, index, count]);

  const go = useCallback((dir) => setIndex((i) => (i + dir + count) % count), [count]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };

  return (
    <section
      ref={rootRef}
      className={`ann${shown ? ' is-shown' : ''}`}
      aria-hidden={shown ? undefined : true}
      inert={shown ? undefined : true}
      aria-roledescription="carousel"
      aria-label="Store announcements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!rootRef.current?.contains(e.relatedTarget)) setPaused(false); }}
      onKeyDown={onKeyDown}
    >
      {count > 1 && (
        <button type="button" className="ann__nav ann__nav--prev" onClick={() => go(-1)} aria-label="Previous announcement">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
        </button>
      )}

      <div className="ann__viewport" aria-live={rotating ? 'off' : 'polite'}>
        {SLIDES.map((m, i) => (
          <div
            key={m.id}
            className={`ann__slide${i === index ? ' is-active' : i < index ? ' is-before' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i === index ? undefined : true}
          >
            <Link to={m.to} className="ann__msg" tabIndex={i === index ? 0 : -1}>
              <Icon name={m.icon} />
              <span className="ann__text"><strong>{m.lead}</strong> <span>{m.rest}</span></span>
            </Link>
          </div>
        ))}
      </div>

      {count > 1 && (
        <button type="button" className="ann__nav ann__nav--next" onClick={() => go(1)} aria-label="Next announcement">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
        </button>
      )}
    </section>
  );
}
