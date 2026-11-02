import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ProductCard } from './ProductGrid';
import ExploreMore from './ExploreMore';
import Footer from './Footer';
import Navbar from './Navbar';
import { UNIVERSES } from '../data/universes';
import { searchCatalog } from '../lib/shopify/catalog';
import { saveRecentSearch } from '../lib/recentSearches';
import { useAsyncData } from '../hooks/useAsyncData';
import './SearchPage.css';

const SUGGESTIONS = ['Heels', 'Juttis', 'Flats', 'Sneakers'];

/** SYORA — search results (/search?q=…): the full grid for a term typed in the header search. */
export default function SearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const [draft, setDraft] = useState(q);
  const { data, loading, error } = useAsyncData(() => searchCatalog(q, 48), [q], q.length >= 2);
  const { palette } = UNIVERSES.icon;

  useEffect(() => { setDraft(q); }, [q]);
  useEffect(() => { if (q.length >= 2) saveRecentSearch(q); }, [q]);

  const submit = (e) => {
    e.preventDefault();
    const v = draft.trim();
    if (v.length >= 2) navigate(`/search?q=${encodeURIComponent(v)}`);
  };
  const results = q.length >= 2 ? (data || []) : [];

  return (
    <div
      className="universe-page"
      style={{ '--u-bg': palette.bg, '--u-accent': palette.accent, '--u-text': palette.text, '--u-muted': palette.muted, '--u-border': palette.border }}
    >
      <title>{q ? `Search: ${q} — SYORA` : 'Search — SYORA'}</title>
      <meta name="robots" content="noindex" />
      <Navbar universeMode solid />

      <main id="main" className="sp">
        <div className="sp__inner">
          <p className="sp__eyebrow">SEARCH</p>
          <h1 className="sp__title">{q.length >= 2 ? <>Results for <em>“{q}”</em></> : 'What are you looking for?'}</h1>

          <form className="sp__form" role="search" onSubmit={submit}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Search heels, juttis, flats…" aria-label="Search products" autoComplete="off" enterKeyHint="search" />
            <button type="submit" className="sp__go">Search</button>
          </form>

          {q.length >= 2 && !loading && !error && (
            <p className="sp__count" role="status">{results.length === 0 ? 'No matching styles' : `${results.length} ${results.length === 1 ? 'style' : 'styles'}`}</p>
          )}

          {loading && q.length >= 2 && (
            <div className="u-products-loading" role="status" aria-label="Searching"><div className="u-loading-spinner" /></div>
          )}
          {error && <p className="sp__msg" role="alert">We couldn't search right now. Please try again in a moment.</p>}

          {results.length > 0 && (
            <div className="product-grid__cards sp__grid">
              {results.map((p) => (<ProductCard key={p.id} product={{ ...p, imgHover: p.imgSecond || p.imgHover }} />))}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="sp__empty">
              <p className="sp__msg">{q.length >= 2 ? 'Try a simpler word, or start from one of these:' : 'Type at least two letters, or start from one of these:'}</p>
              <ul className="sp__chips">
                {SUGGESTIONS.map((s) => (<li key={s}><Link className="sp__chip" to={`/search?q=${encodeURIComponent(s)}`}>{s}</Link></li>))}
                <li><Link className="sp__chip sp__chip--solid" to="/shop">Browse all products</Link></li>
              </ul>
            </div>
          )}
        </div>
      </main>

      <ExploreMore currentId={null} />
      <Footer />
    </div>
  );
}
