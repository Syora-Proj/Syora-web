import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchProducts } from '../lib/shopify/search';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';
import { clearRecentSearches, readRecentSearches, saveRecentSearch } from '../lib/recentSearches';
import './SearchOverlay.css';

const SUGGESTIONS = ['Heels', 'Juttis', 'Flats', 'Sneakers'];

/**
 * SYORA — search panel (opened from the header).
 * A sheet that drops from the top: a large serif field, quick ways in (collections, recent and
 * suggested searches) and live results with photos and prices. Enter / "View all" opens /search.
 */
export default function SearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [recent, setRecent] = useState([]);
  const [state, setState] = useState({ status: 'idle', items: [] }); // idle | loading | done | error
  const inputRef = useRef(null);
  const q = term.trim();

  useEffect(() => {
    if (!open) return undefined;
    setRecent(readRecentSearches());
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    if (q.length < 2) { setState({ status: 'idle', items: [] }); return undefined; }
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    const t = window.setTimeout(async () => {
      try {
        const items = await searchProducts(q, 4);
        if (!cancelled) setState({ status: 'done', items });
      } catch {
        if (!cancelled) setState({ status: 'error', items: [] });
      }
    }, 260);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [q, open]);

  if (!open) return null;
  const { status, items } = state;

  const go = (value) => {
    const v = String(value || '').trim();
    if (v.length < 2) return;
    saveRecentSearch(v);
    onClose();
    navigate(`/search?q=${encodeURIComponent(v)}`);
  };
  const pick = (value) => { setTerm(value); inputRef.current?.focus(); };

  return (
    <div className="srch" role="dialog" aria-modal="true" aria-label="Search SYORA">
      <button type="button" className="srch__backdrop" aria-label="Close search" onClick={onClose} tabIndex={-1} />
      <div className="srch__sheet">
        <div className="srch__inner">
          <div className="srch__top">
            <p className="srch__eyebrow">SEARCH SYORA</p>
            <button type="button" className="srch__close" onClick={onClose} aria-label="Close search">
              <span>Esc</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
          </div>

          <form className="srch__form" role="search" onSubmit={(e) => { e.preventDefault(); go(q); }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              ref={inputRef}
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search heels, juttis, flats…"
              aria-label="Search products"
              autoComplete="off"
              enterKeyHint="search"
            />
            {term && (
              <button type="button" className="srch__clear" onClick={() => { setTerm(''); inputRef.current?.focus(); }} aria-label="Clear search">Clear</button>
            )}
          </form>

          <div className="srch__body" aria-live="polite">
            {q.length < 2 && (
              <div className="srch__start">
                <div className="srch__block">
                  <p className="srch__label">Browse by collection</p>
                  <ul className="srch__cols">
                    {UNIVERSE_ORDER.map((id) => (
                      <li key={id}>
                        <Link to={`/universe/${id}`} className="srch__col" onClick={onClose}>
                          <span className="srch__col-img"><img src={`/universe-cards/${id}.webp`} alt="" loading="lazy" /></span>
                          <span className="srch__col-name">{UNIVERSES[id].name}</span>
                          <span className="srch__col-tag">{UNIVERSES[id].tagline}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="srch__chips">
                  {recent.length > 0 && (
                    <div className="srch__block">
                      <p className="srch__label">
                        Recent
                        <button type="button" className="srch__linkbtn" onClick={() => { clearRecentSearches(); setRecent([]); }}>Clear</button>
                      </p>
                      <ul className="srch__chiplist">
                        {recent.map((r) => (<li key={r}><button type="button" className="srch__chip" onClick={() => pick(r)}>{r}</button></li>))}
                      </ul>
                    </div>
                  )}
                  <div className="srch__block">
                    <p className="srch__label">Try searching for</p>
                    <ul className="srch__chiplist">
                      {SUGGESTIONS.map((s) => (<li key={s}><button type="button" className="srch__chip" onClick={() => pick(s)}>{s}</button></li>))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {q.length >= 2 && status === 'loading' && (
              <ul className="srch__results" aria-hidden="true">
                {Array.from({ length: 4 }, (_, i) => (<li key={i} className="srch__skel"><span /><span /></li>))}
              </ul>
            )}
            {q.length >= 2 && status === 'error' && <p className="srch__hint">We couldn't search right now. Please try again in a moment.</p>}
            {q.length >= 2 && status === 'done' && items.length === 0 && (
              <div className="srch__empty">
                <p className="srch__hint">No styles found for “{q}”. Try a simpler word, or browse a collection:</p>
                <ul className="srch__chiplist">
                  {SUGGESTIONS.map((s) => (<li key={s}><button type="button" className="srch__chip" onClick={() => pick(s)}>{s}</button></li>))}
                </ul>
              </div>
            )}
            {q.length >= 2 && status === 'done' && items.length > 0 && (
              <>
                <ul className="srch__results">
                  {items.map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${encodeURIComponent(p.handle)}`} className="srch__item" onClick={() => { saveRecentSearch(q); onClose(); }}>
                        <span className="srch__thumb">{p.img && <img src={p.img} alt="" loading="lazy" />}</span>
                        <span className="srch__name">{String(p.name || '').replace(/^syora\s+/i, '') || p.name}</span>
                        <span className="srch__price">{p.price}{p.availableForSale === false && ' · Sold out'}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button type="button" className="srch__all" onClick={() => go(q)}>
                  View all results for “{q}” <span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
