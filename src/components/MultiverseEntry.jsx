import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';
import Footer from './Footer';
import Navbar from './Navbar';
import './UniverseShowcase.css';
import './HomeTheme.css';
import './HeroCampaign.css';
import HeroCarousel from './HeroCarousel';
import UniverseCard from './UniverseCard';
import { ComfortSection, DetailsSection } from './HomeFeatures';
import ShopHighlights from './ShopHighlights';

export default function MultiverseEntry() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [exploreRevealed, setExploreRevealed] = useState(false);
  const [introPassed, setIntroPassed] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const introRef = useRef(null);
  const exploreRef = useRef(null);
  const transitionLockRef = useRef(false);
  const wheelGestureConsumedRef = useRef(false);
  const wheelIdleTimerRef = useRef(null);

  useEffect(() => {
    // IntersectionObserver — reveal glassmorphism section when it enters viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setExploreRevealed(true);
      },
      { threshold: 0.08 }
    );
    if (exploreRef.current) observer.observe(exploreRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const introSection = introRef.current;
    if (!introSection) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setIntroPassed(!(entry.isIntersecting && entry.intersectionRatio > 0.05));
    }, { rootMargin: '-52px 0px 0px 0px', threshold: [0, 0.05] });
    observer.observe(introSection);
    return () => observer.disconnect();
  }, []);

  const scrollToExplore = useCallback(() => {
    const section = exploreRef.current;
    if (!section || transitionLockRef.current) return;

    const scrollMarginTop = parseFloat(window.getComputedStyle(section).scrollMarginTop) || 0;
    const destination = Math.max(0, window.scrollY + section.getBoundingClientRect().top - scrollMarginTop);
    if (Math.abs(window.scrollY - destination) <= 1) return;

    transitionLockRef.current = true;
    window.scrollTo({
      top: destination,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, []);

  useEffect(() => {
    const markWheelGestureConsumed = () => {
      wheelGestureConsumedRef.current = true;
      window.clearTimeout(wheelIdleTimerRef.current);
      // WheelEvent has no standardized gesture-end event. Treat a quiet gap as
      // the end of the input burst; this is separate from the scroll lock.
      wheelIdleTimerRef.current = window.setTimeout(() => {
        wheelGestureConsumedRef.current = false;
        wheelIdleTimerRef.current = null;
      }, 200);
    };
    const onScrollEnd = () => {
      if (!transitionLockRef.current) return;
      // scrollend releases the animation lock. The wheel-burst guard remains
      // active until the input itself has gone quiet.
      transitionLockRef.current = false;
    };
    const onWheel = (event) => {
      if (event.deltaY <= 0) return;
      if (wheelGestureConsumedRef.current || transitionLockRef.current) {
        event.preventDefault();
        markWheelGestureConsumed();
        return;
      }
      if (window.scrollY <= 4) {
        event.preventDefault();
        markWheelGestureConsumed();
        scrollToExplore();
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scrollend', onScrollEnd);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scrollend', onScrollEnd);
      window.clearTimeout(wheelIdleTimerRef.current);
    };
  }, [scrollToExplore]);

  // Tiles are real links (middle-click / open-in-new-tab / copy link all work).
  // A plain left-click keeps the short exit transition before navigating.
  function handleSelect(event, id) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setSelected(id);
    setTimeout(() => navigate(`/universe/${id}`), 320);
  }

  const universeList = UNIVERSE_ORDER.map((id) => ({ id, ...UNIVERSES[id] }));

  return (
    <div className={`mv2 ${selected ? 'mv2--exit' : ''}`}>

      {/* ══════════════════════════════════════════
          STICKY VIDEO HERO — 100vh, stays behind
          Only SYORA wordmark is shown here
      ══════════════════════════════════════════ */}
      <section ref={introRef} className="mv2-hero" aria-label="SYORA — The Multiverse">
        <Navbar heroOverImage introTransition introPassed={introPassed} />

        {/* Sticky container so the photograph stays put while the next section slides over */}
        <div className="mv2-hero__sticky" data-slide={heroSlide}>
          {/* Campaign photographs slide; the brand block below stays fixed */}
          <HeroCarousel index={heroSlide} onChange={setHeroSlide} heroRef={introRef} />

          {/* SYORA wordmark — left of the model on desktop, above her on phones */}
          <div className="mv2-hero__center">
            <h1 className="mv2-hero__wordmark">SYORA</h1>
            <p className="mv2-hero__sub">One Woman. Infinite Versions.</p>
            <p className="mv2-hero__line">Contemporary, design&#8209;led women&rsquo;s footwear.</p>
            <button type="button" className="mv2-hero__cta" onClick={scrollToExplore}>
              <span>Shop the Universes</span>
              <span className="mv2-hero__cta-arrow" aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GLASSMORPHISM EXPLORE SECTION
          Scrolls over the sticky video with a
          frosted glass transition effect
      ══════════════════════════════════════════ */}
      <section
        ref={exploreRef}
        className={`uw ${exploreRevealed ? 'uw--visible' : ''}`}
        id="explore-universes"
        aria-labelledby="explore-heading"
      >
        <div className="uw__inner">
          <header className="uw__header">
            <div className="uw__titles">
              <p className="uw__eyebrow">SHOP BY UNIVERSE</p>
              <h2 id="explore-heading" className="uw__heading">
                Find Your Style
              </h2>
              <p className="uw__sub">FOUR DISTINCT WORLDS. ONE SYORA.</p>
            </div>
            {/* No "all products" page exists; /shop is the app's existing shop route. */}
            <Link to="/shop" className="uw__all">
              <span className="uw__all-label">Explore All</span>
              <span className="uw__all-arrow" aria-hidden="true">→</span>
            </Link>
          </header>

          {/* Universe cards */}
          <nav className="uw__grid" aria-label="Choose your universe">
            {universeList.map((u, i) => (
              <UniverseCard
                key={u.id}
                universe={u}
                tileId={`mv-universe-tile-${u.id}`}
                ariaLabel={`Enter ${u.name} — ${u.tagline}`}
                delay={i * 90}
                selected={selected === u.id}
                onClick={(event) => handleSelect(event, u.id)}
              />
            ))}
          </nav>
        </div>
      </section>

      {/* Best sellers / new arrivals (live Shopify data) */}
      <ShopHighlights />

      {/* Comfort + craftsmanship feature sections, blended between the universes and the story */}
      <ComfortSection />
      <DetailsSection />

      {/* ══════════════════════════════════════════
          ABOUT US
      ══════════════════════════════════════════ */}
      <section className="mv2-about" id="about" aria-labelledby="mv2-about-title">
        <div className="mv2-about__layout">
          <div className="mv2-about__intro">
            <p className="mv2-about__eyebrow">
              <span className="mv2-about__eyebrow-line" />
              OUR JOURNEY
            </p>
            <h2 id="mv2-about-title" className="mv2-about__heading">
              FROM<br />THREADS<br />TO YOUR<br />STORY ♡
            </h2>
            <p className="mv2-about__text mv2-about__text--lead">
              A journey of many hands,<br />for your next steps.
            </p>
          </div>

          <div className="mv2-about__story">
            <p className="mv2-about__text">
              Every SYORA piece carries a story of skilled artisans,
              thoughtful details and a whole lot of heart. We started with
              juttis rooted in tradition and a belief that Indian craft
              deserves to walk into every room with confidence.
            </p>
            {/* HERITAGE is the existing juttis and craft destination. */}
            <Link to="/universe/heritage" className="mv2-about__cta">MEET THE CRAFT →</Link>
            <p className="mv2-about__footer-text">INDIAN CRAFT. GLOBAL STEPS.</p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
