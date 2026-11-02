import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';
import { accountUrl } from '../lib/shopify/search';
import SearchOverlay from './SearchOverlay';

const COLLECTION_MARKS = {
  icon: '✦',
  heritage: '❋',
  everyday: '◇',
  motion: '↗',
};

export default function Navbar({ universeMode = false, heroOverImage = false, solid = false, overlay = false, introTransition = false, introPassed = true }) {
  const location = useLocation();
  const { totalQuantity, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navRef = useRef(null);
  const signInUrl = accountUrl();
  const isEntry = location.pathname === '/';
  const lightMode = isEntry || universeMode;

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setCollectionsOpen(false);
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setCollectionsOpen(false);
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    setCollectionsOpen(false);
    setMenuOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen || !window.matchMedia('(max-width: 767px)').matches) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  const collections = UNIVERSE_ORDER.map((id) => ({ id, ...UNIVERSES[id] }));

  return (
    <>
    <div className={`nav-collections-backdrop ${collectionsOpen ? 'is-visible' : ''}`} aria-hidden="true" />
    <header ref={navRef} className={`navbar navbar--redesign ${lightMode ? 'navbar--light' : ''} ${universeMode ? 'navbar--universe' : ''} ${heroOverImage ? 'navbar--hero' : ''} ${solid ? 'navbar--solid' : ''} ${overlay ? 'navbar--overlay' : ''} ${menuOpen ? 'navbar--menu-open' : ''} ${introTransition ? (introPassed ? 'navbar--intro-passed' : 'navbar--intro-hidden') : ''}`}>
      <Link className="nav-logo" to="/" aria-label="SYORA — Return to home">SYORA</Link>

      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
      >
        <span /><span /><span />
      </button>

      <nav id="primary-navigation" className={`nav-left ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
        <Link className="nav-link" to="/shop" onClick={() => setMenuOpen(false)}>SHOP</Link>
        <div
          className={`nav-collections ${collectionsOpen ? 'is-open' : ''}`}
          onMouseEnter={() => window.matchMedia('(min-width: 1221px)').matches && setCollectionsOpen(true)}
          onMouseLeave={() => setCollectionsOpen(false)}
        >
          <button
            className="nav-link nav-collections__trigger"
            type="button"
            aria-expanded={collectionsOpen}
            aria-controls="collections-menu"
            onClick={() => setCollectionsOpen((open) => !open)}
          >
            COLLECTIONS
          </button>
          <div id="collections-menu" className="nav-collections__menu" aria-hidden={!collectionsOpen}>
            {collections.map(({ id, name, tagline }) => (
              <Link key={id} to={`/universe/${id}`} tabIndex={collectionsOpen ? 0 : -1} onClick={() => { setCollectionsOpen(false); setMenuOpen(false); }}>
                <span className="nav-col__thumb" aria-hidden="true"><img src={`/universe-cards/${id}.webp`} alt="" loading="lazy" decoding="async" /></span>
                <span className="nav-collections__item-label">
                  <span className="nav-collections__icon" aria-hidden="true">{COLLECTION_MARKS[id]}</span>
                  <span className="nav-col__text">
                    <span className="nav-col__name">{name}</span>
                    {tagline && <span className="nav-col__tag">{tagline}</span>}
                  </span>
                </span>
                <span className="nav-collections__arrow" aria-hidden="true">→</span>
              </Link>
            ))}
            <Link className="nav-collections__all" to="/shop" tabIndex={collectionsOpen ? 0 : -1} onClick={() => { setCollectionsOpen(false); setMenuOpen(false); }}>
              <span>Explore all products</span>
              <span className="nav-collections__arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <Link className="nav-link" to="/#about" onClick={() => setMenuOpen(false)}>OUR STORY</Link>

        <div className="nav-mobile-utilities" aria-label="Quick links">
          <button className="nav-mobile-utility" type="button" aria-label="Search" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
            <span>SEARCH</span>
          </button>
          <button className="nav-mobile-utility" type="button" aria-label="Account" onClick={() => { setMenuOpen(false); setAccountOpen(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2"/></svg>
            <span>ACCOUNT</span>
          </button>
          <button className="nav-mobile-utility" type="button" aria-label={`Bag — ${totalQuantity} items`} onClick={() => { setMenuOpen(false); openCart(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>
            <span>BAG{totalQuantity > 0 ? ` (${totalQuantity})` : ''}</span>
          </button>
        </div>
      </nav>

      <div className="nav-right">
        <button className="nav-action" type="button" aria-label="Search" title="Search" onClick={() => { setAccountOpen(false); setSearchOpen(true); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <div className="nav-account">
          <button className="nav-action" type="button" aria-label="Account" title="Account" aria-expanded={accountOpen} aria-haspopup="true" onClick={() => setAccountOpen((open) => !open)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <div className={`nav-account__menu ${accountOpen ? 'is-open' : ''}`} role="menu" aria-hidden={!accountOpen}>
            {signInUrl && (
              <a href={signInUrl} role="menuitem" tabIndex={accountOpen ? 0 : -1}>Sign in / My orders</a>
            )}
            <Link to="/wishlist" role="menuitem" tabIndex={accountOpen ? 0 : -1}>Wishlist</Link>
            <Link to="/cart" role="menuitem" tabIndex={accountOpen ? 0 : -1}>My bag</Link>
            <Link to="/info/exchanges" role="menuitem" tabIndex={accountOpen ? 0 : -1}>Exchanges</Link>
            <Link to="/info/shipping-delivery" role="menuitem" tabIndex={accountOpen ? 0 : -1}>Shipping &amp; Delivery</Link>
            <Link to="/info/contact-us" role="menuitem" tabIndex={accountOpen ? 0 : -1}>Contact us</Link>
          </div>
        </div>
        <button className="nav-action nav-cart" type="button" aria-label={`Bag — ${totalQuantity} items`} title="Bag" onClick={() => { setAccountOpen(false); openCart(); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          {totalQuantity > 0 && <span className="nav-cart__count" aria-hidden="true">{totalQuantity}</span>}
        </button>
      </div>
      {menuOpen && <button className="nav-backdrop" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}
    </header>
    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
