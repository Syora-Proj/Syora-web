import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';

/**
 * SYORA — Navbar
 *
 * Adapts between:
 * - Universe mode: overlaid on coloured hero, light text
 * - Entry / default: overlaid on Multiverse video or normal page
 *
 * Nav items: THE MULTIVERSE followed by the four active universes, in the
 * canonical order from src/data/universes.js (single source of truth).
 */
export default function Navbar({ universeMode = false, heroOverImage = false }) {
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

  // Close the mobile drawer with Escape (keyboard users) and whenever the route changes.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header className={`navbar ${lightMode ? 'navbar--light' : ''} ${universeMode ? 'navbar--universe' : ''} ${heroOverImage ? 'navbar--hero' : ''} ${menuOpen ? 'navbar--menu-open' : ''}`}>
        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Left nav */}
        <nav id="primary-navigation" className={`nav-left ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <Link
            className="nav-link"
            to="/"
            onClick={() => setMenuOpen(false)}
            aria-current={isEntry ? 'page' : undefined}
          >
            THE MULTIVERSE
          </Link>
          {UNIVERSE_ORDER.map((id) => (
            <Link
              key={id}
              className="nav-link"
              to={`/universe/${id}`}
              onClick={() => setMenuOpen(false)}
              aria-current={location.pathname === `/universe/${id}` ? 'page' : undefined}
            >
              {UNIVERSES[id].name}
            </Link>
          ))}
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
          <button className="nav-action nav-action--soon" aria-label="Search (coming soon)" aria-disabled="true" title="Search — coming soon" onClick={(e) => e.preventDefault()}>
            <span className="nav-action__label" style={{ marginRight: '6px' }}>SEARCH</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <span className="nav-sep">|</span>
          <button className="nav-action nav-action--soon" aria-label="Account (coming soon)" aria-disabled="true" title="Account — coming soon" onClick={(e) => e.preventDefault()}>
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
