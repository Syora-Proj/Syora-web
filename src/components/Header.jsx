import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';

const Icon = ({ d, children }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{d ? <path d={d} /> : children}</svg>
);

/**
 * One header for every page, home included: logo, universes, search, bag.
 * `over` = sits on top of a full-bleed image until the page is scrolled.
 */
export default function Header({ over = false }) {
  const { totalQuantity, openCart } = useCart();
  const loc = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [solid, setSolid] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setMenu(false); setSearch(false);
  }, [loc.pathname]);

  useEffect(() => {
    if (!over) { setSolid(true); return undefined; }
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [over]);

  useEffect(() => {
    if (!menu && !search) return undefined;
    const key = (e) => { if (e.key === 'Escape') { setMenu(false); setSearch(false); } };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [menu, search]);

  useEffect(() => { if (search) inputRef.current?.focus(); }, [search]);

  const submit = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q')?.toString().trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const current = (path) => (loc.pathname === path ? 'page' : undefined);
  const links = (
    <>
      {UNIVERSE_ORDER.map((id) => (
        <Link key={id} className="sy-nav__link" to={`/universe/${id}`} aria-current={current(`/universe/${id}`)}>
          <span className="sy-num">{UNIVERSES[id].num}</span>{UNIVERSES[id].name}
        </Link>
      ))}
      <Link className="sy-nav__link" to="/shop" aria-current={current('/shop')}>Shop</Link>
    </>
  );

  return (
    <>
      <header className={`sy-header${over ? ' sy-header--over' : ''}${solid ? ' is-solid' : ''}${search || menu ? ' is-solid' : ''}`}>
        <div style={{ justifySelf: 'start', display: 'flex' }}>
          <button type="button" className="sy-icon-btn sy-menu-btn" onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu} aria-controls="sy-drawer">
            <Icon><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
          </button>
          <nav className="sy-header__nav" aria-label="Main">{links}</nav>
        </div>
        <Link className="sy-header__logo" to="/" aria-label="SYORA home">SYORA</Link>
        <div className="sy-header__actions">
          <button type="button" className="sy-icon-btn" onClick={() => setSearch((v) => !v)} aria-label="Search" aria-expanded={search}>
            <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
          </button>
          <button type="button" className="sy-icon-btn" onClick={openCart} aria-label={`Bag, ${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`}>
            <Icon><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Icon>
            {totalQuantity > 0 && <span className="sy-count" aria-hidden="true">{totalQuantity}</span>}
          </button>
        </div>
      </header>

      {search && (
        <div className="sy-search" role="search">
          <form onSubmit={submit}>
            <label className="sy-vh" htmlFor="sy-q">Search SYORA</label>
            <input id="sy-q" ref={inputRef} name="q" className="sy-input" type="search" placeholder="Search by name, style or colour" autoComplete="off" />
            <button className="sy-btn" type="submit">Search</button>
          </form>
        </div>
      )}

      {menu && <div className="sy-backdrop" onClick={() => setMenu(false)} aria-hidden="true" />}
      <aside id="sy-drawer" className={`sy-drawer${menu ? ' is-open' : ''}`} aria-label="Menu" aria-hidden={!menu}>
        <div className="sy-drawer__head">
          <span className="sy-header__logo" style={{ fontSize: '1.5rem' }}>SYORA</span>
          <button type="button" className="sy-icon-btn" onClick={() => setMenu(false)} aria-label="Close menu" tabIndex={menu ? 0 : -1}>
            <Icon><path d="M6 6l12 12M18 6 6 18" /></Icon>
          </button>
        </div>
        <nav aria-label="Menu links" style={{ display: 'grid' }}>
          <Link className="sy-nav__link" to="/" tabIndex={menu ? 0 : -1} aria-current={current('/')}>Home</Link>
          {UNIVERSE_ORDER.map((id) => (
            <Link key={id} className="sy-nav__link" to={`/universe/${id}`} tabIndex={menu ? 0 : -1} aria-current={current(`/universe/${id}`)}>
              <span className="sy-num">{UNIVERSES[id].num}</span>{UNIVERSES[id].name}
            </Link>
          ))}
          <Link className="sy-nav__link" to="/shop" tabIndex={menu ? 0 : -1} aria-current={current('/shop')}>Shop all</Link>
        </nav>
      </aside>
    </>
  );
}
