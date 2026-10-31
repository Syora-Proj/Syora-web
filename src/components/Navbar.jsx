import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';

const COLLECTION_MARKS = {
  icon: '✦',
  heritage: '❋',
  everyday: '◇',
  motion: '↗',
};

export default function Navbar({ universeMode = false, heroOverImage = false, introTransition = false, introPassed = true }) {
  const location = useLocation();
  const { totalQuantity, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const navRef = useRef(null);
  const isEntry = location.pathname === '/';
  const lightMode = isEntry || universeMode;

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setCollectionsOpen(false);
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setCollectionsOpen(false);
        setMenuOpen(false);
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
    <header ref={navRef} className={`navbar navbar--redesign ${lightMode ? 'navbar--light' : ''} ${universeMode ? 'navbar--universe' : ''} ${heroOverImage ? 'navbar--hero' : ''} ${menuOpen ? 'navbar--menu-open' : ''} ${introTransition ? (introPassed ? 'navbar--intro-passed' : 'navbar--intro-hidden') : ''}`}>
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
        <Link className="nav-link" to="/" onClick={() => setMenuOpen(false)}>SHOP</Link>
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
            {collections.map(({ id, name }) => (
              <Link key={id} to={`/universe/${id}`} tabIndex={collectionsOpen ? 0 : -1} onClick={() => { setCollectionsOpen(false); setMenuOpen(false); }}>
                <span className="nav-collections__item-label">
                  <span className="nav-collections__icon" aria-hidden="true">{COLLECTION_MARKS[id]}</span>
                  <span>{name}</span>
                </span>
                <span className="nav-collections__arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
        <Link className="nav-link" to="/#about" onClick={() => setMenuOpen(false)}>OUR STORY</Link>

        <div className="nav-mobile-utilities" aria-label="Quick links">
          <button className="nav-mobile-utility" type="button" aria-label="Search (coming soon)" aria-disabled="true" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
            <span>SEARCH</span>
          </button>
          <button className="nav-mobile-utility" type="button" aria-label="Account (coming soon)" aria-disabled="true" disabled>
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
        <button className="nav-action nav-action--soon" aria-label="Search (coming soon)" aria-disabled="true" title="Search — coming soon" onClick={(event) => event.preventDefault()}>
          <span className="nav-action__label">SEARCH</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <span className="nav-sep" aria-hidden="true" />
        <button className="nav-action nav-action--soon" aria-label="Account (coming soon)" aria-disabled="true" title="Account — coming soon" onClick={(event) => event.preventDefault()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        <button className="nav-action nav-cart" aria-label={`Bag — ${totalQuantity} items`} onClick={openCart}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          {totalQuantity > 0 && <span className="nav-action__label">({totalQuantity})</span>}
        </button>
      </div>
      {menuOpen && <button className="nav-backdrop" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}
    </header>
    </>
  );
}
