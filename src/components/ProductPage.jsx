import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ProductCard } from './ProductGrid';
import { useShopifyProduct } from '../hooks/useShopifyProduct';
import { useShopifyCollection } from '../hooks/useShopifyCollection';
import { useCart } from '../context/CartContext';
import { buildProductSeo, jsonLdString } from '../lib/seo';
import { useRecentlyViewed } from '../lib/recentlyViewed';
import { productPath } from '../data/productCatalog';
import { UNIVERSES } from '../data/universes';
import { useWishlisted } from '../lib/wishlist';
import { trackViewItem, trackAddToCart } from '../lib/analytics';
import '../pdp.css';

/**
 * SYORA — Product Detail Page
 *
 * One continuous editorial scroll, mobile-first, widening to a two-column hero and a
 * "heading | content" rhythm on desktop:
 *
 *   gallery + buy box (colour, size, bag, trust)
 *   → A closer look → Style it → Find your fit → Complete the look
 *   → Product information → Reviews → FAQ → You may also like
 *   → assurances → collection banner → footer
 *
 * Everything shown comes from the Shopify product (or the existing per-product detail
 * imagery). Sections whose data does not exist (reviews, complete-the-look, FAQ…) are
 * simply not rendered — nothing is fabricated.
 */

// Existing Shopify gallery views, curated by product so each feature card
// shows the same kind of detail across the Everyday collection.
const EVERYDAY_FEATURE_GALLERY_INDEX = {
  'syora-flat-5': { cushioning: 4, finish: 2, sole: 5 },
  'syora-flat-4': { cushioning: 1, finish: 2, sole: 5 },
  'syora-flat-3': { cushioning: 4, finish: 2, sole: 5 },
  'syora-flat-2': { cushioning: 2, finish: 4, sole: 5 },
  'syora-flat-1': { cushioning: 4, finish: 2, sole: 5 },
  'zebra-flats': { cushioning: 2, finish: 4, sole: 5 },
};

// The delivery PIN-code checker has no real serviceability data behind it: it used to
// answer "delivery in 3–7 days, COD available" for ANY 6-digit code after a fake delay.
// It stays off until it can be wired to a real service; the UI code is kept intact.
const SHOW_PIN_CHECKER = false;


const SIZE_CHART = [
  [35, 2, 5, '22.5'], [36, 3, 6, '23'], [37, 4, 7, '24'], [38, 5, 8, '24.5'],
  [39, 6, 9, '25'], [40, 7, 10, '25.5'], [41, 8, 11, '26'], [42, 9, 12, '26.5'],
];

const ICONS = {
  truck: <><path d="M3 6h11v10H3z" /><path d="M14 9h4l3 3v4h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>,
  exchange: <><path d="M4 9a8 8 0 0 1 14-3l2 2" /><path d="M20 4v4h-4" /><path d="M20 15a8 8 0 0 1-14 3l-2-2" /><path d="M4 20v-4h4" /></>,
  shield: <><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /><path d="m3 17.5 9 5 9-5" opacity="0" /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></>,
  doc: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h7M9 15h7" /></>,
  heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" /></>,
  bag: <><path d="M6 8h12l1 13H5z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  zoom: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5M11 8v6M8 11h6" /></>,
  ruler: <><rect x="2" y="8" width="20" height="8" rx="1" /><path d="M6 8v3M10 8v4M14 8v3M18 8v4" /></>,
  stitch: <path d="M4 20 20 4M6.5 14.5l2 2M10.5 10.5l2 2M14.5 6.5l2 2" />,
  heightArrow: <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" />,
  chevL: <path d="M15 18l-6-6 6-6" />,
  chevR: <path d="M9 18l6-6-6-6" />,
  close: <path d="M5 5l14 14M19 5L5 19" />,
  arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
  pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
};
function Icon({ name, size = 20, stroke = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const titleCase = (text = '') => String(text).toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
const firstSentence = (text = '') => (String(text).match(/^[^.!?]+[.!?]/)?.[0] || String(text)).trim();
/** Split a plain-text description into short readable paragraphs (2 sentences each when it is one long block). */
function toParagraphs(text = '') {
  const blocks = String(text).split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (blocks.length > 1 || (blocks[0] || '').length < 320) return blocks;
  const sentences = blocks[0].match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) || blocks;
  const out = [];
  for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).join(' '));
  return out;
}
const availableFact = (value) => value && !/^(—|-|n\/a)$/i.test(String(value).trim());

function Stars({ value }) {
  return (
    <span className="pdp-stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, Number(value) - star + 1));
        return (
          <span
            key={star}
            style={{
              background: `linear-gradient(90deg, currentColor ${fill * 100}%, rgba(31,20,14,0.2) ${fill * 100}%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >★</span>
        );
      })}
    </span>
  );
}

/** One editorial block: a heading column plus content. Stacks on mobile. */
function Section({ id, eyebrow, title, intro, action, className = '', children, labelId }) {
  return (
    <section id={id} className={`pdp-section ${className}`} aria-labelledby={labelId}>
      <div className="pdp-wrap pdp-section__grid">
        <header className="pdp-section__head">
          {eyebrow && <p className="pdp-eyebrow">{eyebrow}</p>}
          <h2 id={labelId} className="pdp-h2">{title}</h2>
          {intro && <p className="pdp-section__intro">{intro}</p>}
          {action}
        </header>
        <div className="pdp-section__body">{children}</div>
      </div>
    </section>
  );
}

/** Full-screen image viewer: Escape closes, arrow keys navigate, page scroll is locked. */
function Lightbox({ name, src, position, total, onClose, onMove }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onMove(1);
      else if (e.key === 'ArrowLeft') onMove(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prevOverflow; document.removeEventListener('keydown', onKey); };
  }, [onClose, onMove]);

  return (
    <div className="pdp-lightbox" role="dialog" aria-modal="true" aria-label={`${name} images`} onClick={onClose}>
      <button type="button" className="pdp-lightbox__close" onClick={onClose} aria-label="Close"><Icon name="close" size={22} /></button>
      {total > 1 && (
        <button type="button" className="pdp-lightbox__nav pdp-lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); onMove(-1); }} aria-label="Previous image"><Icon name="chevL" size={26} /></button>
      )}
      <img src={src} alt={`${name} — view ${position + 1}`} onClick={(e) => e.stopPropagation()} />
      {total > 1 && (
        <button type="button" className="pdp-lightbox__nav pdp-lightbox__nav--next" onClick={(e) => { e.stopPropagation(); onMove(1); }} aria-label="Next image"><Icon name="chevR" size={26} /></button>
      )}
      <p className="pdp-lightbox__count">{position + 1} / {total}</p>
    </div>
  );
}

const TRUST = [
  { icon: 'truck', title: '3–7 Days Delivery', note: 'Across India' },
  { icon: 'exchange', title: 'Easy Exchanges', note: 'Within 48 hours' },
  { icon: 'shield', title: 'Secure Payments', note: 'Cards, UPI & COD' },
];
function TrustRow({ className = '' }) {
  return (
    <ul className={`pdp-trust ${className}`}>
      {TRUST.map((t) => (
        <li key={t.title}>
          <Icon name={t.icon} size={26} stroke={1.3} />
          <span className="pdp-trust__text">
            <strong>{t.title}</strong>
            <small>{t.note}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ProductPage({ handle }) {
  const navigate = useNavigate();

  // Fetch the Shopify product by the handle captured from /product/:handle.
  const { product, loading: productLoading, error: productError, retry } = useShopifyProduct(handle);

  // "You may also like": real products from the same collection (universe).
  const { products: collectionProducts } = useShopifyCollection(product?.universeId);

  // Cart operations
  const { addToCart, goToCheckout, cartLoading, cartError } = useCart();

  const [activeImg, setActiveImg]         = useState(0);
  const [selectedColour, setColour]       = useState(0);
  const [selectedSize, setSize]           = useState(null);
  const [selectedVariantId, setVariantId] = useState(null);
  const [sizeError, setSizeError]         = useState(false);
  const [wishlisted, toggleWishlist]      = useWishlisted(handle);
  const [addedToCart, setAddedToCart]     = useState(false);
  const [cartFeedback, setCartFeedback]   = useState(null); // 'added' | 'error'
  const [pinCode, setPinCode]             = useState('');
  const [pinResult, setPinResult]         = useState(null);
  const [pinLoading, setPinLoading]       = useState(false);
  const [openInfo, setOpenInfo]           = useState(null);
  const [openFaq, setOpenFaq]             = useState(null);
  const [shareFeedback, setShareFeedback] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightbox, setLightbox]           = useState(false);
  const [reviewIndex, setReviewIndex]     = useState(0);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [brokenImages, setBrokenImages]   = useState(() => new Set());

  const recentlyViewed = useRecentlyViewed(product);
  const actionsRef  = useRef(null);
  const endRef      = useRef(null);
  const touchStartX = useRef(null);

  // Static SEO tags written by the build-time pre-render are replaced by this component's own tags.
  useEffect(() => {
    if (product?.handle) document.head.querySelectorAll('[data-prerender], [data-site-default]').forEach((node) => node.remove());
  }, [product?.handle]);

  useEffect(() => {
    setColour(0);
    setActiveImg(product?.colours?.[0]?.galleryIndices?.[0] ?? product?.colours?.[0]?.imageIndex ?? 0);
    setSize(null);
    setVariantId(null);
    setOpenInfo(null);
    setReviewIndex(0);
    setSizeGuideOpen(false);
  }, [product?.handle]);

  // Cycle product photos every five seconds on mobile/tablet layouts.
  // A timeout (rather than a fixed interval) gives each newly selected image
  // a full five seconds and restarts after manual navigation. The carousel
  // pauses while the tab is hidden and resumes when it becomes visible.
  useEffect(() => {
    const imageCount = product?.images?.length ?? 0;
    if (imageCount < 2 || product?.colours?.length > 1 || lightbox) return;

    const mobileQuery = window.matchMedia('(max-width: 1023px)');
    let timerId;
    const scheduleNextImage = () => {
      window.clearTimeout(timerId);
      if (!mobileQuery.matches || document.hidden) return;

      timerId = window.setTimeout(() => {
        setActiveImg((index) => (index + 1) % imageCount);
      }, 5000);
    };

    scheduleNextImage();
    mobileQuery.addEventListener('change', scheduleNextImage);
    document.addEventListener('visibilitychange', scheduleNextImage);

    return () => {
      window.clearTimeout(timerId);
      mobileQuery.removeEventListener('change', scheduleNextImage);
      document.removeEventListener('visibilitychange', scheduleNextImage);
    };
  }, [product?.images?.length, product?.colours?.length, activeImg, lightbox]);

  // Fire view_item analytics event when product loads
  useEffect(() => {
    if (product) trackViewItem(product);
  }, [product]);

  // Sticky buy bar (mobile/tablet): shown once the main buy box has scrolled away,
  // and tucked away again when the page end (assurances / footer) is reached.
  useEffect(() => {
    const actionsEl = actionsRef.current;
    const endEl = endRef.current;
    if (!actionsEl || !endEl || typeof IntersectionObserver === 'undefined') return undefined;
    let actionsOut = false;
    let atEnd = false;
    const sync = () => setStickyVisible(actionsOut && !atEnd);
    const a = new IntersectionObserver(([e]) => { actionsOut = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); });
    // At the end once the marker is on screen OR already scrolled above it (the footer is tall).
    const b = new IntersectionObserver(([e]) => { atEnd = e.isIntersecting || e.boundingClientRect.top < 0; sync(); });
    a.observe(actionsEl);
    b.observe(endEl);
    return () => { a.disconnect(); b.disconnect(); };
  }, [product?.handle]);

  // When a size is selected, find the corresponding Shopify variant ID
  function handleSizeSelect(size) {
    setSize(size);
    setSizeError(false);
    if (product?.variantMap?.[size]) {
      setVariantId(product.variantMap[size].id);
    }
  }

  function handleColourSelect(index) {
    setColour(index);
    const colour = product?.colours?.[index];
    const imageIndex = colour?.galleryIndices?.[0] ?? colour?.imageIndex;
    if (Number.isInteger(imageIndex) && imageIndex >= 0) setActiveImg(imageIndex);
  }

  function getColourGalleryIndices(index = selectedColour) {
    if (!product?.images?.length) return [];
    const colour = product.colours?.[index];
    if (colour?.galleryIndices?.length) return colour.galleryIndices;
    if (Number.isInteger(colour?.imageIndex) && colour.imageIndex >= 0) return [colour.imageIndex];
    return product.images.map((_, imageIndex) => imageIndex);
  }

  const isGlitterFlatBurgundy = handle === 'glitter-flat'
    && product?.colours?.[selectedColour]?.name?.toLowerCase() === 'burgundy';

  const relatedProducts = useMemo(
    () => (collectionProducts || []).filter((p) => p.handle !== handle).slice(0, 4),
    [collectionProducts, handle],
  );

  // Loading state
  if (productLoading) {
    return (
      <div className="pdp pdp-state">
        <Navbar universeMode solid />
        <div className="pdp-state__inner">
          <div className="pdp-spinner" />
          <p>Loading product…</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (productError || !product) {
    return (
      <div className="pdp pdp-state">
        <Navbar universeMode solid />
        <div className="pdp-state__inner" role="alert">
          <p className="pdp-eyebrow">{productError ? 'Product unavailable' : 'Product not found'}</p>
          <h1 className="pdp-h2">
            {productError ? 'We could not load this product.' : 'This product could not be found.'}
          </h1>
          <p>{productError || 'The Shopify product handle may be incorrect, or the product may no longer be published.'}</p>
          <div className="pdp-state__actions">
            {productError && <button type="button" className="pdp-btn pdp-btn--primary" onClick={retry}>Try again</button>}
            <button type="button" className="pdp-btn pdp-btn--ghost" onClick={() => navigate(-1)}>← Go back</button>
            <button type="button" className="pdp-btn pdp-btn--ghost" onClick={() => navigate('/')}>The Multiverse</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const universe = UNIVERSES[product.universeId];
  const seo = buildProductSeo(product, { universe: universe ? { id: product.universeId, name: universe.name } : null });
  const galleryImageIndices = getColourGalleryIndices();
  const activePosition = Math.max(0, galleryImageIndices.indexOf(activeImg));

  function moveGalleryImage(direction) {
    setActiveImg((current) => {
      const currentPosition = galleryImageIndices.indexOf(current);
      const start = currentPosition < 0 ? 0 : currentPosition;
      return galleryImageIndices[(start + direction + galleryImageIndices.length) % galleryImageIndices.length];
    });
  }

  function requireSize() {
    setSizeError(true);
    document.getElementById('pdp-sizes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setSizeError(false), 3200);
  }

  function showCartError() {
    setCartFeedback('error');
    setTimeout(() => setCartFeedback(null), 4000);
  }

  async function handleAddToCart() {
    if (!selectedVariantId) { requireSize(); return; }
    const result = await addToCart(selectedVariantId, 1);
    if (result) {
      // Fire GA4 add_to_cart event
      const variant = product.variantMap?.[selectedSize];
      trackAddToCart(product, variant, 1);
      setAddedToCart(true);
      setCartFeedback('added');
      setTimeout(() => { setAddedToCart(false); setCartFeedback(null); }, 2500);
    } else {
      showCartError();
    }
  }

  async function handleBuyNow() {
    if (!selectedVariantId) { requireSize(); return; }
    const result = await addToCart(selectedVariantId, 1);
    // Never continue to checkout with a cart the add step failed to update.
    if (!result) { showCartError(); return; }
    goToCheckout();
  }

  function handlePinCheck() {
    if (pinCode.length !== 6) { setPinResult({ error: 'Enter a valid 6-digit PIN code.' }); return; }
    setPinLoading(true);
    setPinResult(null);
    setTimeout(() => {
      setPinLoading(false);
      setPinResult({ date: product.deliveryDaysEstimate, cod: product.codAvailable });
    }, 900);
  }

  async function handleShareProduct() {
    const shareData = { title: product.name, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        setShareFeedback('Link copied');
        window.setTimeout(() => setShareFeedback(''), 2000);
      }
    } catch (error) {
      if (error.name !== 'AbortError') setShareFeedback('Unable to share');
    }
  }

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) moveGalleryImage(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  /* ── Real ratings / reviews only (Shopify exposes none natively) ── */
  const reviewCount   = product.reviewCount || 0;
  const displayRating = product.rating;
  const hasRating = Number.isFinite(Number(displayRating)) && Number(displayRating) > 0 && reviewCount > 0;
  const reviewList = Array.isArray(product.reviews) ? product.reviews : [];
  const currentReview = reviewList.length ? reviewList[reviewIndex % reviewList.length] : null;

  /* ── Styling looks ── */
  const categoryText = `${handle} ${product.title || ''} ${product.category || ''}`.toLowerCase();
  const stylingUniverse = /boot/.test(categoryText)
    ? 'boots'
    : /crocs?|clog|slide/.test(categoryText)
      ? 'off-duty'
      : /sneaker|trainer/.test(categoryText)
        ? 'motion'
        : /jutt|mojari/.test(categoryText)
          ? 'heritage'
          : /heel|pump|stiletto/.test(categoryText)
            ? 'icon'
            : /flat|loafer/.test(categoryText)
              ? 'everyday'
              : product.universeId || 'everyday';
  const footwearLabel = {
    icon: 'heels', heritage: 'juttis', everyday: 'flats and loafers', motion: 'sneakers',
    'off-duty': 'clogs, slides and Crocs-style comfort shoes', boots: 'boots',
  }[stylingUniverse] || 'flats';
  const stylingLooks = handle === 'black-pump'
    ? [
      { image: 'black-pump-formals-model.webp', title: 'Formals', note: 'A sharp, confident finish for workdays and polished occasions.', alt: 'Model wearing black SYORA slingback heels with tailored formal trousers and a black blazer' },
      { image: 'black-pump-dress-model.webp', title: 'Dress', note: 'A sleek black heel for evening dresses and special plans.', alt: 'Model wearing black SYORA slingback heels with an elegant black evening dress' },
      { image: 'black-pump-indo-western-model.webp', title: 'Indo-western', note: 'Classic black heels bring a refined finish to festive fusion wear.', alt: 'Model wearing black SYORA slingback heels with a black and gold Indo-western outfit' },
    ]
    : {
    icon: [
      { image: 'heels-saree-model.webp', title: 'Saree', note: 'A graceful saree look for celebrations and evenings.', alt: 'Model wearing SYORA black heels with a sage green saree' },
      { image: 'heels-western-model.webp', title: 'Western', note: 'A polished heel to finish tailored western looks.', alt: 'Model wearing SYORA black heels with a black top and tailored trousers' },
      { image: 'heels-indo-western-model.webp', title: 'Indo-western', note: 'A contemporary fusion look, finished with classic heels.', alt: 'Model wearing SYORA black heels with an embroidered Indo-western outfit' },
    ],
    heritage: [
      { image: 'lehenga-style.webp', title: 'Lehenga', note: 'Traditional craft meets a festive silhouette.' },
      { image: 'saree-style.webp', title: 'Saree', note: 'A considered pairing for zari and mirror details.' },
      { image: 'anarkali-style.webp', title: 'Anarkali', note: 'A graceful choice for daytime celebrations.' },
    ],
    everyday: [
      { image: 'workwear-flats.webp', title: 'Workwear', note: 'A refined finish for office days and plans after.' },
      { image: 'saree-style.webp', title: 'Saree', note: 'An easy way to dress up a simple occasion look.' },
      { image: 'anarkali-style.webp', title: 'Anarkali', note: 'A comfortable, polished pairing for celebrations.' },
    ],
    motion: [
      { image: 'denim-sneakers.webp', title: 'Denim', note: 'An easy match for everyday city plans.' },
      { image: 'workwear-flats.webp', title: 'Smart casual', note: 'Keep weekday dressing comfortable and composed.' },
      { image: 'relaxed-clogs.webp', title: 'Relaxed layers', note: 'A laid-back look for slower days.' },
    ],
    'off-duty': [
      { image: 'relaxed-clogs.webp', title: 'Relaxed layers', note: 'An easy fit for off-duty comfort.' },
      { image: 'denim-sneakers.webp', title: 'Denim', note: 'Casual layers for errands and weekends.' },
      { image: 'workwear-flats.webp', title: 'Smart casual', note: 'A relaxed look that still feels put together.' },
    ],
    boots: [
      { image: 'workwear-flats.webp', title: 'Tailored layers', note: 'Clean lines bring balance to a strong boot.' },
      { image: 'denim-sneakers.webp', title: 'Denim', note: 'A versatile pairing for everyday wear.' },
      { image: 'lehenga-style.webp', title: 'Festive', note: 'A modern contrast for statement dressing.' },
    ],
    }[stylingUniverse] || [];
  const visibleLooks = stylingLooks.filter((look) => !brokenImages.has(`look:${look.image}`));
  const markBroken = (key) => setBrokenImages((prev) => new Set(prev).add(key));

  /* ── "A closer look": ONE list, whichever product supplies the detail imagery ── */
  const isEverydayFlat = stylingUniverse === 'everyday'
    && /\bflats?\b/.test(categoryText)
    && handle !== 'glitter-flat';
  const everydayFeatureIndices = EVERYDAY_FEATURE_GALLERY_INDEX[handle]
    || { cushioning: 2, finish: 4, sole: 5 };
  const everydayGallery = (product.imageDetails?.length
    ? product.imageDetails
    : (product.images || []).map((url, index) => ({ url, index, altText: '' })))
    .filter((image) => image?.url);
  const usedEverydayImages = new Set();
  const chooseEverydayImage = (pattern, fallbackIndex) => {
    const semanticImage = everydayGallery.find((image) =>
      !usedEverydayImages.has(image.url) && pattern.test(image.altText || '')
    );
    const image = semanticImage
      || everydayGallery.find((candidate, index) => !usedEverydayImages.has(candidate.url) && index >= fallbackIndex)
      || everydayGallery.find((candidate) => !usedEverydayImages.has(candidate.url))
      || everydayGallery[fallbackIndex % Math.max(everydayGallery.length, 1)];
    if (image) usedEverydayImages.add(image.url);
    return image;
  };
  const cushionFact = product.benefits?.find(({ text = '' }) => /cushion|foam|footbed|insole/i.test(text))?.text
    || (availableFact(product.soleType) && /cushion|foam|footbed|insole/i.test(product.soleType) ? product.soleType : null)
    || (availableFact(product.comfortProfile?.cushioning) ? `${product.comfortProfile.cushioning} cushioning` : null);
  const comfortFact = availableFact(product.comfortProfile?.bestForHours)
    ? `Comfort profile: ${product.comfortProfile.bestForHours}.`
    : (availableFact(product.soleType) ? `${product.soleType}.` : null);

  const detail = (src, alt, width, height, style) => ({ src, alt, width, height, style });
  let closerLook = [];
  if (handle === 'glitter-flat') {
    const b = isGlitterFlatBurgundy;
    closerLook = [
      { title: 'Footbed feel', copy: 'A closer view of the footbed, framed by the glossy strap.',
        image: detail(b ? '/images/product-details/glitter-flat-burgundy-footbed-feel.webp' : '/images/product-details/glitter-flat-footbed-feel.webp',
          b ? 'Close-up of the Burgundy Glitter Flat footbed with the gold SYORA wordmark' : 'Close-up showing the cushioned burgundy footbed beneath the glossy black strap', 1130, 1392) },
      { title: 'Finish & stitching', copy: 'The smooth patent finish and fine edge detail up close.',
        image: detail(b ? '/images/product-details/glitter-flat-burgundy-finish-stitching.webp' : '/images/product-details/glitter-flat-texture.webp',
          b ? 'Macro detail of the Burgundy patent upper and stitched edge' : 'Macro detail of the glossy black upper and stitched edge', 962, 1200) },
      { title: 'Heel height & base', copy: 'A side view of the low block heel and its broad base.',
        image: detail(b ? '/images/product-details/glitter-flat-burgundy-heel-base.webp' : '/images/product-details/glitter-flat-heel.webp',
          b ? 'Side close-up of the Burgundy Glitter Flat heel and base' : "Side close-up showing the shoe's broad low block heel", 962, 1200) },
    ];
  } else if (handle === 'black-pumps') {
    closerLook = [
      { title: 'Cushioned insole', copy: 'A close-up of the soft burgundy footbed and its gentle cushioning.',
        image: detail('/images/product-details/black-pumps-cushioning.webp', 'Close-up of the Black Pumps cushioned burgundy footbed, pressed to show its padding', 1254, 1254) },
      { title: 'Finish & stitching', copy: 'Look closely at the glossy patent finish and neatly stitched edge.',
        image: detail('/images/product-details/black-pumps-stitching.webp', 'Macro detail of the Black Pumps glossy black finish and fine stitched edge', 1254, 1254) },
      { title: 'Block height', copy: 'A side view of the heel height and the shape of its base.',
        image: detail(product.images?.[3] || product.images?.[0], 'Fourth gallery view of the Black Pumps showing the block heel height and base', 1200, 1200) },
    ];
  } else if (handle === 'black-pump') {
    closerLook = [
      { title: 'Cushioned insole', copy: 'A close-up of the soft footbed and its gentle cushioning.',
        image: detail('/images/product-details/black-pump-cushioning.webp', "Close-up of the Black Pump's cushioned black footbed being pressed to show its padding", 1656, 1110) },
      { title: 'Finish & stitching', copy: 'Look closely at the glossy patent finish and neatly stitched edge.',
        image: detail('/images/product-details/black-pump-stitching.webp', "Macro detail of the Black Pump's glossy patent finish and fine stitched edge", 1536, 1024) },
      { title: 'Heel height & base', copy: 'A closer view of the slingback heel and its base.',
        image: detail(product.images?.[3] || product.images?.[0], 'Close-up from the fourth Black Pump gallery image, focused on the slingback heel and heel base', 1200, 1200,
          { objectPosition: 'left center', transform: 'scale(1.25)', transformOrigin: 'left center' }) },
    ];
  } else if (isEverydayFlat && everydayGallery.length > 0) {
    closerLook = [
      { title: 'Cushioning', image: chooseEverydayImage(/footbed|insole|cushion|foam|interior/i, everydayFeatureIndices.cushioning),
        copy: cushionFact || `A close look at the footbed of ${product.name}.` },
      { title: 'Stitching & finish', image: chooseEverydayImage(/stitch|seam|texture|upper|finish|close.?up|detail/i, everydayFeatureIndices.finish),
        copy: availableFact(product.material)
          ? `A closer look at the ${product.material} upper and its visible finish.`
          : `A close-up of the upper finish, edge detailing, and stitching on ${product.name}.` },
      { title: 'Comfort & sole', image: chooseEverydayImage(/sole|outsole|side|profile|base|comfort|wear/i, everydayFeatureIndices.sole),
        copy: comfortFact || `A side or outsole view of ${product.name}, showing its sole profile.` },
    ].filter((item) => item.image).map((item) => ({
      title: item.title,
      copy: item.copy,
      image: detail(item.image.url, item.image.altText || `${product.name} — product gallery view ${(item.image.index ?? 0) + 1}`, item.image.width || undefined, item.image.height || undefined),
    }));
  }

  /* ── Product information (accordion) ── */
  const aboutFacts = [
    ['Material', product.material],
    ['Heel height', product.heelHeight],
    ['Closure', product.closureType],
    ['Sole', product.soleType],
    ['Best for', product.bestForOccasion],
    ['Colours', product.colours?.length > 1 ? product.colours.map((c) => c.name).join(', ') : ''],
    ['Brand', /^syora$/i.test(product.vendor || 'SYORA') ? 'SYORA' : product.vendor],
  ].filter(([, value]) => availableFact(value));
  const keyFacts = aboutFacts.filter(([label]) => ['Material', 'Heel height', 'Sole', 'Best for'].includes(label)).slice(0, 4);
  const aboutParagraphs = toParagraphs(product.description);
  const infoItems = [
    product.benefits?.length > 0 && {
      id: 'benefits', title: "Why you'll love it", icon: 'heart',
      content: <ul className="pdp-bullets">{product.benefits.map((b, i) => <li key={i}>{b.text}</li>)}</ul>,
    },
    ...(product.accordion || []).map((item, i) => ({
      id: `acc-${i}`, title: item.title, icon: 'info', content: <p>{item.content}</p>,
    })),
    {
      id: 'shipping', title: 'Shipping, Delivery & Exchange', icon: 'truck',
      content: (
        <>
          <p>We ship across India to serviceable PIN codes. Estimated delivery is 3–7 business days.</p>
          <p>Cash on Delivery is available across India wherever the PIN code and courier are serviceable.</p>
          <p>For a size or colour exchange, contact SYORA within 48 hours of delivery. Items must be unworn and returned with their original packaging and tags. Exchanges are subject to availability.</p>
          <p>If your order arrives damaged or you receive the wrong item, please contact us within 48 hours with your order number and clear photos. We will arrange an appropriate resolution. No change-of-mind returns are offered; this does not limit remedies required by applicable consumer law.</p>
        </>
      ),
    },
    {
      id: 'care', title: 'Composition & Care', icon: 'layers',
      content: (
        <>
          {availableFact(product.material) && <p><strong>Composition:</strong> {product.material}</p>}
          <p><strong>Care:</strong> Wipe gently with a soft, dry cloth. Keep away from prolonged moisture, direct heat, and harsh chemicals. Store in a cool, dry place.</p>
        </>
      ),
    },
    {
      id: 'brand', title: 'Brand Details', icon: 'info',
      content: <p><strong>Brand:</strong> {product.vendor || 'SYORA'}</p>,
    },
  ].filter(Boolean);

  /* ── Purchase state ── */
  const isProcessing = cartLoading;
  const bagLabel = isProcessing
    ? 'ADDING…'
    : addedToCart
      ? '✓ ADDED TO BAG'
      : selectedSize
        ? `ADD TO BAG · SIZE ${selectedSize}`
        : 'ADD TO BAG';

  function isSizeAvailable(size) {
    const variant = product.variantMap?.[size];
    if (!variant) return false;
    return variant.availableForSale !== false;
  }
  const productSoldOut = product.availableForSale === false
    || (product.sizes?.length > 0 && !product.sizes.some(isSizeAvailable));

  const hasDiscount = product.originalPrice > 0 && product.originalPrice > product.price;
  const selectedColourName = product.colours?.[selectedColour]?.name;
  const sizeCols = product.sizes.length <= 8 ? Math.max(product.sizes.length, 1) : 6;

  const addToBagButton = (id) => (
    <button
      type="button"
      id={id}
      className={`pdp-btn pdp-btn--primary${addedToCart ? ' is-done' : ''}`}
      onClick={handleAddToCart}
      disabled={productSoldOut || isProcessing}
    >
      <Icon name="bag" size={20} />
      <span>{productSoldOut ? 'SOLD OUT' : bagLabel}</span>
    </button>
  );
  const wishlistButton = (
    <button
      type="button"
      className={`pdp-btn pdp-btn--icon${wishlisted ? ' is-on' : ''}`}
      onClick={toggleWishlist}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">{ICONS.heart}</svg>
    </button>
  );

  return (
    <div className="pdp">
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content="SYORA" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.url} />
      {seo.image && <meta property="og:image" content={seo.image} />}
      {seo.price > 0 && <meta property="product:price:amount" content={Number(seo.price).toFixed(2)} />}
      {seo.price > 0 && <meta property="product:price:currency" content="INR" />}
      <meta name="twitter:card" content={seo.image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {seo.image && <meta name="twitter:image" content={seo.image} />}
      {seo.jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(ld) }} />
      ))}

      <Navbar universeMode solid />

      <main id="main">
        {/* ═══════════ HERO: gallery + buy box ═══════════ */}
        <div className="pdp-wrap">
          <nav className="pdp-crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {universe && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/universe/${product.universeId}`}>{titleCase(universe.name)}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <section className="pdp-hero" aria-label="Product">
            {/* ── Gallery ── */}
            <div className="pdp-gallery">
              <div className="pdp-gallery__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <img
                  key={activeImg}
                  src={product.images[activeImg]}
                  alt={`${product.name}${selectedColourName ? `, ${selectedColourName}` : ''} — view ${activePosition + 1} of ${galleryImageIndices.length}`}
                  className="pdp-gallery__img"
                />
                <button type="button" className="pdp-gallery__expand" onClick={() => setLightbox(true)} aria-label="Zoom image">
                  <Icon name="zoom" size={18} />
                </button>
                {galleryImageIndices.length > 1 && (
                  <span className="pdp-gallery__count" aria-live="polite">{activePosition + 1} / {galleryImageIndices.length}</span>
                )}
                {galleryImageIndices.length > 1 && (
                  <>
                    <button type="button" className="pdp-gallery__arrow pdp-gallery__arrow--prev" onClick={() => moveGalleryImage(-1)} aria-label="Previous image"><Icon name="chevL" size={20} /></button>
                    <button type="button" className="pdp-gallery__arrow pdp-gallery__arrow--next" onClick={() => moveGalleryImage(1)} aria-label="Next image"><Icon name="chevR" size={20} /></button>
                  </>
                )}
              </div>

              {galleryImageIndices.length > 1 && (
                <ul className="pdp-gallery__thumbs" aria-label="Product images">
                  {galleryImageIndices.map((imageIndex, i) => (
                    <li key={imageIndex}>
                      <button
                        type="button"
                        className={`pdp-gallery__thumb${imageIndex === activeImg ? ' is-active' : ''}`}
                        onClick={() => setActiveImg(imageIndex)}
                        aria-label={`View image ${i + 1}`}
                        aria-current={imageIndex === activeImg}
                      >
                        <img src={product.images[imageIndex]} alt="" loading="lazy" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ── Buy box ── */}
            <div className="pdp-buy">
              {product.badge && <p className="pdp-buy__badgewrap"><span className="pdp-buy__badge">{product.badge}</span></p>}
              <h1 className="pdp-buy__name">{product.name}</h1>

              <div className="pdp-buy__pricerow">
                <div className="pdp-buy__price">
                  <span className="pdp-buy__price-now">{product.price ? `₹${product.price.toLocaleString('en-IN')}` : ''}</span>
                  {hasDiscount && <span className="pdp-buy__price-was">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
                  {product.discountPercent > 0 && <span className="pdp-buy__price-off">{product.discountPercent}% OFF</span>}
                </div>
                {hasRating && (
                  <a className="pdp-buy__rating" href="#pdp-reviews" aria-label={`Rated ${Number(displayRating).toFixed(1)} out of 5 from ${reviewCount} reviews`}>
                    <span className="pdp-buy__star" aria-hidden="true">★</span>
                    <strong>{Number(displayRating).toFixed(1)}</strong>
                    <span>({reviewCount})</span>
                  </a>
                )}
              </div>
              <p className="pdp-buy__tax">Inclusive of all taxes</p>

              {keyFacts.length > 0 && (
                <dl className="pdp-keyfacts" aria-label="Key details">
                  {keyFacts.map(([label, value]) => (
                    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                  ))}
                </dl>
              )}

              {product.colours?.length > 0 && (
                <div className="pdp-field pdp-field--colour">
                  <p className="pdp-field__label">
                    Colour{selectedColourName && <>: <span className="pdp-field__value">{selectedColourName}</span></>}
                  </p>
                  <ul className="pdp-swatches">
                    {product.colours.map((c, i) => (
                      <li key={c.name}>
                        <button
                          type="button"
                          className={`pdp-swatch${c.image ? ' has-photo' : ''}${i === selectedColour ? ' is-active' : ''}`}
                          onClick={() => handleColourSelect(i)}
                          title={c.name}
                          aria-label={`Select colour: ${c.name}`}
                          aria-pressed={i === selectedColour}
                        >
                          {/* The variant photo when there is one; a solid colour otherwise. */}
                          {c.image
                            ? <img src={c.image} alt="" loading="lazy" />
                            : <span style={{ background: c.hex }} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pdp-field">
                <div className="pdp-field__row">
                  <p className="pdp-field__label">Size<span className="pdp-field__value">: {selectedSize || 'Select a size'}</span></p>
                  <button
                    type="button"
                    className="pdp-link"
                    onClick={() => {
                      setSizeGuideOpen(true);
                      window.setTimeout(() => document.getElementById('pdp-size-guidance')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
                    }}
                    aria-controls="pdp-size-guidance"
                  >
                    <Icon name="ruler" size={18} /> Size Guide
                  </button>
                </div>

                <div id="pdp-sizes" className={`pdp-sizes${sizeError ? ' has-error' : ''}`} style={{ '--pdp-size-cols': sizeCols }} role="group" aria-label="Sizes">
                  {product.sizes.map((sz) => {
                    const available = isSizeAvailable(sz);
                    return (
                      <button
                        key={sz}
                        id={`pdp-size-${sz}`}
                        className={`pdp-size${selectedSize === sz ? ' is-active' : ''}${!available ? ' is-soldout' : ''}`}
                        type="button"
                        onClick={() => available && handleSizeSelect(sz)}
                        aria-pressed={selectedSize === sz}
                        aria-label={available ? `Size ${sz}` : `Size ${sz} — sold out`}
                        disabled={!available}
                        title={!available ? 'Sold out' : undefined}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                {sizeError && <p className="pdp-size-error" role="alert">Please select a size to continue.</p>}
                {product.modelSize && <p className="pdp-modelnote">Model is wearing size {product.modelSize}.</p>}

                {product.fitNote && product.fitNote !== 'Not known yet' && (
                  <p className="pdp-fitnote">
                    <Icon name="info" size={18} />
                    <span><strong>{product.fitNote}.</strong> We recommend ordering your usual size.</span>
                  </p>
                )}
              </div>

              {/* ── Purchase actions ── */}
              <div className="pdp-actions" id="pdp-actions" ref={actionsRef} role="group" aria-label="Purchase options">
                <div className="pdp-actions__row">
                  {addToBagButton('pdp-add-to-bag')}
                  {wishlistButton}
                </div>
                {!productSoldOut && (
                  <button type="button" id="pdp-buy-now" className="pdp-btn pdp-btn--ghost" onClick={handleBuyNow} disabled={isProcessing}>
                    <span>BUY NOW</span>
                    <Icon name="arrow" size={16} />
                  </button>
                )}
                {cartFeedback === 'error' && (
                  <p className="pdp-feedback" role="alert">
                    {cartError || "We couldn't update your bag just now. Please try again."}
                  </p>
                )}
              </div>

              {product.offerBanner && (
                <div className="pdp-offerstrip" role="note">
                  <Icon name="tag" size={22} />
                  <span>{product.offerBanner}</span>
                </div>
              )}

              {/* ── Delivery PIN checker (off: see SHOW_PIN_CHECKER) ── */}
              {SHOW_PIN_CHECKER && (
                <div className="pdp-pin">
                  <p className="pdp-field__label"><Icon name="pin" size={14} /> Check delivery to your PIN code</p>
                  <div className="pdp-pin__row">
                    <input
                      id="pdp-pin-input"
                      type="tel"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter PIN code"
                      value={pinCode}
                      onChange={(e) => { setPinCode(e.target.value.replace(/\D/g, '')); setPinResult(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handlePinCheck()}
                      aria-label="PIN code for delivery check"
                    />
                    <button type="button" className="pdp-btn pdp-btn--ghost" onClick={handlePinCheck} disabled={pinLoading}>
                      {pinLoading ? '...' : 'Check'}
                    </button>
                  </div>
                  {pinResult && !pinResult.error && (
                    <p className="pdp-pin__ok">✓ Delivery in <strong>{pinResult.date}</strong>{pinResult.cod && <span> · COD available</span>}</p>
                  )}
                  {pinResult?.error && <p className="pdp-pin__err">{pinResult.error}</p>}
                </div>
              )}

              <TrustRow className="pdp-trust--buy" />

              <button type="button" className="pdp-link pdp-share" onClick={handleShareProduct}>
                <Icon name="share" size={16} /> {shareFeedback || 'Share'}
              </button>
            </div>
          </section>
        </div>

        {/* ═══════════ ABOUT THIS STYLE (open by default: description + specs) ═══════════ */}
        {(aboutParagraphs.length > 0 || aboutFacts.length > 1) && (
          <section id="pdp-about" className="pdp-section pdp-about" aria-labelledby="pdp-about-title">
            <div className="pdp-wrap pdp-about__grid">
              <header className="pdp-about__head">
                <p className="pdp-eyebrow">About this style</p>
                <h2 id="pdp-about-title" className="pdp-h2">About the {product.name}</h2>
              </header>
              <div className="pdp-about__body">
                {aboutParagraphs.map((para, i) => <p key={i} className="pdp-about__text">{para}</p>)}
                {aboutFacts.length > 1 && (
                  <dl className="pdp-specs">
                    {aboutFacts.map(([label, value]) => (
                      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════ A CLOSER LOOK ═══════════ */}
        {closerLook.length > 0 && (
          <section className="pdp-section pdp-closer" aria-labelledby="pdp-closer-title">
            <div className="pdp-wrap">
              <header className="pdp-closer__head">
                <h2 id="pdp-closer-title" className="pdp-h2">A Closer Look</h2>
                <p className="pdp-closer__sub">The details that make it special.</p>
              </header>
              <ul className={`pdp-closer__tiles${closerLook.length === 4 ? ' is-quad' : ''}`}>
                {closerLook.map((item) => {
                  const { src, alt, width, height, style } = item.image;
                  const iconName = /cushion|insole|footbed|comfort|sole/i.test(item.title) ? 'layers'
                    : /stitch|finish|upper/i.test(item.title) ? 'stitch'
                    : /heel|height|base/i.test(item.title) ? 'heightArrow' : 'layers';
                  return (
                    <li className="pdp-closer__tile" key={item.title}>
                      <img src={src} alt={alt} width={width} height={height} style={style} loading="lazy" decoding="async" />
                      <span className="pdp-closer__label">
                        <Icon name={iconName} size={26} stroke={1.3} />
                        <span>{item.title}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* ═══════════ STYLE IT ═══════════ */}
        {visibleLooks.length > 0 && (
          <Section
            labelId="pdp-styling-title"
            className="pdp-style"
            eyebrow="Style it"
            title="Pairs Beautifully With"
            intro={`Versatile looks for your ${footwearLabel}, from work to evenings and everything in between.`}
          >
            <div className="pdp-style__grid" style={{ '--n': visibleLooks.length }}>
              {visibleLooks.map((look) => (
                <article className="pdp-style__item" key={look.image}>
                  <div className="pdp-media pdp-media--tall">
                    <img
                      src={`/images/styling/${look.image}`}
                      alt={look.alt || `${look.title} outfit styling illustration`}
                      width="600"
                      height="750"
                      loading="lazy"
                      decoding="async"
                      onError={() => markBroken(`look:${look.image}`)}
                    />
                  </div>
                  <div className="pdp-caption">
                    <h3>{look.title}</h3>
                    <p>{look.note}</p>
                  </div>
                </article>
              ))}
            </div>
          </Section>
        )}

        {/* ═══════════ FIND YOUR FIT ═══════════ */}
        <Section
          id="pdp-size-guidance"
          labelId="pdp-fit-title"
          className={`pdp-fit${sizeGuideOpen ? ' is-open' : ''}`}
          eyebrow="Size & fit"
          title="Find Your Fit"
          intro="Use the size guide to find your perfect size."
          action={
            <button
              type="button"
              className="pdp-btn pdp-btn--outline pdp-fit__toggle"
              onClick={() => setSizeGuideOpen((o) => !o)}
              aria-expanded={sizeGuideOpen}
              aria-controls="pdp-fit-content"
            >
              <span>{sizeGuideOpen ? 'Hide Size Guide' : 'View Size Guide'}</span>
              <Icon name="arrow" size={16} />
            </button>
          }
        >
          <div id="pdp-fit-content" className="pdp-fit__content">
            <figure className="pdp-fit__figure">
              <img
                src="/images/product-details/foot-measurement-guide.webp"
                alt="Foot measurement guide showing side and sole views"
                width="560"
                height="576"
                loading="lazy"
                decoding="async"
              />
              <figcaption><strong>Foot length:</strong> measure from the tip of your longest toe to the back of your heel.</figcaption>
            </figure>
            <div className="pdp-fit__table">
              <table>
                <caption>Women's size conversion</caption>
                <thead>
                  <tr><th scope="col">EU / IND</th><th scope="col">UK</th><th scope="col">US</th><th scope="col">CM</th></tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map(([eu, uk, us, cm]) => (
                    <tr key={eu}><td>{eu}</td><td>{uk}</td><td>{us}</td><td>{cm}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* ═══════════ COMPLETE THE LOOK ═══════════ */}
        {product.completeTheLook?.length > 0 && (
          <Section
            labelId="pdp-look-title"
            className="pdp-look"
            title="Complete the Look"
            intro={product.stylingNote || 'Discover pieces that pair seamlessly with this style.'}
          >
            <ul className="pdp-rail">
              {product.completeTheLook.map((item, i) => (
                <li key={i} className="pdp-rail__item">
                  <div className="pdp-media pdp-media--square"><img src={item.img} alt={item.label} loading="lazy" /></div>
                  <p className="pdp-rail__name">{item.label}</p>
                  <p className="pdp-rail__price">{item.price}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ═══════════ PRODUCT INFORMATION ═══════════ */}
        <Section labelId="pdp-info-title" className="pdp-info" title="Product Information">
          <ul className="pdp-acc">
            {infoItems.map((item) => {
              const open = openInfo === item.id;
              return (
                <li key={item.id} className={`pdp-acc__item${open ? ' is-open' : ''}`}>
                  <h3>
                    <button
                      type="button"
                      className="pdp-acc__trigger"
                      onClick={() => setOpenInfo(open ? null : item.id)}
                      aria-expanded={open}
                      aria-controls={`pdp-acc-${item.id}`}
                    >
                      <Icon name={item.icon} size={22} stroke={1.3} />
                      <span>{item.title}</span>
                      <span className="pdp-acc__plus" aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={`pdp-acc-${item.id}`} className="pdp-acc__panel" role="region" hidden={!open}>
                    <div className="pdp-acc__content">{item.content}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* ═══════════ CUSTOMER REVIEWS (real data only) ═══════════ */}
        {(hasRating || reviewList.length > 0) && (
          <section id="pdp-reviews" className="pdp-section pdp-reviews" aria-labelledby="pdp-reviews-title">
            <div className="pdp-wrap pdp-reviews__grid">
              <div className="pdp-reviews__summary">
                <p className="pdp-eyebrow">Reviews</p>
                <h2 id="pdp-reviews-title" className="pdp-h2">Customer Reviews</h2>
                {hasRating && (
                  <div className="pdp-reviews__score">
                    <span className="pdp-reviews__num">{Number(displayRating).toFixed(1)}<small> / 5</small></span>
                    <span className="pdp-reviews__meta"><Stars value={Number(displayRating)} /> <span>({reviewCount} reviews)</span></span>
                  </div>
                )}
              </div>
              {currentReview ? (
                <figure className="pdp-reviews__quote">
                  <blockquote>“{currentReview.text}”</blockquote>
                  <figcaption>
                    <span>{currentReview.author}</span>
                    {currentReview.date && <span className="pdp-reviews__date">{currentReview.date}</span>}
                    {Number.isFinite(Number(currentReview.rating)) && <Stars value={Number(currentReview.rating)} />}
                  </figcaption>
                  {reviewList.length > 1 && (
                    <div className="pdp-reviews__nav">
                      <button type="button" onClick={() => setReviewIndex((i) => (i - 1 + reviewList.length) % reviewList.length)} aria-label="Previous review"><Icon name="chevL" size={18} /></button>
                      <span className="pdp-dots" aria-hidden="true">
                        {reviewList.slice(0, 6).map((_, i) => <i key={i} className={i === reviewIndex % reviewList.length ? 'is-on' : ''} />)}
                      </span>
                      <button type="button" onClick={() => setReviewIndex((i) => (i + 1) % reviewList.length)} aria-label="Next review"><Icon name="chevR" size={18} /></button>
                    </div>
                  )}
                </figure>
              ) : (
                <p className="pdp-reviews__empty">Review details are not available yet.</p>
              )}
            </div>
          </section>
        )}

        {/* ═══════════ FAQ ═══════════ */}
        {product.productSpecificQuestions?.length > 0 && (
          <Section labelId="pdp-faq-title" className="pdp-faq" eyebrow="Common questions" title="Frequently Asked">
            <ul className="pdp-acc">
              {product.productSpecificQuestions.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <li key={i} className={`pdp-acc__item${open ? ' is-open' : ''}`}>
                    <h3>
                      <button type="button" className="pdp-acc__trigger pdp-acc__trigger--plain" onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} aria-controls={`pdp-faq-${i}`}>
                        <span>{faq.q}</span>
                        <span className="pdp-acc__plus" aria-hidden="true" />
                      </button>
                    </h3>
                    <div id={`pdp-faq-${i}`} className="pdp-acc__panel" role="region" hidden={!open}>
                      <div className="pdp-acc__content"><p>{faq.a}</p></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {/* ═══════════ YOU MAY ALSO LIKE (same collection, real products) ═══════════ */}
        {relatedProducts.length > 0 && (
          <Section labelId="pdp-related-title" className="pdp-related" title="You May Also Like">
            <div className="pdp-related__grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={{ ...p, imgHover: p.imgSecond || p.imgHover }} />
              ))}
            </div>
          </Section>
        )}

        {/* ═══════════ RECENTLY VIEWED (this device only) ═══════════ */}
        {recentlyViewed.length > 0 && (
          <Section labelId="pdp-recent-title" className="pdp-recent" title="Recently Viewed">
            <ul className="pdp-recent__list">
              {recentlyViewed.map((p) => (
                <li key={p.handle}>
                  <Link to={productPath(p.handle)} className="pdp-recent__item">
                    <span className="pdp-recent__img">{p.img && <img src={p.img} alt="" loading="lazy" />}</span>
                    <span className="pdp-recent__name">{String(p.name || '').replace(/^syora\s+/i, '') || p.name}</span>
                    {p.price > 0 && <span className="pdp-recent__price">₹{Number(p.price).toLocaleString('en-IN')}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ═══════════ ASSURANCES + COLLECTION BANNER ═══════════ */}
        <div className="pdp-wrap">
          <TrustRow className="pdp-trust--page" />
        </div>
        {universe && (
          <div className="pdp-wrap">
            <aside className="pdp-banner" aria-label={`${titleCase(universe.name)} collection`}>
              <div className="pdp-banner__media" aria-hidden="true">
                <img src={universe.heroImage} alt="" loading="lazy" style={universe.bandPosition ? { objectPosition: universe.bandPosition } : undefined} />
              </div>
              <div className="pdp-banner__copy">
                <p className="pdp-eyebrow">The {titleCase(universe.name)} Edit</p>
                <p className="pdp-banner__title">{universe.tagline}</p>
                <p className="pdp-banner__text">{firstSentence(universe.editorial)}</p>
                <Link to={`/universe/${product.universeId}`} className="pdp-btn pdp-btn--primary pdp-banner__cta">
                  <span>Explore the Collection</span>
                  <Icon name="arrow" size={16} />
                </Link>
              </div>
            </aside>
          </div>
        )}
        <div ref={endRef} className="pdp-end" aria-hidden="true" />
      </main>

      {/* ═══════════ STICKY BUY BAR (mobile / tablet) ═══════════ */}
      <div className={`pdp-sticky${stickyVisible ? ' is-visible' : ''}`} aria-hidden={!stickyVisible}>
        <div className="pdp-sticky__inner">
          {addToBagButton('pdp-add-to-bag-sticky')}
          {wishlistButton}
        </div>
      </div>

      {/* ═══════════ LIGHTBOX ═══════════ */}
      {lightbox && (
        <Lightbox
          name={product.name}
          src={product.images[activeImg]}
          position={activePosition}
          total={galleryImageIndices.length}
          onClose={() => setLightbox(false)}
          onMove={moveGalleryImage}
        />
      )}

      <Footer />
    </div>
  );
}
