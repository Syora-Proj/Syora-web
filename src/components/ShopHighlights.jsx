import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from './ProductGrid';
import { getBestSellers, getNewArrivals } from '../lib/shopify/catalog';
import { useAsyncData } from '../hooks/useAsyncData';
import './ShopHighlights.css';

const TABS = [
  { id: 'best', label: 'Best Sellers', load: () => getBestSellers(8) },
  { id: 'new', label: 'New Arrivals', load: () => getNewArrivals(8) },
];

/**
 * SYORA — homepage "Best Sellers / New Arrivals" edit.
 * Real Shopify data only. It loads when the section is about to scroll into view, shows quiet
 * placeholders while loading, and hides itself entirely if the store has nothing to show.
 */
export default function ShopHighlights() {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const [tab, setTab] = useState('best');

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); }
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  const best = useAsyncData(TABS[0].load, [], near);
  const fresh = useAsyncData(TABS[1].load, [], near);
  const byTab = { best, new: fresh };

  const loaded = near && !best.loading && !fresh.loading;
  const available = TABS.filter((t) => (byTab[t.id].data || []).length > 0);
  // Nothing to show (or the store is unreachable): leave the page as it was.
  if (loaded && available.length === 0) return <div ref={ref} aria-hidden="true" />;

  const activeId = available.some((t) => t.id === tab) ? tab : (available[0]?.id || tab);
  const current = byTab[activeId];
  const items = (current.data || []).slice(0, 8);
  const isLoading = !loaded;

  return (
    <section ref={ref} className="hl pdp-related" aria-labelledby="hl-title">
      <div className="hl__inner">
        <header className="hl__head">
          <div>
            <p className="hl__eyebrow">THE EDIT</p>
            <h2 id="hl-title" className="hl__title">Loved Right Now</h2>
          </div>
          <div className="hl__side">
            {available.length > 1 && (
              <div className="hl__tabs" role="tablist" aria-label="Choose a selection">
                {available.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`hl-tab-${t.id}`}
                    aria-selected={activeId === t.id}
                    aria-controls="hl-panel"
                    className={`hl__tab${activeId === t.id ? ' is-active' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
            <Link to="/shop" className="hl__all">View all <span aria-hidden="true">→</span></Link>
          </div>
        </header>

        <ul id="hl-panel" className="hl__row" role="tabpanel" aria-labelledby={`hl-tab-${activeId}`} aria-busy={isLoading}>
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="hl__skeleton" aria-hidden="true"><span /><span /><span /></li>
            ))
            : items.map((p) => (
              <li key={p.id}>
                <ProductCard product={{ ...p, imgHover: p.imgSecond || p.imgHover }} badge={activeId === 'new' ? 'New' : null} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
