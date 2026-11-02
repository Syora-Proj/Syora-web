import { Link } from 'react-router-dom';
import { useWishlistHandles } from '../lib/wishlist';
import { getProductsByHandles } from '../lib/shopify/catalog';
import { useAsyncData } from '../hooks/useAsyncData';
import { UNIVERSES } from '../data/universes';
import { ProductCard } from './ProductGrid';
import Navbar from './Navbar';
import Footer from './Footer';
import './CartPage.css';

/** SYORA — wishlist (/wishlist): the hearts saved on this device, with live product data. */
export default function WishlistPage() {
  const handles = useWishlistHandles();
  const key = handles.join(',');
  const { data, loading, error } = useAsyncData(() => getProductsByHandles(handles), [key], handles.length > 0);
  const { palette } = UNIVERSES.icon;

  // Un-hearting a card removes it straight away, without waiting for a refetch.
  const items = (data || []).filter((p) => handles.includes(p.handle));

  return (
    <div
      className="universe-page"
      style={{ '--u-bg': palette.bg, '--u-accent': palette.accent, '--u-text': palette.text, '--u-muted': palette.muted, '--u-border': palette.border }}
    >
      <title>Your Wishlist — SYORA</title>
      <meta name="robots" content="noindex" />
      <Navbar universeMode solid />

      <main id="main" className="cp">
        <div className="cp__inner">
          <header className="cp__head">
            <p className="cp__eyebrow">SAVED FOR LATER</p>
            <h1 className="cp__title">{handles.length > 0 ? <>Your Wishlist <span>({handles.length})</span></> : 'Your Wishlist'}</h1>
            <p className="cp__note">Saved on this device. They'll be here next time you visit from the same browser.</p>
          </header>

          {handles.length === 0 ? (
            <div className="cp__empty">
              <p className="cp__empty-title">Nothing saved yet.</p>
              <p className="cp__empty-sub">Tap the heart on any style to keep it here.</p>
              <div className="cp__empty-actions">
                <Link to="/shop" className="cp__btn">Shop all products</Link>
                {['icon', 'heritage', 'everyday', 'motion'].map((id) => (
                  <Link key={id} to={`/universe/${id}`} className="cp__chip">{UNIVERSES[id].name}</Link>
                ))}
              </div>
            </div>
          ) : loading && items.length === 0 ? (
            <div className="u-products-loading" role="status" aria-label="Loading your wishlist"><div className="u-loading-spinner" /></div>
          ) : error ? (
            <p className="cp__error" role="alert">We couldn't load your wishlist right now. Please try again in a moment.</p>
          ) : (
            <div className="product-grid">
              <div className="product-grid__cards cp__wishgrid">
                {items.map((p) => (<ProductCard key={p.id} product={{ ...p, imgHover: p.imgSecond || p.imgHover }} />))}
              </div>
              {items.length < handles.length && (
                <p className="cp__note cp__note--after">Some saved styles are no longer available and aren't shown.</p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
