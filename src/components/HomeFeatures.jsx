import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomeFeatures.css';

/**
 * SYORA — homepage feature sections
 *
 *  1. "Comfort Engineered" — warm ivory, an exploded view of the insole layers.
 *  2. "Crafted in Detail"  — deep oxblood, four close-ups of a pair.
 *
 * Both sit between "Find Your Style" and "Our Journey". Each fades in from the
 * section above and out into the one below, so the page reads as one continuous scroll.
 * Copy is live text over the artwork (crisp, selectable, translatable); the artwork
 * itself is the supplied imagery with its baked-in text removed.
 */

/* Where each call-to-action leads: change here if a dedicated page is added. */
const COMFORT_CTA_PATH = '/universe/everyday';
const DETAILS_CTA_PATH = '/universe/icon';

const ICONS = {
  layers: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M24 6 42 14 24 22 6 14Z" /><path d="M6 21 24 29 42 21" /><path d="M6 28 24 36 42 28" />
    </svg>
  ),
  arch: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M7 38C7 20 14 10 24 10s17 10 17 28" /><path d="M14 38c0-12 4-19 10-19s10 7 10 19" />
    </svg>
  ),
  air: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 14h26l5-4" /><path d="M6 24h36" /><path d="M6 34h26l5 4" /><path d="M33 8l4 2-2 4" /><path d="M33 40l4-2-2-4" />
    </svg>
  ),
  shock: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 26h8l4-11 7 21 6-16 3 6h10" />
    </svg>
  ),
  hide: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M17 7l7 4 7-4 6 6 5 4-4 7 2 8-8 2-3 5-5-3-5 3-3-5-8-2 2-8-4-7 5-4Z" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 8C20 8 9 17 9 31c0 4 2 8 6 9 14 0 25-10 25-32Z" /><path d="M9 41C16 31 24 24 34 17" />
    </svg>
  ),
  infinity: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M24 24c-4-6-8-9-12-9a9 9 0 0 0 0 18c4 0 8-3 12-9Zm0 0c4 6 8 9 12 9a9 9 0 0 0 0-18c-4 0-8 3-12 9Z" />
    </svg>
  ),
};

/** Adds `is-in` once the section scrolls into view (and straight away for reduced motion). */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      el.classList.add('is-in');
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('is-in'); io.disconnect(); }
    }, { threshold: 0.18 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/**
 * Scroll-linked fade-in for a section's copy: --c runs 0 → 1 as the copy block rises into the
 * screen, and each line reads it with its own stagger (see .cx__copy > * in the stylesheet).
 * It only ever increases while scrolling down (and reverses on the way back up) — there is
 * no timer, so the text can never be left blank waiting for a trigger. Without script, or with
 * reduced motion, it stays at 1 (fully visible).
 */
function useCopyReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return undefined;
    let raf = 0;
    let listening = false;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 800;
      const c = Math.min(1, Math.max(0, (vh * 0.98 - el.getBoundingClientRect().top) / (vh * 0.5)));
      el.style.setProperty('--c', c.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const listen = (on) => {
      if (on === listening) return;
      listening = on;
      const fn = on ? 'addEventListener' : 'removeEventListener';
      window[fn]('scroll', onScroll, { passive: true });
      window[fn]('resize', onScroll, { passive: true });
      if (on) update();
    };
    const io = new IntersectionObserver(([entry]) => listen(entry.isIntersecting), { rootMargin: '0px 0px 40px 0px' });
    io.observe(el);
    update();
    return () => { io.disconnect(); listen(false); if (raf) cancelAnimationFrame(raf); el.style.removeProperty('--c'); };
  }, []);
  return ref;
}

function Features({ items }) {
  return (
    <ul className="cx__features">
      {items.map(([icon, label]) => (
        <li key={label} className="cx__feature">
          <span className="cx__feature-icon" aria-hidden="true">{ICONS[icon]}</span>
          <span className="cx__feature-label">{label}</span>
        </li>
      ))}
    </ul>
  );
}

/* Comfort artwork: four layers (back → front) that stack together and then open out as you scroll.
   Positions/sizes are in % of the 1774 × 887 artwork, so the animation scales with the stage.
   `o` = how far (in % of the artwork height) the layer sits toward the stack while collapsed. */
const W = 1774;
const H = 887;
const LAYERS = [
  { id: 'brown', x: 802, y: 519, w: 679, h: 297, o: 0, ox: 0 },
  { id: 'burgundy', x: 800, y: 384, w: 683, h: 332, o: 5, ox: -2 },
  { id: 'cream', x: 803, y: 233, w: 682, h: 382, o: 11, ox: 2 },
  { id: 'tan', x: 792, y: 32, w: 683, h: 460, o: 18, ox: -3.5 },
];
const TAGS = [
  { lines: ['Soft, Breathable', 'Lining'], y: 16.7, o: 18, ox: -3.5 },
  { lines: ['Cushioned', 'Footbed'], y: 33.8, o: 11, ox: 2 },
  { lines: ['Supportive', 'Midsole'], y: 49.8, o: 5, ox: -2 },
  { lines: ['Durable', 'Outsole'], y: 65.6, o: 0, ox: 0 },
];
const pct = (n, of) => `${((n / of) * 100).toFixed(3)}%`;
const ANIM_SRC = ['/home-features/comfort-plate.webp', ...LAYERS.map((l) => `/home-features/comfort-${l.id}.webp`)];

/**
 * Scroll-linked assembly of the insole layers.
 *  · Nothing extra is downloaded until the artwork is within ~1.2 screens of the viewport
 *    (and then only when the browser is idle), and never with reduced-motion or Data Saver on.
 *  · If the layers aren't ready before the artwork is on screen (or any request fails),
 *    the static artwork simply stays — the page never waits on, or breaks without, the animation.
 *  · While animating, one CSS variable (--p) is updated per frame; the layers only use
 *    transform/opacity, so the work stays on the compositor.
 */
function useInsoleScroll(artRef, stageRef) {
  const [animated, setAnimated] = useState(false);

  // 1) preload the layers just before the section arrives
  useEffect(() => {
    const art = artRef.current;
    if (!art || !('IntersectionObserver' in window)) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (navigator.connection && navigator.connection.saveData) return undefined;
    let cancelled = false;
    const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 120));
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      idle(() => Promise.all(ANIM_SRC.map((src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      }))).then(() => {
        if (!cancelled) setAnimated(true);
      }).catch(() => {}));
    }, { rootMargin: `${Math.round((window.innerHeight || 800) * 1.2)}px 0px` });
    io.observe(art);
    return () => { cancelled = true; io.disconnect(); };
  }, [artRef]);

  // 2) drive --p from the scroll position, only while the artwork is visible
  useEffect(() => {
    if (!animated) return undefined;
    const art = artRef.current;
    const stage = stageRef.current;
    if (!art || !stage) return undefined;
    let raf = 0;
    let listening = false;
    const update = () => {
      raf = 0;
      const r = art.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // 0 as the artwork's top edge enters the screen → 1 once it sits comfortably in view
      const p = Math.min(1, Math.max(0, (vh - r.top) / (0.78 * vh + 0.2 * r.height)));
      stage.style.setProperty('--p', (p * p * (3 - 2 * p)).toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const listen = (on) => {
      if (on === listening) return;
      listening = on;
      const fn = on ? 'addEventListener' : 'removeEventListener';
      window[fn]('scroll', onScroll, { passive: true });
      window[fn]('resize', onScroll, { passive: true });
      if (on) update();
    };
    const io = new IntersectionObserver(([entry]) => listen(entry.isIntersecting), { rootMargin: '80px 0px' });
    io.observe(art);
    update();
    return () => {
      io.disconnect();
      listen(false);
      if (raf) cancelAnimationFrame(raf);
      stage.style.removeProperty('--p');
    };
  }, [animated, artRef, stageRef]);

  return animated;
}

export function ComfortSection() {
  const ref = useReveal();
  const artRef = useRef(null);
  const stageRef = useRef(null);
  const animated = useInsoleScroll(artRef, stageRef);
  const copyRef = useCopyReveal();

  return (
    <section ref={ref} className="cx cx--comfort" aria-labelledby="cx-comfort-title">
      <div className="cx__inner">
        <div className="cx__art" ref={artRef}>
          <div className={`cx__stage${animated ? ' is-animated' : ''}`} ref={stageRef}>
            {animated && (
              <>
                <img className="cx__plate" src="/home-features/comfort-plate.webp" width={W} height={H} alt="" aria-hidden="true" decoding="async" />
                {LAYERS.map((l, i) => (
                  <div key={l.id} className="cx__layer" style={{ '--o': `${l.o}%`, '--ox': `${l.ox}%`, zIndex: i + 1 }}>
                    <img
                      className="cx__sprite"
                      src={`/home-features/comfort-${l.id}.webp`}
                      alt=""
                      aria-hidden="true"
                      decoding="async"
                      style={{ left: pct(l.x, W), top: pct(l.y, H), width: pct(l.w, W), height: pct(l.h, H) }}
                    />
                  </div>
                ))}
              </>
            )}
            {/* the complete artwork: the whole picture before/without animation, and the settled state after */}
            <img
              className="cx__img cx__img--final"
              src="/home-features/comfort.webp"
              width={W}
              height={H}
              alt="Exploded view of four stacked insole layers: lining, footbed, midsole and outsole"
              loading="lazy"
              decoding="async"
            />
            {TAGS.map((t) => (
              <div key={t.lines[0]} className="cx__tagwrap" style={{ '--o': `${t.o}%`, '--ox': `${t.ox}%` }}>
                <div className="cx__tag" style={{ '--y': `${t.y}%` }}>
                  <span className="cx__tag-dot cx__tag-dot--a" aria-hidden="true" />
                  <span className="cx__tag-line" aria-hidden="true" />
                  <span className="cx__tag-dot cx__tag-dot--b" aria-hidden="true" />
                  <span className="cx__label">{t.lines[0]}<br />{t.lines[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <span className="cx__fade cx__fade--top" aria-hidden="true" />
        <span className="cx__fade cx__fade--bottom" aria-hidden="true" />

        <div className="cx__copy" ref={copyRef}>
          <p className="cx__eyebrow">Comfort Engineered</p>
          <h2 id="cx-comfort-title" className="cx__title">Style Without<br />Compromise</h2>
          <p className="cx__lede">Designed to look elegant and feel effortless, all day long.</p>
          <Features items={[['layers', 'Cushioned Insole'], ['arch', 'Arch Support'], ['air', 'Breathable Lining'], ['shock', 'Shock Absorption']]} />
          <Link to={COMFORT_CTA_PATH} className="cx__cta">
            <span>Explore the Comfort</span><span className="cx__cta-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function DetailsSection() {
  const ref = useReveal();
  const copyRef = useCopyReveal();
  return (
    <section ref={ref} className="cx cx--details" aria-labelledby="cx-details-title">
      <div className="cx__inner">
        <div className="cx__art">
          <div className="cx__stage">
            <img
              className="cx__img"
              src="/home-features/details.webp"
              width="1774"
              height="887"
              alt="Close-ups of a burgundy patent pump: the pointed toe, the heel, the lining and the sole"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <span className="cx__fade cx__fade--top" aria-hidden="true" />
        <span className="cx__fade cx__fade--bottom" aria-hidden="true" />

        <div className="cx__copy" ref={copyRef}>
          <p className="cx__eyebrow">Crafted in Detail</p>
          <h2 id="cx-details-title" className="cx__title">The Details<br />Make the Difference</h2>
          <p className="cx__lede">Refined materials, considered construction and a comfort-first fit — in every pair.</p>
          <Features items={[['hide', 'Premium Materials'], ['leaf', 'Lightweight Comfort'], ['layers', 'Cushioned Support'], ['infinity', 'Built for Everyday']]} />
          <Link to={DETAILS_CTA_PATH} className="cx__cta">
            <span>Explore Craftsmanship</span><span className="cx__cta-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
