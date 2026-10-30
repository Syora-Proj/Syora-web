import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Shell from './Shell';
import Seo, { breadcrumbLd } from './Seo';
import ProductGrid from './ProductGrid';
import { useShopifyProduct } from '../hooks/useShopifyProduct';
import { useRecommendations } from '../hooks/useCatalog';
import { useCart } from '../context/CartContext';
import { imgUrl, imgSrcSet } from '../lib/shopify/images';
import { formatMoney } from '../lib/shopify/products';
import { UNIVERSES } from '../data/universes';
import { SITE, TRUST } from '../config/site';
import { trackViewItem, trackAddToCart } from '../lib/analytics';

const money = (amount, currency = 'INR') => formatMoney({ amount: String(amount), currencyCode: currency });

/** First value of every option that has exactly one value is pre-selected. */
const initialSelection = (options) =>
  Object.fromEntries(options.filter((o) => o.values.length === 1).map((o) => [o.name, o.values[0]]));

function findVariant(product, sel) {
  if (!product.options.length) return product.variants[0] || null;
  if (product.options.some((o) => !sel[o.name])) return null;
  return product.variants.find((v) => product.options.every((o) => v.options[o.name] === sel[o.name])) || null;
}

/** A value is selectable if some in-stock variant has it together with the other current picks. */
function valueAvailable(product, sel, optName, value) {
  return product.variants.some(
    (v) => v.available && v.options[optName] === value &&
      product.options.every((o) => o.name === optName || !sel[o.name] || v.options[o.name] === sel[o.name]),
  );
}

function Gallery({ images, name, index, setIndex }) {
  const img = images[index] || images[0];
  const go = (d) => setIndex((index + d + images.length) % images.length);
  const touch = useRef(null);
  if (!img) return <div className="sy-gallery"><div className="sy-gallery__stage" /></div>;
  return (
    <div className="sy-gallery" role="group" aria-roledescription="carousel" aria-label={`${name} photos`}>
      <div
        className="sy-gallery__stage"
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touch.current = null; }}
        onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); }}
      >
        <img
          key={img.url} src={imgUrl(img.url, 900)} srcSet={imgSrcSet(img.url, [480, 720, 900, 1200, 1600])} sizes="(min-width: 1000px) 56vw, 100vw"
          alt={img.altText || `${name}, photo ${index + 1} of ${images.length}`} width={img.width || 900} height={img.height || 1125}
          loading="eager" fetchPriority="high" decoding="async"
        />
        {images.length > 1 && (
          <>
            <button type="button" className="sy-gallery__arrow sy-gallery__arrow--prev" onClick={() => go(-1)} aria-label="Previous photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button>
            <button type="button" className="sy-gallery__arrow sy-gallery__arrow--next" onClick={() => go(1)} aria-label="Next photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="sy-gallery__thumbs">
          {images.map((im, i) => (
            <button key={im.url} type="button" className="sy-gallery__thumb" aria-current={i === index} aria-label={`Show photo ${i + 1}`} onClick={() => setIndex(i)}>
              <img src={imgUrl(im.url, 160)} alt="" width="64" height="80" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="sy-container sy-pdp" aria-busy="true" role="status" aria-label="Loading product">
      <div className="sy-skel" style={{ aspectRatio: '4 / 5' }} />
      <div style={{ display: 'grid', gap: 16 }}><div className="sy-skel" style={{ aspectRatio: 'auto', height: 48 }} /><div className="sy-skel" style={{ aspectRatio: 'auto', height: 28, width: '40%' }} /><div className="sy-skel" style={{ aspectRatio: 'auto', height: 120 }} /></div>
    </div>
  );
}

function Missing({ error, retry }) {
  return (
    <div className="sy-container sy-section">
      <div className="sy-state" role={error ? 'alert' : 'status'}>
        <h1 className="sy-state__title">{error ? 'We could not load this style.' : 'This style is no longer available.'}</h1>
        {error ? <button type="button" className="sy-btn" onClick={retry}>Try again</button> : <Link className="sy-btn" to="/shop">Shop all styles</Link>}
      </div>
    </div>
  );
}

export default function ProductPage({ handle }) {
  const { product, loading, error, retry } = useShopifyProduct(handle);
  return (
    <Shell>
      {loading ? <Loading /> : !product || error ? (
        <><Seo title="Style not found" path={`/product/${handle}`} noindex /><Missing error={error} retry={retry} /></>
      ) : <Detail key={product.id} product={product} />}
    </Shell>
  );
}

function Detail({ product }) {
  const { addToCart, openCart } = useCart();
  const [sel, setSel] = useState(() => initialSelection(product.options));
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [missing, setMissing] = useState('');
  const [sticky, setSticky] = useState(false);
  const buyRef = useRef(null);
  const { data: related } = useRecommendations(product.id);

  const variant = useMemo(() => findVariant(product, sel), [product, sel]);
  const price = variant ? Number(variant.price?.amount) : product.price;
  const was = variant ? Number(variant.compareAt?.amount || 0) : product.compareAt;
  const onSale = was > price;
  const soldOut = !product.availableForSale || (product.variants.length > 0 && !product.variants.some((v) => v.available));
  const universe = product.universeId && UNIVERSES[product.universeId];

  useEffect(() => { trackViewItem(product); }, [product]);

  // Selecting a variant with its own photo shows that photo.
  useEffect(() => {
    if (!variant?.image) return;
    const i = product.images.findIndex((im) => im.url === variant.image);
    if (i >= 0) setIndex(i);
  }, [variant, product.images]);

  useEffect(() => {
    const el = buyRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (name, value) => { setSel((s) => ({ ...s, [name]: s[name] === value ? undefined : value })); setMissing(''); setProblem(''); };

  const add = async () => {
    const need = product.options.find((o) => !sel[o.name]);
    if (need) {
      setMissing(need.name);
      document.getElementById(`opt-${need.name}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    if (!variant || !variant.available) { setProblem('That combination is not available. Please choose another.'); return; }
    setBusy(true); setProblem('');
    try {
      await addToCart(variant.id, 1);
      trackAddToCart({ ...product, price }, variant, 1);
      openCart();
    } catch {
      setProblem('We could not add this to your bag. Please try again.');
    } finally { setBusy(false); }
  };

  const label = soldOut ? 'Sold out' : busy ? 'Adding…' : 'Add to bag';
  const url = `/product/${product.handle}`;
  const crumbs = [{ name: 'Home', path: '/' }, ...(universe ? [{ name: universe.name, path: `/universe/${universe.id}` }] : [{ name: 'Shop', path: '/shop' }]), { name: product.name, path: url }];
  const desc = product.seoDescription || product.description.slice(0, 155) || `${product.name} from SYORA.`;
  const ld = [
    breadcrumbLd(crumbs),
    {
      '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description || desc,
      image: product.images.slice(0, 6).map((i) => i.url), brand: { '@type': 'Brand', name: product.vendor || SITE.name },
      offers: {
        '@type': 'AggregateOffer', priceCurrency: product.currency, lowPrice: Math.min(...product.variants.map((v) => Number(v.price?.amount) || product.price), product.price),
        highPrice: Math.max(...product.variants.map((v) => Number(v.price?.amount) || product.price), product.price), offerCount: product.variants.length || 1,
        availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: `${SITE.url}${url}`,
      },
    },
  ];

  const details = [...product.metafields];
  const material = details.find((d) => /material/i.test(d.label));

  return (
    <>
      <Seo title={product.seoTitle || product.name} description={desc} path={url} image={product.images[0]?.url} jsonLd={ld} />
      <div className="sy-container">
        <div className="sy-pdp" data-universe={product.universeId || undefined}>
          <div>
            <nav className="sy-crumbs" aria-label="Breadcrumb">
              {crumbs.map((c, i) => i < crumbs.length - 1
                ? <span key={c.path}><Link to={c.path}>{c.name}</Link> /</span>
                : <span key={c.path} aria-current="page">{c.name}</span>)}
            </nav>
            <Gallery images={product.images} name={product.name} index={index} setIndex={setIndex} />
          </div>

          <div className="sy-pdp__buy">
            {universe && <p className="sy-label sy-muted" style={{ marginBottom: 12 }}><span className="sy-num">{universe.num}</span> {universe.name}</p>}
            <h1 className="sy-pdp__title">{product.name}</h1>
            <p className="sy-pdp__price">
              <span>{money(price, product.currency)}</span>
              {onSale && <s className="sy-pdp__was">{money(was, product.currency)}</s>}
            </p>
            <p className="sy-pdp__tax">Inclusive of taxes where applicable. Delivery shown at checkout.</p>

            {product.options.map((o) => (
              <div key={o.name} id={`opt-${o.name}`} className={`sy-opt${missing === o.name ? ' sy-opt--error' : ''}`} role="group" aria-labelledby={`lbl-${o.name}`}>
                <div className="sy-opt__head">
                  <span id={`lbl-${o.name}`} className="sy-label">{o.name}<span className="sy-opt__value">{sel[o.name] || ''}</span></span>
                </div>
                <div className="sy-opt__btns">
                  {o.values.map((val) => {
                    const ok = valueAvailable(product, sel, o.name, val);
                    return (
                      <button key={val} type="button" className="sy-opt__btn" aria-pressed={sel[o.name] === val} disabled={!ok}
                        aria-label={`${o.name} ${val}${ok ? '' : ', unavailable'}`} onClick={() => pick(o.name, val)}>{val}</button>
                    );
                  })}
                </div>
                {missing === o.name && <p className="sy-error" role="alert">Please choose a {o.name.toLowerCase()}.</p>}
              </div>
            ))}

            <div className="sy-buy" ref={buyRef}>
              <button type="button" className="sy-btn sy-btn--block" onClick={add} disabled={soldOut || busy}>{label}</button>
              {problem && <p className="sy-error" role="alert">{problem}</p>}
            </div>

            <div className="sy-facts">
              {TRUST.filter((t) => t.id !== 'support').map((t) => (
                <p key={t.id}><span className="sy-label">{t.label}</span><span>{t.text}</span></p>
              ))}
            </div>

            <div className="sy-acc">
              {product.description && (
                <details open>
                  <summary>Description</summary>
                  <div className="sy-acc__body">{product.description.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}</div>
                </details>
              )}
              {details.length > 0 && (
                <details>
                  <summary>Details{material ? ' & material' : ''}</summary>
                  <div className="sy-acc__body">
                    <table className="sy-table"><tbody>{details.map((d) => <tr key={d.label}><th scope="row">{d.label}</th><td>{d.value}</td></tr>)}</tbody></table>
                  </div>
                </details>
              )}
              <details>
                <summary>Delivery & exchanges</summary>
                <div className="sy-acc__body">
                  {TRUST.filter((t) => t.id !== 'support').map((t) => <p key={t.id}>{t.text}</p>)}
                  <p>Questions? <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="sy-section sy-sand" aria-labelledby="rel">
          <div className="sy-container">
            <div className="sy-head"><h2 id="rel" className="sy-h2">You may also like</h2></div>
            <ProductGrid products={related.slice(0, 4)} label="Related products" />
          </div>
        </section>
      )}

      <div className={`sy-sticky${sticky ? ' is-on' : ''}`} aria-hidden={!sticky}>
        <div className="sy-sticky__info"><div className="sy-sticky__name">{product.name}</div><div className="sy-sticky__price">{money(price, product.currency)}</div></div>
        <button type="button" className="sy-btn" onClick={add} disabled={soldOut || busy} tabIndex={sticky ? 0 : -1}>{label}</button>
      </div>
    </>
  );
}
