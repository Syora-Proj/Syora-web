import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFeed } from '../hooks/useCatalog';
import { SORTS } from '../lib/shopify/catalog';
import ProductGrid, { GridSkeleton } from './ProductGrid';

/**
 * One template for universe, category, shop and search pages.
 * `fetchPage({ after, sort, filters })` supplies the data; this component owns
 * sort, filters, pagination and the loading / error / empty states.
 * `soon` is rendered when the collection does not exist yet in Shopify.
 */
export default function CollectionTemplate({ id, fetchPage, filterable = true, header, chips, soon, emptyText = 'Nothing here yet.' }) {
  const [params, setParams] = useSearchParams();
  const sort = SORTS.some((s) => s.id === params.get('sort')) ? params.get('sort') : 'featured';
  const [selected, setSelected] = useState([]); // array of JSON input strings
  const [open, setOpen] = useState(false);
  const facetsRef = useRef([]);
  const key = `${id}|${sort}|${selected.join('~')}`;

  useEffect(() => { setSelected([]); facetsRef.current = []; }, [id]);

  const load = useCallback((after) => fetchPage({ after, sort, filters: selected }), [fetchPage, sort, selected]);
  const feed = useFeed(load, key);

  if (!selected.length && feed.filters.length) facetsRef.current = feed.filters;
  const facets = filterable ? (selected.length ? facetsRef.current : feed.filters) : [];

  const toggle = (input) => setSelected((cur) => (cur.includes(input) ? cur.filter((x) => x !== input) : [...cur, input]));
  const setSort = (v) => { const n = new URLSearchParams(params); if (v === 'featured') n.delete('sort'); else n.set('sort', v); setParams(n, { replace: true }); };

  const closeRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const k = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  const missing = !feed.loading && !feed.failed && feed.collection === null && soon;
  const sortLabel = useMemo(() => SORTS.find((s) => s.id === sort)?.label, [sort]);

  return (
    <>
      {header}
      <section className="sy-section sy-section--tight" style={{ paddingTop: 0 }}>
        <div className="sy-container">
          {chips}
          {missing ? (
            <div className="sy-state" role="status">
              <p className="sy-label sy-muted">Coming soon</p>
              <h2 className="sy-state__title">{soon}</h2>
              <Link className="sy-btn sy-btn--secondary" to="/shop">Shop everything</Link>
            </div>
          ) : (
            <>
              <div className="sy-toolbar">
                <div className="sy-toolbar__group">
                  {facets.length > 0 && (
                    <button type="button" className="sy-chip" onClick={() => setOpen(true)} aria-haspopup="dialog">
                      Filter{selected.length ? ` (${selected.length})` : ''}
                    </button>
                  )}
                  {selected.length > 0 && <button type="button" className="sy-link" onClick={() => setSelected([])}>Clear filters</button>}
                  <span className="sy-small sy-muted" role="status" aria-live="polite">
                    {feed.loading ? 'Loading…' : `${feed.items.length}${feed.hasMore ? '+' : ''} ${feed.items.length === 1 ? 'style' : 'styles'}`}
                  </span>
                </div>
                <div className="sy-toolbar__group">
                  <label className="sy-label" htmlFor={`sort-${id}`}>Sort</label>
                  <select id={`sort-${id}`} className="sy-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label={`Sort products, currently ${sortLabel}`}>
                    {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {feed.loading && <GridSkeleton />}
              {feed.failed && (
                <div className="sy-state" role="alert">
                  <h2 className="sy-state__title">We could not load the products.</h2>
                  <p className="sy-muted">Check your connection and try again.</p>
                  <button type="button" className="sy-btn" onClick={() => window.location.reload()}>Try again</button>
                </div>
              )}
              {!feed.loading && !feed.failed && feed.items.length === 0 && (
                <div className="sy-state" role="status">
                  <h2 className="sy-state__title">{selected.length ? 'No styles match those filters.' : emptyText}</h2>
                  {selected.length > 0 && <button type="button" className="sy-btn sy-btn--secondary" onClick={() => setSelected([])}>Clear filters</button>}
                </div>
              )}
              {feed.items.length > 0 && <ProductGrid products={feed.items} label="Products" />}
              {feed.hasMore && (
                <div className="sy-more">
                  <button type="button" className="sy-btn sy-btn--secondary" onClick={feed.loadMore} disabled={feed.more}>
                    {feed.more ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {open && <div className="sy-backdrop" onClick={() => setOpen(false)} aria-hidden="true" style={{ zIndex: 440 }} />}
      <aside className={`sy-filters${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Filters" aria-hidden={!open}>
        <div className="sy-drawer__head">
          <h2 className="sy-h3" style={{ margin: 0 }}>Filter</h2>
          <button ref={closeRef} type="button" className="sy-icon-btn" onClick={() => setOpen(false)} aria-label="Close filters" tabIndex={open ? 0 : -1}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        {facets.map((f) => (
          <fieldset key={f.id}>
            <legend>{f.label}</legend>
            {f.values.map((v) => (
              <label key={v.id} className="sy-check">
                <input type="checkbox" checked={selected.includes(v.input)} onChange={() => toggle(v.input)} tabIndex={open ? 0 : -1} />
                <span>{v.label}{typeof v.count === 'number' ? ` (${v.count})` : ''}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <button type="button" className="sy-btn sy-btn--block" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          Show {feed.items.length}{feed.hasMore ? '+' : ''} styles
        </button>
      </aside>
    </>
  );
}
