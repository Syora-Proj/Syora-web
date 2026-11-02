import { ALL_PRODUCTS_CONTENT } from '../data/collectionContent';
import { UNIVERSES } from '../data/universes';
import { getAllProducts } from '../lib/shopify/catalog';
import { useAsyncData } from '../hooks/useAsyncData';
import ProductGrid from './ProductGrid';
import ExploreMore from './ExploreMore';
import Footer from './Footer';
import Navbar from './Navbar';

/**
 * SYORA — Explore All (/shop)
 *
 * The whole catalogue in the same calm template as a collection page: compact banner,
 * category pills, sticky filter / sort bar and the grid — plus a way into each universe.
 */
export default function ShopAllPage() {
  const { data, loading, error } = useAsyncData(() => getAllProducts(60), []);
  const content = ALL_PRODUCTS_CONTENT;
  const { palette } = UNIVERSES.icon;

  return (
    <div
      className="universe-page"
      style={{ '--u-bg': palette.bg, '--u-accent': palette.accent, '--u-text': palette.text, '--u-muted': palette.muted, '--u-border': palette.border, '--u-hero-text': '#f5ece4' }}
    >
      <title>All Products — SYORA</title>
      <meta name="description" content="Shop every SYORA style — heels, juttis, flats and sneakers across ICON, HERITAGE, EVERYDAY and MOTION." />
      <Navbar universeMode solid />

      <main id="products-all" className="u-products">
        {loading ? (
          <div className="u-products-loading" role="status" aria-label="Loading products">
            <div className="u-loading-spinner" />
          </div>
        ) : error ? (
          <div className="product-grid product-grid--state">
            <div className="product-grid__empty" role="alert">
              <p className="product-grid__empty-title">We couldn't load the collection</p>
              <button type="button" className="product-grid__empty-cta" onClick={() => window.location.reload()}>TRY AGAIN</button>
            </div>
          </div>
        ) : (
          <ProductGrid
            browse
            title={content.headline}
            description={content.description}
            hero={{ eyebrow: content.eyebrow, cta: '', image: content.hero, colors: content.colors }}
            products={data || []}
            universeId="all"
            onExploreOthers={() => document.getElementById('explore-more')?.scrollIntoView({ behavior: 'smooth' })}
          />
        )}
      </main>

      <ExploreMore currentId={null} />
      <Footer />
    </div>
  );
}
