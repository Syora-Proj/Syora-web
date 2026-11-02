import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchProducts } from '../lib/shopify/search';
import './SearchOverlay.css';

/**
 * SYORA — product search panel (opened from the header).
 * Debounced live results from Shopify; Esc, the backdrop or a result closes it.
 */
export default function SearchOverlay({ open, onClose }) {
  const [term, setTerm] = useState('');
  const [state, setState] = useState({ status: 'idle', items: [] }); // idle | loading | done | error
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const q = term.trim();
    if (q.length < 2) { setState({ status: 'idle', items: [] }); return undefined; }
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    const t = window.setTimeout(async () => {
      try {
        const items = await searchProducts(q, 8);
        if (!cancelled) setState({ status: 'done', items });
      } catch {
        if (!cancelled) setState({ status: 'error', items: [] });
      }
    }, 280);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [term, open]);

  if (!open) return null;
  const { status, items } = state;

  return (
    <div className="srch" role="dialog" aria-modal="true" aria-label="Search SYORA">
      <button type="button" className="srch__backdrop" aria-label="Close search" onClick={onClose} tabIndex={-1} />
      <div className="srch__panel">
        <form className="srch__form" role="search" onSubmit={(e) => e.preventDefault()}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input ref={inputRef} type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search heels, juttis, sneakers…" aria-label="Search products" autoComplete="off" enterKeyHint="search" />
          <button type="button" className="srch__close" onClick={onClose} aria-label="Close search">Close</button>
        </form>

        <div className="srch__body" aria-live="polite">
          {status === 'idle' && <p className="srch__hint">Type at least two letters to search the collection.</p>}
          {status === 'loading' && <p className="srch__hint">Searching…</p>}
          {status === 'error' && <p className="srch__hint">We couldn't search right now. Please try again in a moment.</p>}
          {status === 'done' && items.length === 0 && <p className="srch__hint">No styles found for “{term.trim()}”. Try a different word, like “heel” or “flat”.</p>}
          {status === 'done' && items.length > 0 && (
            <ul className="srch__list">
              {items.map((p) => (
                <li key={p.id}>
                  <Link to={`/product/${encodeURIComponent(p.handle)}`} className="srch__item" onClick={onClose}>
                    <span className="srch__thumb">{p.img && <img src={p.img} alt="" loading="lazy" />}</span>
                    <span className="srch__meta">
                      <span className="srch__name">{String(p.name || '').replace(/^syora\s+/i, '') || p.name}</span>
                      <span className="srch__price">{p.price}{p.availableForSale === false && ' · Sold out'}</span>
                    </span>
                    <span className="srch__go" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
