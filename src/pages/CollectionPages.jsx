import { useCallback } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import Shell from '../components/Shell';
import Seo, { breadcrumbLd } from '../components/Seo';
import CollectionTemplate from '../components/CollectionTemplate';
import { HeroPicture } from '../components/Picture';
import { UNIVERSES, isUniverse } from '../data/universes';
import { CATEGORIES } from '../config/site';
import { fetchCollectionPage, fetchAllProductsPage, fetchSearchPage } from '../lib/shopify/catalog';

const Em = ({ text, word }) => {
  const i = word ? text.indexOf(word) : -1;
  if (i < 0) return text;
  return <>{text.slice(0, i)}<em className="sy-em">{word}</em>{text.slice(i + word.length)}</>;
};

function PageHead({ eyebrow, title, intro, children }) {
  return (
    <div className="sy-container" style={{ paddingTop: 'clamp(40px, 6vw, 88px)', paddingBottom: 'clamp(24px, 4vw, 48px)' }}>
      <div className="sy-intro">
        <div>
          {eyebrow && <p className="sy-label sy-muted" style={{ marginBottom: 16 }}>{eyebrow}</p>}
          <h1 className="sy-h1">{title}</h1>
        </div>
        {intro && <p className="sy-lead sy-muted">{intro}</p>}
      </div>
      {children}
    </div>
  );
}

function CategoryChips({ active }) {
  return (
    <nav className="sy-chips" aria-label="Categories" style={{ marginTop: 32 }}>
      <Link className="sy-chip" to="/shop" aria-current={active === 'all' ? 'true' : undefined}>All</Link>
      {CATEGORIES.map((c) => (
        <Link key={c.id} className="sy-chip" to={`/shop/${c.id}`} aria-current={active === c.id ? 'true' : undefined}>{c.name}</Link>
      ))}
    </nav>
  );
}

/* ── Universe: /universe/:id — a Shopify collection with the same handle ── */
export function UniversePage({ universe }) {
  const u = UNIVERSES[universe];
  const fetchPage = useCallback((a) => fetchCollectionPage({ handle: universe, ...a }), [universe]);
  return (
    <Shell over universe={universe}>
      <Seo title={`${u.name} — ${u.tagline}`} description={u.intro} path={`/universe/${universe}`}
        image={`/img/hero-${universe}-1440.webp`}
        jsonLd={breadcrumbLd([{ name: 'Home', path: '/' }, { name: u.name, path: `/universe/${universe}` }])} />
      <CollectionTemplate
        id={`u-${universe}`} fetchPage={fetchPage} soon={u.soon}
        emptyText={u.soon}
        header={
          <>
            <section className="sy-hero sy-hero--chapter" aria-labelledby="u-title">
              <div className="sy-hero__media"><HeroPicture id={universe} alt={u.alt} priority pos={u.pos} /></div>
              <div className="sy-hero__scrim" /><div className="sy-hero__frame" />
              <div className="sy-container sy-hero__content">
                <span className="sy-hero__eyebrow sy-label"><span className="sy-num">{u.num}</span> Chapter · {u.name}</span>
                <h1 id="u-title" className="sy-display sy-hero__title"><Em text={u.headline} word={u.emphasis} /></h1>
                <p className="sy-hero__sub">{u.intro}</p>
              </div>
            </section>
            <div className="sy-container" style={{ paddingBlock: 'clamp(32px, 4vw, 56px) 0' }}>
              <p className="sy-label sy-muted">Browse another universe</p>
              <nav className="sy-chips" aria-label="Universes" style={{ marginTop: 14 }}>
                {Object.values(UNIVERSES).map((x) => (
                  <Link key={x.id} className="sy-chip" to={`/universe/${x.id}`} aria-current={x.id === universe ? 'true' : undefined}>{x.name}</Link>
                ))}
              </nav>
            </div>
          </>
        }
      />
    </Shell>
  );
}

/* ── Category: /shop/:category ── */
export function CategoryPage() {
  const { category } = useParams();
  const cat = CATEGORIES.find((c) => c.id === category);
  const handle = cat?.handle || '';
  const fetchPage = useCallback((a) => fetchCollectionPage({ handle, ...a }), [handle]);
  if (!cat) return <Navigate to="/shop" replace />;
  return (
    <Shell>
      <Seo title={cat.name} description={`Shop ${cat.name.toLowerCase()} from SYORA, contemporary design-led women’s footwear.`} path={`/shop/${cat.id}`}
        jsonLd={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }, { name: cat.name, path: `/shop/${cat.id}` }])} />
      <CollectionTemplate
        id={`c-${cat.id}`} fetchPage={fetchPage} soon={`${cat.name} are coming soon.`}
        header={<PageHead eyebrow="Shop by category" title={cat.name}><CategoryChips active={cat.id} /></PageHead>}
      />
    </Shell>
  );
}

/* ── Shop: /shop ── */
export function ShopPage() {
  return (
    <Shell>
      <Seo title="Shop all" description="Every SYORA style: contemporary, design-led women’s footwear." path="/shop"
        jsonLd={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }])} />
      <CollectionTemplate
        id="shop" fetchPage={fetchAllProductsPage} filterable={false} emptyText="New styles are on their way."
        header={<PageHead eyebrow="The collection" title="Shop all"><CategoryChips active="all" /></PageHead>}
      />
    </Shell>
  );
}

/* ── Search: /search?q= ── */
export function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const fetchPage = useCallback((a) => (q ? fetchSearchPage({ query: q, ...a }) : Promise.resolve({ items: [], hasMore: false, cursor: null, filters: [], collection: { title: 'Search' } })), [q]);
  return (
    <Shell>
      <Seo title={q ? `Search: ${q}` : 'Search'} path="/search" noindex />
      <CollectionTemplate
        id={`s-${q}`} fetchPage={fetchPage}
        emptyText={q ? `No styles found for “${q}”. Try a colour, a heel height or a category.` : 'Type something to search.'}
        header={<PageHead eyebrow="Search" title={q ? <>Results for <em className="sy-em">“{q}”</em></> : 'Search'} />}
      />
    </Shell>
  );
}

export { isUniverse };
