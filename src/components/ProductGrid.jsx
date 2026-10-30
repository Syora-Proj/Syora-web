import { Link } from 'react-router-dom';
import { useWishlisted } from '../lib/wishlist';

/**
 * SYORA — Reusable Product Card
 *
 * Structure (valid, keyboard-friendly markup):
 *   <article>
 *     image  -> <Link> (decorative duplicate of the title link, removed from tab order)
 *     badge, wishlist <button>  (siblings of the link, never nested inside it)
 *     title  -> <Link> (the one accessible tab stop for the card)
 *     price
 * Previously the whole card was an <article role="link"> that CONTAINED a button,
 * which is invalid nested-interactive markup.
 */
export function ProductCard({ product }) {
  const productHandle = product.handle || product.id;
  const productPath = `/product/${encodeURIComponent(productHandle)}`;
  const [wishlisted, toggleWishlist] = useWishlisted(productHandle);

  // Only show a "was" price when Shopify genuinely has a higher compare-at price.
  const hasRealDiscount =
    Number(product.originalPriceRaw) > 0 &&
    Number(product.originalPriceRaw) > Number(product.priceRaw || 0);
  const soldOut = product.availableForSale === false;
  const badge = soldOut ? 'SOLD OUT' : product.badge;

  return (
    <article className={`product-card${soldOut ? ' product-card--soldout' : ''}${product.imgHover ? ' product-card--has-hover' : ''}`}>
      <div className="product-card__img-wrap">
        {badge && <span className="product-card__badge">{badge}</span>}
        <Link to={productPath} className="product-card__media" tabIndex={-1} aria-hidden="true">
          <img
            src={product.img}
            alt=""
            className="product-card__img"
            loading="lazy"
            decoding="async"
          />
          {product.imgHover && (
            <img
              src={product.imgHover}
              alt=""
              className="product-card__img product-card__img--hover"
              loading="lazy"
              decoding="async"
            />
          )}
          <span className="product-card__overlay">
            <span className="product-card__quick">VIEW PRODUCT</span>
          </span>
        </Link>
        <button
          type="button"
          className={`product-card__wish ${wishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div className="product-card__info">
        <h3 className="product-card__name">
          <Link to={productPath} className="product-card__link">{product.name}</Link>
        </h3>
        <p className="product-card__price">
          {hasRealDiscount && (
            <s className="product-card__price-was" aria-label={`Original price ${product.originalPrice}`}>{product.originalPrice}</s>
          )}
          <span>{product.price}</span>
        </p>
      </div>
    </article>
  );
}

/**
 * SYORA — Product Grid
 * Renders a header + responsive grid of ProductCards.
 *
 * `viewAllHref` is optional: the "view all" link is only rendered when the
 * caller supplies a destination that differs from the current page. (On universe
 * pages the grid already IS the collection, so a link back to the same route was
 * a dead control.)
 *
 * Empty collections render a deliberate "coming soon" state instead of a blank
 * grid; `onExploreOthers` adds a way onward to the other universes.
 */
export default function ProductGrid({
  title,
  products = [],
  viewAllLabel = 'VIEW ALL →',
  viewAllHref,
  universeId,
  onExploreOthers,
}) {
  return (
    <section className="product-grid" aria-labelledby={`grid-title-${universeId}-${slug(title)}`}>
      <div className="product-grid__header">
        <h2 id={`grid-title-${universeId}-${slug(title)}`} className="product-grid__title">{title}</h2>
        {viewAllHref && (
          <Link
            className="product-grid__view-all"
            to={viewAllHref}
            aria-label={`${viewAllLabel} for ${title}`}
          >
            {viewAllLabel}
          </Link>
        )}
      </div>

      {products.length > 0 ? (
        <div className="product-grid__cards">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{ ...p, imgHover: p.imgSecond || p.imgHover }}
            />
          ))}
        </div>
      ) : (
        <div className="product-grid__empty" role="status">
          <p className="product-grid__empty-eyebrow">COMING SOON</p>
          <p className="product-grid__empty-title">Universe in creation, personalised for you</p>
          {onExploreOthers && (
            <button type="button" className="product-grid__empty-cta" onClick={onExploreOthers}>
              EXPLORE OTHER UNIVERSES ↓
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function slug(text = '') {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
