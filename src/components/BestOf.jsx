import { useState } from 'react';
import juttiSig from '../assets/jutti_signature.png';
import juttiEmb from '../assets/jutti_embroidered.png';
import juttiEvy from '../assets/jutti_everyday.png';
import heelsImg from '../assets/heels_strappy.png';

const products = [
  { id: 1, img: juttiSig, name: 'Signature Juttis',   price: '₹2,499', badge: 'BESTSELLER' },
  { id: 2, img: juttiEmb, name: 'Embroidered Juttis', price: '₹2,799', badge: 'NEW' },
  { id: 3, img: juttiEvy, name: 'Everyday Juttis',    price: '₹2,299', badge: null },
  { id: 4, img: heelsImg, name: 'Strappy Heels',       price: '₹3,499', badge: 'TRENDING' },
];

function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="product-card">
      <div className="product-card__img-wrap">
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
        <img src={product.img} alt={product.name} className="product-card__img" />
        <button
          className={`product-card__wish ${wishlisted ? 'active' : ''}`}
          onClick={() => setWishlisted(!wishlisted)}
          aria-label="Add to wishlist"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div className="product-card__overlay">
          <button className="product-card__quick">QUICK ADD</button>
        </div>
      </div>
      <div className="product-card__info">
        <p className="product-card__name">{product.name}</p>
        <p className="product-card__price">{product.price}</p>
      </div>
    </div>
  );
}

export default function BestOf() {
  return (
    <section className="best-of" id="best-of">
      <div className="best-of__header">
        <h2 className="best-of__title">BEST OF SYORA</h2>
        <a href="#" className="best-of__view-all">VIEW ALL →</a>
      </div>
      <div className="best-of__grid">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      <div className="best-of__tagline">— WALK YOUR WAY —</div>
    </section>
  );
}
