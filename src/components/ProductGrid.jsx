import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SYORA — Reusable Product Card
 */
export function ProductCard({ product }) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const productHandle = product.handle || product.id;
  const productPath = `/product/${encodeURIComponent(productHandle)}`;

  function openProduct() {
    if (productHandle) navigate(productPath);
  }

  return (
    <article
      className="product-card"
      aria-label={product.name}
      onClick={openProduct}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          openProduct();
        }
      }}
      role="link"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-card__img-wrap">
        {product.badge && (
          <span className="product-card__badge">{product.badge}</span>
        )}
        <img
          src={product.img}
          alt={product.imgAlt || product.name}
          className="product-card__img"
          loading="lazy"
        />
        {product.imgHover && (
          <img
            src={product.imgHover}
            alt={`${product.name} worn on foot`}
            className="product-card__img product-card__img--hover"
            loading="lazy"
            aria-hidden="true"
          />
        )}
        <button
          className={`product-card__wish ${wishlisted ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div className="product-card__overlay">
          <button
            className="product-card__quick"
            onClick={(e) => { e.stopPropagation(); openProduct(); }}
          >
            VIEW PRODUCT
          </button>
        </div>
      </div>
      <div className="product-card__info">
        <p className="product-card__name">{product.name}</p>
        <p className="product-card__price">{product.price}</p>
      </div>
    </article>
  );
}

/**
 * SYORA — Product Grid
 * Renders a header + responsive grid of ProductCards.
 * Shows a placeholder message when products array is empty.
 */
export default function ProductGrid({ title, products = [], viewAllLabel = 'VIEW ALL →', universeId }) {
  const navigate = useNavigate();

  return (
    <section className="product-grid" aria-labelledby={`grid-title-${universeId}`}>
      <div className="product-grid__header">
        <h2 id={`grid-title-${universeId}`} className="product-grid__title">{title}</h2>
        <button
          className="product-grid__view-all"
          onClick={() => navigate(`/universe/${universeId}`)}
          aria-label={`${viewAllLabel} for ${title}`}
        >
          {viewAllLabel}
        </button>
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
        <div className="product-grid__empty">
          <p className="product-grid__empty-title">Universe in creation, personalised for you</p>
        </div>
      )}
    </section>
  );
}
