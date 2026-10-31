import { useEffect, useRef, useState } from 'react';
import { EMPTY_FILTERS, countActiveFilters } from '../lib/collectionFilters';
import { facetGroups } from '../lib/facetGroups';

/**
 * SYORA — Collection filter drawer
 *
 * A right-hand drawer with collapsible groups. Selections apply immediately (the
 * count in the footer button updates live), so there is no separate "apply" step to
 * forget. Facets come from `buildFacets(products)`; empty facets are not rendered.
 *
 * Accessibility: role="dialog", Escape closes, focus moves in and is trapped while
 * open, page scroll is locked, and the opener restores focus on close.
 */
export default function FilterDrawer({ open, onClose, facets, filters, onChange, resultCount }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const focusable = panelRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const active = countActiveFilters(filters);
  const toggleGroup = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  const groups = facetGroups({ facets, filters, onChange });

  return (
    <div className={`fd${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="fd__backdrop" onClick={onClose} />
      <aside
        ref={panelRef}
        className="fd__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        inert={!open}
      >
        <header className="fd__head">
          <h3 className="fd__title">Filter</h3>
          <button ref={closeRef} type="button" className="fd__close" onClick={onClose} aria-label="Close filters">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </header>

        <div className="fd__body">
          {groups.map((g) => {
            const isOpen = !collapsed[g.id];
            return (
              <section key={g.id} className="fd-group">
                <h4 className="fd-group__head">
                  <button
                    type="button"
                    className="fd-group__toggle"
                    aria-expanded={isOpen}
                    aria-controls={`fd-${g.id}`}
                    onClick={() => toggleGroup(g.id)}
                  >
                    <span>{g.title}{g.count > 0 && <span className="fd-group__count"> · {g.count}</span>}</span>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" className={isOpen ? 'is-open' : ''}><path d="M2 4.5l4 4 4-4" /></svg>
                  </button>
                </h4>
                <div id={`fd-${g.id}`} className="fd-group__body" hidden={!isOpen}>{g.body}</div>
              </section>
            );
          })}
        </div>

        <footer className="fd__foot">
          <button
            type="button"
            className="fd__clear"
            onClick={() => onChange(EMPTY_FILTERS)}
            disabled={active === 0}
          >Clear all</button>
          <button type="button" className="fd__apply" onClick={onClose}>
            {resultCount === 0 ? 'No styles' : `View ${resultCount} ${resultCount === 1 ? 'style' : 'styles'}`}
          </button>
        </footer>
      </aside>
    </div>
  );
}
