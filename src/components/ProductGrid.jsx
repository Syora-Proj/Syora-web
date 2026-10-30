import { Link } from 'react-router-dom';
import { useWishlisted } from '../lib/wishlist';
import { imgUrl, imgSrcSet } from '../lib/shopify/images';

export function ProductCard({ product, priority = false }) {
  const [wished, toggle] = useWishlisted(product.handle);
  const soldOut = product.availableForSale === false;
  const alt = product.imgHover ? ' sy-card--alt' : '';
  const sizes = '(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw';
  const img = (url, cls) => (
    <img
      className={`sy-card__img ${cls}`} src={imgUrl(url, 640)} srcSet={imgSrcSet(url, [320, 480, 640, 960])} sizes={sizes}
      alt={cls.includes('alt') ? '' : product.imgAlt || product.name} width={product.imgW || 640} height={product.imgH || 800}
      loading={priority ? 'eager' : 'lazy'} decoding="async"
    />
  );
  return (
    <li className={`sy-card${alt}${soldOut ? ' sy-card--soldout' : ''}`}>
      <Link to={`/product/${product.handle}`} className="sy-card__plate" tabIndex={-1} aria-hidden="true">
        {product.img && img(product.img, 'sy-card__img--main')}
        {product.imgHover && img(product.imgHover, 'sy-card__img--alt')}
      </Link>
      {(soldOut || product.badge) && <span className="sy-card__tag">{soldOut ? 'Sold out' : product.badge}</span>}
      <button type="button" className="sy-card__wish" onClick={toggle} aria-pressed={wished} aria-label={`${wished ? 'Remove' : 'Save'} ${product.name} ${wished ? 'from' : 'to'} wishlist`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
      </button>
      <div className="sy-card__body">
        <h3 className="sy-card__name"><Link to={`/product/${product.handle}`}>{product.name}</Link></h3>
        <p className="sy-card__price">
          <span>{product.price}</span>
          {product.originalPriceRaw > product.priceRaw && <s className="sy-card__was">{product.originalPrice}</s>}
        </p>
      </div>
    </li>
  );
}

export default function ProductGrid({ products, label = 'Products' }) {
  return (
    <ul className="sy-grid" aria-label={label} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
    </ul>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <ul className="sy-grid" aria-hidden="true" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {Array.from({ length: count }, (_, i) => <li key={i}><div className="sy-skel" /></li>)}
    </ul>
  );
}
