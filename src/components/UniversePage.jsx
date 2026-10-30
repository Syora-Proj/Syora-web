import { useNavigate } from 'react-router-dom';
import { UNIVERSES } from '../data/universes';
import ProductGrid from './ProductGrid';
import ExploreMore from './ExploreMore';
import Footer from './Footer';
import Navbar from './Navbar';
import { useShopifyCollection } from '../hooks/useShopifyCollection';

/**
 * SYORA — Universe Page
 *
 * Shared template for the four universe pages.
 * Universe-specific content and colours come from src/data/universes.js.
 *
 * Page structure (per spec):
 * 1. Universe Hero
 * 2. Editorial intro
 * 3. Featured products
 * 4. Universe bestsellers
 * 5. Explore More Universes
 * 6. Footer
 */
export default function UniversePage({ universe: universeId }) {
  const navigate = useNavigate();
  const u = UNIVERSES[universeId];

  // Fetch live products from Shopify collection matching the universe handle
  const { products: shopifyProducts, bestsellers: shopifyBestsellers, loading, error } = useShopifyCollection(universeId);

  if (!u) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <p>Universe not found. <button onClick={() => navigate('/')}>Return to Multiverse</button></p>
      </div>
    );
  }

  const { palette } = u;

  // Parse headline with \n into <br /> elements
  const headlineLines = u.headline.split('\n');

  return (
    <div
      className="universe-page"
      style={{ '--u-bg': palette.bg, '--u-accent': palette.accent, '--u-text': palette.text, '--u-muted': palette.muted, '--u-border': palette.border, '--u-hero-text': palette.heroText || '#f5ece4' }}
    >
      {/* Navbar floats above the hero */}
      <Navbar universeMode universeId={universeId} />

      {/* ── 1. Universe Hero ── */}
      <section
        className={`u-hero${universeId === 'icon' ? ' u-hero--icon' : ''}`}
        aria-labelledby={`u-hero-title-${universeId}`}
      >
        {/* Background image */}
        <div className="u-hero__img-wrap">
          <picture>
            {u.heroImageMobile && (
              <source media="(max-width: 768px)" srcSet={u.heroImageMobile} />
            )}
            <img
              src={u.heroImage}
              alt={u.heroImageAlt}
              className="u-hero__img"
            />
          </picture>
          <div className="u-hero__overlay" style={{ background: palette.heroOverlay }} />
        </div>

        {/* Gradient side-fade for text legibility */}
        <div className="u-hero__gradient" style={{ background: palette.heroGradient }} />

        {/* Hero content */}
        <div className="u-hero__content">
          <p className="u-hero__eyebrow">— THE MULTIVERSE / {u.name}</p>
          <h1
            id={`u-hero-title-${universeId}`}
            className="u-hero__headline"
          >
            {headlineLines.map((line, i) => (
              <span key={i} className="u-hero__headline-line">{line}</span>
            ))}
          </h1>
          <p className="u-hero__tagline">{u.tagline}</p>
          <div className="u-hero__actions">
            <button
              id={`u-hero-cta-${universeId}`}
              className="u-cta-btn u-cta-btn--primary"
              onClick={() => {
                document.getElementById(`products-${universeId}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {u.cta}
            </button>
            <button
              className="u-cta-btn u-cta-btn--ghost"
              onClick={() => navigate('/')}
            >
              ← THE MULTIVERSE
            </button>
          </div>
        </div>

        {/* Universe name watermark */}
        <div className="u-hero__watermark" aria-hidden="true">{u.name}</div>
      </section>

      {/* ── 2. Editorial Intro ── */}
      <section className="u-editorial" aria-label={`${u.name} editorial`}>
        <div className="u-editorial__inner">
          <div className="u-editorial__line" />
          <blockquote className="u-editorial__quote">
            {u.editorial}
          </blockquote>
          <div className="u-editorial__meta">
            <span className="u-editorial__universe-tag">THE MULTIVERSE / {u.name}</span>
          </div>
        </div>
      </section>

      {/* ── 3. Featured Products ── */}
      <section id={`products-${universeId}`} className="u-products">
        {loading ? (
          <div className="u-products-loading" role="status" aria-label="Loading products">
            <div className="u-loading-spinner" />
          </div>
        ) : error ? (
          <div className="product-grid product-grid--state">
            <div className="product-grid__empty" role="alert">
              <p className="product-grid__empty-title">We couldn't load these products</p>
              <button type="button" className="product-grid__empty-cta" onClick={() => window.location.reload()}>
                TRY AGAIN
              </button>
            </div>
          </div>
        ) : (
          <ProductGrid
            title={`THE ${u.name} EDIT`}
            products={shopifyProducts}
            universeId={universeId}
            onExploreOthers={() => {
              document.getElementById('explore-more')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
      </section>

      {/* ── 4. Universe Bestsellers (only rendered when there are any) ── */}
      {!loading && !error && shopifyBestsellers.length > 0 && (
        <section className="u-bestsellers">
          <ProductGrid
            title={`${u.name} BESTSELLERS`}
            products={shopifyBestsellers}
            universeId={universeId}
          />
        </section>
      )}

      {/* ── 5 & 6. Bottom Section: Explore More & Footer ── */}
      <div className={universeId === 'icon' ? 'icon-dark-bottom' : ''}>
        <ExploreMore currentId={universeId} />
        <Footer />
      </div>
    </div>
  );
}
