import { useEffect, useRef, useState } from 'react';

/**
 * SYORA — homepage hero carousel (images only)
 *
 * The brand block (wordmark, tagline, button) stays fixed above these slides; only the
 * photographs slide. Advances every 3 s and loops forward (a clone of slide 1 follows the last slide).
 *
 *  · Auto-advance waits until every slide image has loaded, so a slide is never blank.
 *  · It pauses while the mouse is over the button or dots (so nothing moves as someone goes to click),
 *    while keyboard focus is inside the hero, while the tab is hidden, while the hero is scrolled
 *    off-screen, and for people who prefer reduced motion. A pause / play button stops it for good.
 *  · Dots (and swipe on touch screens) let people move on their own; doing so restarts the timer.
 */
export const HERO_SLIDES = [
  {
    id: 'crimson',
    desktop: '/hero-campaign.webp',
    mobile: '/hero-campaign-mobile.webp',
    width: 2300,
    height: 1312,
    alt: 'Woman in a deep red dress seated on studio steps, wearing burgundy patent heels',
    label: 'Burgundy heels',
  },
  {
    id: 'sand',
    desktop: '/hero-sand.webp',
    mobile: '/hero-sand-mobile.webp',
    width: 1774,
    height: 887,
    alt: 'Woman in a cream blazer dress sitting on sandstone steps, wearing black wedge ankle boots',
    label: 'Black wedge boots',
  },
  {
    id: 'meadow',
    desktop: '/hero-meadow.webp',
    mobile: '/hero-meadow-mobile.webp',
    width: 2306,
    height: 1214,
    alt: 'Woman in a cream embroidered lace dress seated on a green studio floor, wearing red-and-cream embroidered flats, beside a brass vase of white flowers',
    label: 'Embroidered flats',
  },
  {
    id: 'terracotta',
    desktop: '/hero-terracotta.webp',
    mobile: '/hero-terracotta-mobile.webp',
    width: 2306,
    height: 1880,
    alt: 'Woman in a cream top and wide-leg trousers sitting on a terracotta step, wearing tan leather strap sandals',
    label: 'Tan leather sandals',
  },
];

const INTERVAL_MS = 3000;
const MOBILE_SOURCES = '(max-width: 900px), (max-aspect-ratio: 1/1)';

export default function HeroCarousel({ index, onChange, heroRef }) {
  const [loaded, setLoaded] = useState(() => new Set([0])); // the first slide is the page's LCP image
  const [pointerPaused, setPointerPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef(null);
  const touchX = useRef(null);
  const prevIndex = useRef(0);
  const [pos, setPos] = useState(0);          // track position (can be `count` = the clone of slide 1)
  const [snap, setSnap] = useState(false);     // true while jumping back from the clone, without animation
  const count = HERO_SLIDES.length;
  const allLoaded = loaded.size >= count;

  const markLoaded = (i) => setLoaded((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));

  // keep the track position in step with the chosen slide; going last → first slides forward onto a clone
  useEffect(() => {
    const prev = prevIndex.current;
    prevIndex.current = index;
    if (reduced) { setPos(index); return undefined; }
    if (prev === count - 1 && index === 0) {
      setPos(count);
      // safety net: if the transition never reports back (e.g. hidden tab), settle on the real first slide
      const t = window.setTimeout(() => { setSnap(true); setPos(0); window.requestAnimationFrame(() => window.requestAnimationFrame(() => setSnap(false))); }, 1300);
      return () => window.clearTimeout(t);
    }
    setPos(index);
    return undefined;
  }, [index, count, reduced]);

  const onTrackEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (pos === count && index === 0) {
      setSnap(true);
      setPos(0);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setSnap(false)));
    }
  };

  // reduced motion + tab visibility
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReduced(mq.matches);
    const onVis = () => setHidden(document.hidden);
    onMotion(); onVis();
    mq.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVis);
    return () => { mq.removeEventListener('change', onMotion); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // pause while the mouse is over the interactive controls / keyboard focus is in the hero
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;
    const CONTROLS = '.mv2-hero__cta, .hp-controls';
    const over = (e) => { if (e.pointerType === 'mouse') setPointerPaused(Boolean(e.target.closest && e.target.closest(CONTROLS))); };
    const leave = () => setPointerPaused(false);
    // only keyboard focus pauses: a mouse or touch click leaves focus on the button but shouldn't stop the slideshow
    const focusIn = (e) => { try { setFocusPaused(Boolean(e.target.matches && e.target.matches(':focus-visible'))); } catch { setFocusPaused(false); } };
    const focusOut = (e) => { if (!hero.contains(e.relatedTarget)) setFocusPaused(false); };
    hero.addEventListener('pointerover', over);
    hero.addEventListener('pointerleave', leave);
    hero.addEventListener('focusin', focusIn);
    hero.addEventListener('focusout', focusOut);
    return () => {
      hero.removeEventListener('pointerover', over);
      hero.removeEventListener('pointerleave', leave);
      hero.removeEventListener('focusin', focusIn);
      hero.removeEventListener('focusout', focusOut);
    };
  }, [heroRef]);

  // pause once the hero is scrolled away
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting || entry.intersectionRatio < 0.35), { threshold: [0, 0.35, 1] });
    io.observe(hero);
    return () => io.disconnect();
  }, [heroRef]);

  // the timer: restarts whenever the slide changes (including manual changes)
  useEffect(() => {
    if (!allLoaded || userPaused || pointerPaused || focusPaused || hidden || offscreen || reduced) return undefined;
    const t = window.setTimeout(() => onChange((index + 1) % count), INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [allLoaded, userPaused, pointerPaused, focusPaused, hidden, offscreen, reduced, index, count, onChange]);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) onChange((index + (dx < 0 ? 1 : count - 1)) % count);
  };

  return (
    <>
      <div
        ref={rootRef}
        className="hp-track"
        style={{ transform: `translate3d(${-pos * 100}%, 0, 0)`, transition: snap ? 'none' : undefined }}
        onTransitionEnd={onTrackEnd}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="group"
        aria-roledescription="carousel"
        aria-label="Featured campaign photographs"
      >
        {[...HERO_SLIDES, { ...HERO_SLIDES[0], id: `${HERO_SLIDES[0].id}-clone`, clone: true }].map((s, i) => (
          <div
            key={s.id}
            className={`hp-slide hp-slide--${s.clone ? HERO_SLIDES[0].id : s.id}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${s.clone ? 1 : i + 1} of ${count}`}
            aria-hidden={!s.clone && i === index ? undefined : true}
          >
            <picture>
              <source media={MOBILE_SOURCES} srcSet={s.mobile} />
              <img
                className="mv2-hero__photo"
                src={s.desktop}
                width={s.width}
                height={s.height}
                alt={!s.clone && i === index ? s.alt : ''}
                fetchPriority={i === 0 ? 'high' : 'low'}
                decoding="async"
                onLoad={() => markLoaded(s.clone ? 0 : i)}
                onError={() => markLoaded(s.clone ? 0 : i)}
              />
            </picture>
            <div className="hp-shade" />
          </div>
        ))}
      </div>

      <div className="hp-controls" role="group" aria-label="Photograph controls">
        <div className="hp-dots">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`hp-dot${i === index ? ' is-active' : ''}`}
              aria-label={`Show photograph ${i + 1}: ${s.label}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => onChange(i)}
            />
          ))}
        </div>
        {!reduced && (
          <button
            type="button"
            className="hp-playpause"
            aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
            aria-pressed={userPaused}
            onClick={() => setUserPaused((v) => !v)}
          >
            {userPaused ? (
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor" /></svg>
            )}
          </button>
        )}
      </div>
    </>
  );
}
