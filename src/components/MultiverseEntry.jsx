import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';
import Footer from './Footer';
import Navbar from './Navbar';

const VIDEO_SRC = '/syora-home-loop.mp4';

/* ── Universe icons (inline SVG, fashion-themed) ── */
const UNIVERSE_ICONS = {
  icon: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M8 28 C8 20 12 16 16 14 C20 16 24 20 24 28" />
      <ellipse cx="16" cy="11" rx="4" ry="3" />
      <line x1="8" y1="28" x2="24" y2="28" />
      <line x1="10" y1="24" x2="22" y2="24" strokeOpacity="0.5" />
    </svg>
  ),
  heritage: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M5 20 Q16 10 27 20" />
      <path d="M7 22 Q16 13 25 22" strokeOpacity="0.5" />
      <path d="M5 20 Q8 24 16 26 Q24 24 27 20" />
      <circle cx="16" cy="20" r="2" fill="currentColor" strokeWidth="0" opacity="0.6"/>
      <path d="M12 14 Q14 11 16 13 Q18 11 20 14" strokeOpacity="0.6" />
    </svg>
  ),
  everyday: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="6" y="18" width="20" height="5" rx="2.5" />
      <path d="M8 18 C8 14 10 12 14 12 L18 12 C22 12 24 14 24 18" />
      <line x1="6" y1="23" x2="10" y2="27" />
      <line x1="26" y1="23" x2="22" y2="27" />
    </svg>
  ),
  motion: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 22 Q10 14 20 16 L26 14" />
      <path d="M4 22 L28 22" />
      <circle cx="8" cy="22" r="3" />
      <circle cx="22" cy="22" r="3" />
      <path d="M20 16 C21 13 23 12 26 14" strokeOpacity="0.6" />
    </svg>
  ),
};

export default function MultiverseEntry() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [exploreRevealed, setExploreRevealed] = useState(false);
  const [introPassed, setIntroPassed] = useState(false);
  const [shouldPlayHeroVideo, setShouldPlayHeroVideo] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.matchMedia('(max-width: 767px)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const introRef = useRef(null);
  const exploreRef = useRef(null);
  const transitionLockRef = useRef(false);
  const wheelGestureConsumedRef = useRef(false);
  const wheelIdleTimerRef = useRef(null);

  useEffect(() => {
    // Keep the full-bleed video off mobile connections and honor reduced motion.
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateHeroVideo = () => {
      setShouldPlayHeroVideo(!mobileQuery.matches && !motionQuery.matches);
    };
    mobileQuery.addEventListener('change', updateHeroVideo);
    motionQuery.addEventListener('change', updateHeroVideo);

    // IntersectionObserver — reveal glassmorphism section when it enters viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setExploreRevealed(true);
      },
      { threshold: 0.08 }
    );
    if (exploreRef.current) observer.observe(exploreRef.current);
    return () => {
      mobileQuery.removeEventListener('change', updateHeroVideo);
      motionQuery.removeEventListener('change', updateHeroVideo);
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

        {/* Sticky container so video stays put while explore slides over */}
        <div className="mv2-hero__sticky">
          {/* Video */}
          {shouldPlayHeroVideo && (
            <video
              className="mv2-hero__video"
              src={VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
            />
          )}

          {/* Full-screen glassmorphism layer — covers entire video, very low opacity */}
          <div className="mv2-hero__veil" />

          {/* SYORA — dead center */}
          <div className="mv2-hero__center">
            <h1 className="mv2-hero__wordmark">SYORA</h1>
            <p className="mv2-hero__sub">One Woman. Infinite Versions.</p>

            {/* Animated scroll cue */}
            <button
              type="button"
              className="mv2-hero__scroll-cue"
              onClick={scrollToExplore}
              aria-label="Scroll to explore the universes"
            >
              <span className="mv2-hero__scroll-line" aria-hidden="true" />
              <span className="mv2-hero__scroll-text" aria-hidden="true">scroll to explore</span>
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
        className={`mv2-explore ${exploreRevealed ? 'mv2-explore--visible' : ''}`}
        id="explore-universes"
        aria-labelledby="explore-heading"
      >
        <div className="mv2-explore__inner">
          <div className="mv2-explore__header">
            
            <h2 id="explore-heading" className="mv2-explore__heading">
              THE SYORA WORLD
            </h2>
            <p className="mv2-explore__sub">A World of Your Own.</p>
          </div>

          {/* Universe tiles grid */}
          <nav className="mv2-explore__grid" aria-label="Choose your universe">
            {universeList.map((u, i) => (
              <Link
                key={u.id}
                id={`mv-universe-tile-${u.id}`}
                to={`/universe/${u.id}`}
                className={`mv2-tile ${selected === u.id ? 'mv2-tile--selected' : ''}`}
                style={{ '--tile-delay': `${i * 80}ms` }}
                onClick={(event) => handleSelect(event, u.id)}
                aria-label={`Enter ${u.name} — ${u.tagline}`}
              >
                {/* Thumbnail */}
                <div className="mv2-tile__img-wrap">
                  <img
                    src={u.heroImage}
                    alt={u.name}
                    className="mv2-tile__img"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                  <div className="mv2-tile__img-overlay" />
                </div>

                {/* Icon + label */}
                <div className="mv2-tile__body">
                  <div className="mv2-tile__icon" aria-hidden="true">
                    {UNIVERSE_ICONS[u.id]}
                  </div>
                  <span className="mv2-tile__name">{u.name}</span>
                  <span className="mv2-tile__tagline">{u.tagline}</span>
                </div>

                {/* Hover CTA strip */}
                <div className="mv2-tile__enter" aria-hidden="true">
                  ENTER →
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </section>

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
