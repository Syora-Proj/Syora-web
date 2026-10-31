import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWishlisted } from '../lib/wishlist';
import { colourHex } from '../lib/colours';
import {
  EMPTY_FILTERS,
  SORT_OPTIONS,
  applyFilters,
  buildFacets,
  countActiveFilters,
  meaningfulBadges,
  sortProducts,
} from '../lib/collectionFilters';
import FilterDrawer from './FilterDrawer';
import { facetGroups } from '../lib/facetGroups';

const MAX_SWATCHES = 5;

/**
 * SYORA — Reusable Product Card
 *
 * Hierarchy: image → (badge) → wishlist → name → price (+ MRP / discount) → colours.
 *
 * Structure (valid, keyboard-friendly markup):
 *   <article>
 *     image  -> <Link> (decorative duplicate of the title link, removed from tab order)
 *     badge, wishlist <button>  (siblings of the link, never nested inside it)
 *     title  -> <Link> (the one accessible tab stop for the card)
 *     price, colour swatches
 *
 * `badge` is resolved by the grid (see `meaningfulBadges`) so a label that sits on
 * most of the catalogue is not repeated on every card.
 */
export function ProductCard({ product, badge: badgeProp }) {
  const productHandle = product.handle || product.id;
  const productPath = `/product/${encodeURIComponent(productHandle)}`;
  const [wishlisted, toggleWishlist] = useWishlisted(productHandle);

  // The brand is already everywhere on SYORA's own site, so the card leads with the style name.
  const displayName = String(product.name || '').replace(/^syora\s+/i, '') || product.name;

  // Only show a "was" price when Shopify genuinely has a higher compare-at price.
  const hasRealDiscount =
    Number(product.originalPriceRaw) > 0 &&
    Number(product.originalPriceRaw) > Number(product.priceRaw || 0);
  const discount = hasRealDiscount
    ? product.discountPercent ||
      Math.round(((product.originalPriceRaw - product.priceRaw) / product.originalPriceRaw) * 100)
    : 0;
  const soldOut = product.availableForSale === false;
  const badge = soldOut ? 'Sold out' : (badgeProp ?? null);

  const colours = product.colours || [];
  const shownColours = colours.slice(0, MAX_SWATCHES);
  const extraColours = colours.length - shownColours.length;

  return (
    <article
      className={`product-card${soldOut ? ' product-card--soldout' : ''}${product.imgHover ? ' product-card--has-hover' : ''}`}
    >
      <div className="product-card__img-wrap">
        <Link to={productPath} className="product-card__media" tabIndex={-1} aria-hidden="true">
          <img
            src={product.img}
            alt=""
            className="product-card__img"
            loading="lazy"
            decoding="async"
          />
          {product.imgHover && (
            <img
              src={product.imgHover}
              alt=""
              className="product-card__img product-card__img--hover"
              loading="lazy"
              decoding="async"
            />
          )}
        </Link>
        {badge && <span className="product-card__badge">{badge}</span>}
        <button
          type="button"
          className={`product-card__wish ${wishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? `Remove ${displayName} from wishlist` : `Add ${displayName} to wishlist`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div className="product-card__info">
        <h3 className="product-card__name">
          <Link to={productPath} className="product-card__link">{displayName}</Link>
        </h3>
        <p className="product-card__price">
          <span className="product-card__price-now">{product.price}</span>
          {hasRealDiscount && (
            <>
              <s className="product-card__price-was" aria-label={`Original price ${product.originalPrice}`}>{product.originalPrice}</s>
              {discount > 0 && <span className="product-card__price-off">{discount}% off</span>}
            </>
          )}
        </p>
        {shownColours.length > 0 && (
          <ul className="product-card__swatches" aria-label={`Colours: ${colours.join(', ')}`}>
            {shownColours.map((c) => (
              <li key={c} className="product-card__swatch" style={{ background: colourHex(c) }} title={c} />
            ))}
            {extraColours > 0 && <li className="product-card__swatch-more" aria-hidden="true">+{extraColours}</li>}
          </ul>
        )}
      </div>
    </article>
  );
}

/* ── URL <-> filter state (so Back from a product page restores the view) ── */

const csv = (v) => (v ? v.split(',').map((x) => x.trim()).filter(Boolean) : []);

function readState(params, facets, priceBandIds) {
  const only = (list, allowed) => list.filter((x) => allowed.includes(x));
  const sort = params.get('sort');
  return {
    sort: SORT_OPTIONS.some((s) => s.id === sort) ? sort : 'featured',
    filters: {
      category: only(csv(params.get('category')), facets.category),
      size: only(csv(params.get('size')), facets.size),
      colour: only(csv(params.get('colour')), facets.colour),
      price: only(csv(params.get('price')), priceBandIds),
      inStockOnly: params.get('stock') === '1' && facets.availability,
    },
  };
}

/**
 * SYORA — Product Grid
 *
 * Two modes:
 *  • `browse` (the collection page): compact editorial header band (with the product
 *    count), a sticky inline bar — Filters, Category / Size / Colour / Price /
 *    Availability dropdowns, Sort — active-filter chips, and a filter drawer for
 *    small screens. Everything is derived from the live product data and kept in the URL.
 *  • default (e.g. bestsellers): a quiet title and the same grid.
 *
 * Empty collections render a deliberate "coming soon" state; `onExploreOthers` adds a
 * way onward to the other universes.
 */
export default function ProductGrid({
  title,
  description,
  products = [],
  viewAllLabel = 'View all →',
  viewAllHref,
  universeId,
  browse = false,
  band,
  onExploreOthers,
}) {
  const titleId = `grid-title-${universeId}-${slug(title)}`;
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // 'category' | … | 'sort' | null
  const filterBtnRef = useRef(null);
  const barRef = useRef(null);

  const facets = useMemo(() => buildFacets(products), [products]);
  const priceBandIds = useMemo(() => facets.price.map((b) => b.id), [facets]);

  // Browse mode derives its state from the URL; other grids ignore it entirely.
  const { sort, filters } = useMemo(
    () => (browse ? readState(searchParams, facets, priceBandIds) : { sort: 'featured', filters: EMPTY_FILTERS }),
    [browse, searchParams, facets, priceBandIds],
  );

  const commit = useCallback(
    (nextFilters, nextSort) => {
      const next = new URLSearchParams(searchParams);
      const put = (key, list) => (list.length ? next.set(key, list.join(',')) : next.delete(key));
      put('category', nextFilters.category);
      put('size', nextFilters.size);
      put('colour', nextFilters.colour);
      put('price', nextFilters.price);
      if (nextFilters.inStockOnly) next.set('stock', '1'); else next.delete('stock');
      if (nextSort && nextSort !== 'featured') next.set('sort', nextSort); else next.delete('sort');
      setSearchParams(next, { replace: true, preventScrollReset: true });
    },
    [searchParams, setSearchParams],
  );

  const visible = useMemo(() => {
    if (!browse) return products;
    return sortProducts(applyFilters(products, filters, facets.price), sort);
  }, [browse, products, filters, sort, facets.price]);

  // Close any open dropdown on outside click / Escape.
  useEffect(() => {
    if (!openMenu) return undefined;
    const onDown = (e) => { if (!barRef.current?.contains(e.target)) setOpenMenu(null); };
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const trigger = barRef.current?.querySelector(`[data-menu="${openMenu}"]`);
      setOpenMenu(null);
      trigger?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  const activeCount = countActiveFilters(filters);
  const groups = facetGroups({ facets, filters, onChange: (next) => commit(next, sort) });

  const keepBadges = useMemo(() => meaningfulBadges(products), [products]);
  const badgeFor = (p) => (p.badge && keepBadges.has(p.badge) ? titleCaseBadge(p.badge) : null);

  const count = products.length;
  const noun = count === 1 ? 'Product' : 'Products';
  const countLabel = activeCount > 0 ? `${visible.length} of ${count} ${noun}` : `${count} ${noun}`;

  // Chips for each active filter
  const chips = [
    ...filters.category.map((v) => ({ key: `category:${v}`, group: 'category', value: v, label: v })),
    ...filters.size.map((v) => ({ key: `size:${v}`, group: 'size', value: v, label: `Size ${v}` })),
    ...filters.colour.map((v) => ({ key: `colour:${v}`, group: 'colour', value: v, label: v })),
    ...filters.price.map((v) => ({
      key: `price:${v}`, group: 'price', value: v, label: facets.price.find((b) => b.id === v)?.label || v,
    })),
    ...(filters.inStockOnly ? [{ key: 'stock', group: 'inStockOnly', value: true, label: 'In stock' }] : []),
  ];
  const removeChip = (chip) => {
    const next = { ...filters };
    if (chip.group === 'inStockOnly') next.inStockOnly = false;
    else next[chip.group] = filters[chip.group].filter((x) => x !== chip.value);
    commit(next, sort);
  };

  const Heading = browse ? 'h1' : 'h2';

  return (
    <section className={`product-grid${browse ? ' product-grid--browse' : ''}`} aria-labelledby={titleId}>
      {browse && band ? (
        <div className="plp-band">
          <div className="plp-band__media" aria-hidden="true">
            <img src={band.image} alt="" style={band.position ? { objectPosition: band.position } : undefined} />
          </div>
          <div className="plp-band__inner">
            {band.eyebrow && <p className="plp-band__eyebrow">{band.eyebrow}</p>}
            <Heading id={titleId} className="plp-band__title">{title}</Heading>
            {description && <p className="plp-band__desc">{description}</p>}
            <p className="plp-band__count" role="status" aria-live="polite">{countLabel}</p>
          </div>
        </div>
      ) : (
        <div className="product-grid__inner product-grid__header">
          <div className="product-grid__heading">
            <Heading id={titleId} className="product-grid__title">{title}</Heading>
            {description && <p className="product-grid__desc">{description}</p>}
          </div>
          {viewAllHref && (
            <Link className="product-grid__view-all" to={viewAllHref} aria-label={`${viewAllLabel} for ${title}`}>
              {viewAllLabel}
            </Link>
          )}
        </div>
      )}

      {browse && count > 0 && (
        <div className="plp-bar" ref={barRef}>
          <div className="plp-bar__inner">
            <button
              ref={filterBtnRef}
              type="button"
              className="plp-bar__btn plp-bar__btn--filters"
              onClick={() => { setOpenMenu(null); setDrawerOpen(true); }}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" />
              </svg>
              <span>Filters{activeCount > 0 ? ` (${activeCount})` : ''}</span>
            </button>

            {groups.length > 0 && <span className="plp-bar__div plp-bar__facet-only" aria-hidden="true" />}
            <div className="plp-bar__facets">
              {groups.map((g) => (
                <div className="plp-menu" key={g.id}>
                  <button
                    type="button"
                    className={`plp-bar__btn${g.count > 0 ? ' has-value' : ''}`}
                    data-menu={g.id}
                    aria-haspopup="true"
                    aria-expanded={openMenu === g.id}
                    onClick={() => setOpenMenu(openMenu === g.id ? null : g.id)}
                  >
                    <span>{g.title}{g.count > 0 ? ` (${g.count})` : ''}</span>
                    <Chevron open={openMenu === g.id} />
                  </button>
                  {openMenu === g.id && (
                    <div className="plp-pop" role="group" aria-label={`Filter by ${g.title.toLowerCase()}`}>{g.body}</div>
                  )}
                </div>
              ))}
            </div>

            <span className="plp-bar__spacer" />
            <span className="plp-bar__div" aria-hidden="true" />
            <div className="plp-menu plp-menu--sort">
              <button
                type="button"
                className="plp-bar__btn plp-bar__btn--sort"
                data-menu="sort"
                aria-haspopup="listbox"
                aria-expanded={openMenu === 'sort'}
                onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
              >
                <span className="plp-bar__sort-label">Sort by</span>
                <span className="plp-bar__sort-value">{(SORT_OPTIONS.find((s) => s.id === sort) || SORT_OPTIONS[0]).label}</span>
                <Chevron open={openMenu === 'sort'} />
              </button>
              {openMenu === 'sort' && (
                <ul className="plp-pop plp-pop--right plp-sort__menu" role="listbox" aria-label="Sort products">
                  {SORT_OPTIONS.map((opt) => (
                    <li key={opt.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={opt.id === sort}
                        className={`plp-sort__opt${opt.id === sort ? ' is-active' : ''}`}
                        onClick={() => { commit(filters, opt.id); setOpenMenu(null); }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="product-grid__inner">
        {browse && count > 0 && chips.length > 0 && (
          <ul className="plp-chips" aria-label="Active filters">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button type="button" className="plp-chip" onClick={() => removeChip(chip)} aria-label={`Remove filter ${chip.label}`}>
                  {chip.label}<span aria-hidden="true"> ×</span>
                </button>
              </li>
            ))}
            <li>
              <button type="button" className="plp-chips__clear" onClick={() => commit(EMPTY_FILTERS, sort)}>Clear all</button>
            </li>
          </ul>
        )}

        {visible.length > 0 ? (
          <div className="product-grid__cards">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={{ ...p, imgHover: p.imgSecond || p.imgHover }}
                badge={badgeFor(p)}
              />
            ))}
          </div>
        ) : count > 0 ? (
          <div className="product-grid__empty product-grid__empty--filtered" role="status">
            <p className="product-grid__empty-title">No styles match these filters</p>
            <button type="button" className="product-grid__empty-cta" onClick={() => commit(EMPTY_FILTERS, sort)}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="product-grid__empty" role="status">
            <p className="product-grid__empty-eyebrow">COMING SOON</p>
            <p className="product-grid__empty-title">Universe in creation, personalised for you</p>
            {onExploreOthers && (
              <button type="button" className="product-grid__empty-cta" onClick={onExploreOthers}>
                Explore other universes ↓
              </button>
            )}
          </div>
        )}
      </div>

      {browse && count > 0 && (
        <FilterDrawer
          open={drawerOpen}
          onClose={() => { setDrawerOpen(false); filterBtnRef.current?.focus(); }}
          facets={facets}
          filters={filters}
          onChange={(next) => commit(next, sort)}
          resultCount={visible.length}
        />
      )}
    </section>
  );
}

function Chevron({ open }) {
  return (
    <svg className={`plp-chev${open ? ' is-open' : ''}`} width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2 4.5l4 4 4-4" />
    </svg>
  );
}

function titleCaseBadge(text = '') {
  const t = String(text).toLowerCase().replace(/_/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function slug(text = '') {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
