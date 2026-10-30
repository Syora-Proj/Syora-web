import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/**
 * SYORA — Navbar
 *
 * Adapts between:
 * - Universe mode: overlaid on coloured hero, light text
 * - Entry / default: overlaid on Multiverse video or normal page
 *
 * Nav items (per spec): THE MULTIVERSE | SHOP | NEW ARRIVALS | BESTSELLERS
 */
export default function Navbar({ universeMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalQuantity, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const isEntry = location.pathname === '/';

  // On the entry page and universe pages, text is light; on other pages use brand colour
  const lightMode = isEntry || universeMode;

  function goTo(path) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <>
      <header className={`navbar ${lightMode ? 'navbar--light' : ''} ${universeMode ? 'navbar--universe' : ''}`}>
        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Left nav */}
        <nav className={`nav-left ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <button
            className="nav-link"
            onClick={() => goTo('/')}
            aria-label="Return to the Multiverse"
          >
            THE MULTIVERSE
          </button>
          <button className="nav-link" onClick={() => goTo('/#shop')}>SHOP</button>
          <button className="nav-link" onClick={() => goTo('/#new-arrivals')}>NEW ARRIVALS</button>
          <button className="nav-link" onClick={() => goTo('/#bestsellers')}>BESTSELLERS</button>
        </nav>

        {/* Center SYORA logo */}
        <button
          className="nav-logo"
          onClick={() => goTo('/')}
          aria-label="SYORA — Return to home"
        >
          SYORA
        </button>

        {/* Right actions */}
        <div className="nav-right">
          <button className="nav-action" aria-label="Search">
            <span className="nav-action__label" style={{ marginRight: '6px' }}>SEARCH</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <span className="nav-sep">|</span>
          <button className="nav-action" aria-label="Account">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          <button
            className="nav-action nav-cart"
            aria-label={`Bag — ${totalQuantity} items`}
            onClick={openCart}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalQuantity > 0 && (
              <span className="nav-action__label" style={{ marginLeft: '6px' }}>({totalQuantity})</span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div
          className="nav-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
