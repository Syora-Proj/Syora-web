import { useNavigate } from 'react-router-dom';
import { UNIVERSES } from '../data/universes';
import { COLLECTION_CONTENT } from '../data/collectionContent';
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
 * Page structure:
 * 1. Compact collection header band (title, tagline, product count, hero crop)
 * 2. Sticky filter / sort bar + product grid
 * 3. Universe bestsellers
 * 4. Explore More Universes
 * 5. Footer
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
  const content = COLLECTION_CONTENT[universeId];

  return (
    <div
      className="universe-page"
      style={{ '--u-bg': palette.bg, '--u-accent': palette.accent, '--u-text': palette.text, '--u-muted': palette.muted, '--u-border': palette.border, '--u-hero-text': palette.heroText || '#f5ece4' }}
    >
      <title>{`${titleCase(u.name)} Collection — SYORA`}</title>
      <meta name="description" content={content.description} />
      {/* Solid navbar: the collection page leads with the products, not a full-screen hero. */}
      <Navbar universeMode solid />

      {/* ── Collection: header band + filters + grid ── */}
      <main id={`products-${universeId}`} className="u-products">
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
            browse
            title={content.headline}
            description={content.description}
            hero={{
              eyebrow: content.eyebrow,
              cta: content.cta,
              image: content.hero,
              colors: content.colors,
            }}
            products={shopifyProducts}
            universeId={universeId}
            onExploreOthers={() => {
              document.getElementById('explore-more')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* ── Universe bestsellers (only rendered when there are any) ── */}
      {!loading && !error && shopifyBestsellers.length > 0 && (
        <section className="u-bestsellers">
          <ProductGrid
            title={`${titleCase(u.name)} Bestsellers`}
            products={shopifyBestsellers}
            universeId={universeId}
          />
        </section>
      )}

      {/* ── Explore More & Footer ── */}
      <div className={universeId === 'icon' ? 'icon-dark-bottom' : ''}>
        <ExploreMore currentId={universeId} />
        <Footer />
      </div>
    </div>
  );
}

/** 'OFF-DUTY' -> 'Off-Duty' (names are stored upper-case for the hero treatment). */
function titleCase(text = '') {
  return String(text).toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}
