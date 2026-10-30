import { Link } from 'react-router-dom';
import Shell from '../components/Shell';
import Seo, { organizationLd, websiteLd } from '../components/Seo';
import ProductGrid, { GridSkeleton } from '../components/ProductGrid';
import { HeroPicture, PortraitPicture } from '../components/Picture';
import { useNewIn, useCategories } from '../hooks/useCatalog';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';
import { CATEGORIES, TRUST } from '../config/site';
import { imgUrl } from '../lib/shopify/images';

export default function Home() {
  const { data: fresh, loading: freshLoading, failed: freshFailed } = useNewIn(8);
  const { data: cats } = useCategories(CATEGORIES);
  const byId = Object.fromEntries(cats.map((c) => [c.id, c]));

  return (
    <Shell over>
      <Seo path="/" jsonLd={[organizationLd(), websiteLd()]} />

      <section className="sy-hero" aria-labelledby="home-title" data-universe="icon">
        <div className="sy-hero__media"><HeroPicture id="icon" alt={UNIVERSES.icon.alt} priority pos={UNIVERSES.icon.pos} /></div>
        <div className="sy-hero__scrim" /><div className="sy-hero__frame" />
        <div className="sy-container sy-hero__content">
          <span className="sy-hero__eyebrow sy-label">Contemporary, design-led women’s footwear</span>
          <h1 id="home-title" className="sy-display sy-hero__title">One woman. <em className="sy-em">Infinite</em> versions.</h1>
          <p className="sy-hero__sub">Four universes of footwear, from heels with a point of view to the pairs you reach for every day.</p>
          <div className="sy-hero__actions">
            <Link className="sy-btn sy-btn--ondark" to="/universe/icon">Enter ICON</Link>
            <a className="sy-link" href="#universes">Explore all four universes</a>
          </div>
        </div>
        <p className="sy-caption sy-hero__caption">01 · ICON<br />Walk into any room first.</p>
      </section>

      <section className="sy-section" aria-labelledby="new-in">
        <div className="sy-container">
          <div className="sy-head">
            <h2 id="new-in" className="sy-h2">New <em className="sy-em">in</em></h2>
            <Link className="sy-link" to="/shop?sort=newest">Shop all</Link>
          </div>
          {freshLoading && <GridSkeleton count={4} />}
          {freshFailed && <div className="sy-state" role="alert"><p className="sy-state__title">New arrivals could not be loaded.</p><Link className="sy-btn sy-btn--secondary" to="/shop">Browse the shop</Link></div>}
          {!freshLoading && !freshFailed && fresh.length === 0 && <div className="sy-state"><p className="sy-state__title">New styles are on their way.</p></div>}
          {fresh.length > 0 && <ProductGrid products={fresh} label="New arrivals" />}
        </div>
      </section>

      <section id="universes" className="sy-section sy-dark" aria-labelledby="uni">
        <div className="sy-container">
          <div className="sy-head">
            <h2 id="uni" className="sy-h2">Four universes, <em className="sy-em">one</em> wardrobe</h2>
          </div>
          <div className="sy-chapters">
            {UNIVERSE_ORDER.map((id) => {
              const u = UNIVERSES[id];
              return (
                <Link key={id} to={`/universe/${id}`} className="sy-chapter">
                  <PortraitPicture id={id} alt="" pos={u.pos} />
                  <div className="sy-chapter__scrim" /><div className="sy-chapter__frame" />
                  <div className="sy-chapter__body">
                    <span className="sy-num sy-chapter__num">{u.num}</span>
                    <span className="sy-chapter__name">{u.name}</span>
                    <span className="sy-chapter__tag">{u.tagline}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sy-section" aria-labelledby="cats">
        <div className="sy-container">
          <div className="sy-head"><h2 id="cats" className="sy-h2">Shop by <em className="sy-em">category</em></h2></div>
          <div className="sy-tiles">
            {CATEGORIES.map((c) => {
              const got = byId[c.id];
              const live = got?.exists;
              const body = (
                <>
                  {live && got.image?.url && <img className="sy-tile__img" src={imgUrl(got.image.url, 640)} alt="" width="640" height="800" loading="lazy" decoding="async" />}
                  <span className="sy-tile__label"><span className="sy-tile__name">{c.name}</span>{!live && <span className="sy-label">Coming soon</span>}</span>
                </>
              );
              return live
                ? <Link key={c.id} className="sy-tile" to={`/shop/${c.id}`}>{body}</Link>
                : <div key={c.id} className="sy-tile sy-tile--soon" aria-label={`${c.name}, coming soon`}>{body}</div>;
            })}
          </div>
        </div>
      </section>

      <section className="sy-section sy-sand" aria-labelledby="story">
        <div className="sy-container sy-story">
          <h2 id="story" className="sy-h2">Footwear for every <em className="sy-em">version</em> of you.</h2>
          <div className="sy-story__lines">
            <p>Some days call for a statement. Others for something you can forget you are wearing.</p>
            <p>SYORA is organised around that: four universes, each with its own point of view, designed to work together.</p>
          </div>
        </div>
      </section>

      <section className="sy-container" aria-label="Delivery, payment and support" style={{ paddingBlock: 'clamp(32px, 5vw, 64px)' }}>
        <div className="sy-trust">
          {TRUST.map((t) => (
            <div key={t.id} className="sy-trust__item"><p className="sy-label" style={{ margin: 0 }}>{t.label}</p><p>{t.text}</p></div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
