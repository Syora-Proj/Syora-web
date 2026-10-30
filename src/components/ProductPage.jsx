import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useShopifyProduct } from '../hooks/useShopifyProduct';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/shopify/products';
import { getCheckoutUrl } from '../lib/shopify/cart';
import { trackViewItem, trackAddToCart } from '../lib/analytics';

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

export default function ProductPage({ handle }) {
  const navigate = useNavigate();

  // Fetch the Shopify product by the handle captured from /product/:handle.
  const { product, loading: productLoading, error: productError, retry } = useShopifyProduct(handle);

  // Cart operations
  const { addToCart, cartLoading, cartError } = useCart();

  const [activeImg, setActiveImg]         = useState(0);
  const [selectedColour, setColour]       = useState(0);
  const [selectedSize, setSize]           = useState(null);
  const [selectedVariantId, setVariantId] = useState(null);
  const [sizeError, setSizeError]         = useState(false);
  const [wishlisted, setWishlisted]       = useState(false);
  const [addedToCart, setAddedToCart]     = useState(false);
  const [cartFeedback, setCartFeedback]   = useState(null); // 'added' | 'error'
  const [pinCode, setPinCode]             = useState('');
  const [pinResult, setPinResult]         = useState(null);
  const [pinLoading, setPinLoading]       = useState(false);
  const [openAccordion, setAccordion]     = useState(null);
  const [openProductPanel, setProductPanel] = useState(null);
  const [shareFeedback, setShareFeedback] = useState('');
  const [openFaq, setOpenFaq]             = useState(null);

  const heroRef     = useRef(null);
  const sizeGuideRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    setColour(0);
    setActiveImg(product?.colours?.[0]?.galleryIndices?.[0] ?? product?.colours?.[0]?.imageIndex ?? 0);
  }, [product?.handle]);

  // Cycle product photos every five seconds on mobile/tablet layouts.
  // A timeout (rather than a fixed interval) gives each newly selected image
  // a full five seconds and restarts after manual navigation. The carousel
  // pauses while the tab is hidden and resumes when it becomes visible.
  useEffect(() => {
    const imageCount = product?.images?.length ?? 0;
    if (imageCount < 2 || product?.colours?.length > 1) return;

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
  }, [product?.images?.length, product?.colours?.length, activeImg]);

  // Fire view_item analytics event when product loads
  useEffect(() => {
    if (product) trackViewItem(product);
  }, [product]);

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

  // Loading state
  if (productLoading) {
    return (
      <div className="pdp2-loading-state">
        <Navbar />
        <div className="pdp2-loading-inner">
          <div className="pdp2-loading-spinner" />
          <p>Loading product…</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (productError || !product) {
    return (
      <div className="pdp2-not-found">
        <Navbar />
        <div className="pdp2-error-content" role="alert">
          <p className="pdp2-section-eyebrow">{productError ? 'PRODUCT UNAVAILABLE' : 'PRODUCT NOT FOUND'}</p>
          <h1 className="pdp2-section-heading">
            {productError ? 'We could not load this product.' : 'This product could not be found.'}
          </h1>
          <p>{productError || 'The Shopify product handle may be incorrect, or the product may no longer be published.'}</p>
          <div className="pdp2-error-actions">
            {productError && <button onClick={retry}>TRY AGAIN</button>}
            <button onClick={() => navigate(-1)}>← GO BACK</button>
            <button onClick={() => navigate('/')}>THE MULTIVERSE</button>
          </div>
        </div>


      <Footer />
      </div>
    );
  }

  const galleryImageIndices = getColourGalleryIndices();
  function moveGalleryImage(direction) {
    setActiveImg((current) => {
      const currentPosition = galleryImageIndices.indexOf(current);
      const start = currentPosition < 0 ? 0 : currentPosition;
      return galleryImageIndices[(start + direction + galleryImageIndices.length) % galleryImageIndices.length];
    });
  }

  async function handleAddToCart() {
    if (!selectedVariantId) { setSizeError(true); setTimeout(() => setSizeError(false), 2200); return; }
    const result = await addToCart(selectedVariantId, 1);
    if (result) {
      // Fire GA4 add_to_cart event
      const variant = product.variantMap?.[selectedSize];
      trackAddToCart(product, variant, 1);
      setAddedToCart(true);
      setCartFeedback('added');
      setTimeout(() => { setAddedToCart(false); setCartFeedback(null); }, 2500);
    } else {
      setCartFeedback('error');
      setTimeout(() => setCartFeedback(null), 3000);
    }
  }

  async function handleBuyNow() {
    if (!selectedVariantId) { setSizeError(true); setTimeout(() => setSizeError(false), 2200); return; }
    await addToCart(selectedVariantId, 1);
    // Redirect immediately to Shopify checkout
    const url = await getCheckoutUrl();
    if (url) window.location.href = url;
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
    if (Math.abs(dx) > 50) {
      const galleryIndices = getColourGalleryIndices();
      setActiveImg((current) => {
        const currentPosition = galleryIndices.indexOf(current);
        const start = currentPosition < 0 ? 0 : currentPosition;
        const direction = dx < 0 ? 1 : -1;
        return galleryIndices[(start + direction + galleryIndices.length) % galleryIndices.length];
      });
    }
    touchStartX.current = null;
  }

  // Related products — not yet populated from Shopify; will be empty initially
  const related = [];

  // The user supplied the current Glitter Flat review summary for the PDP.
  const reviewCount   = handle === 'glitter-flat' ? 5 : (product.reviewCount || 0);
  const displayRating = handle === 'glitter-flat' ? 4.2 : product.rating;
  const isNewArrival  = reviewCount === 0;
  const hasFewReviews = reviewCount > 0 && reviewCount < 10;
  const hasRating = Number.isFinite(Number(displayRating)) && Number(displayRating) > 0 && reviewCount > 0;
  const realReviews = Array.isArray(product.reviews) ? product.reviews : [];
  const demoReviews = [
    { id: 'demo-1', author: 'Demo review 01', date: 'SAMPLE', rating: 5, text: 'A beautiful finishing touch for a festive outfit. The look feels polished without being overdone.' },
    { id: 'demo-2', author: 'Demo review 02', date: 'SAMPLE', rating: 4, text: 'The detailed design adds a little sparkle and makes simple occasionwear feel special.' },
    { id: 'demo-3', author: 'Demo review 03', date: 'SAMPLE', rating: 4, text: 'An elegant style for celebrations and evening plans.' },
    { id: 'demo-4', author: 'Demo review 04', date: 'SAMPLE', rating: 4, text: 'The embellishment catches the light nicely and pairs well with traditional looks.' },
    { id: 'demo-5', author: 'Demo review 05', date: 'SAMPLE', rating: 4, text: 'A graceful statement piece that brings a little extra polish to the outfit.' },
  ];
  const isDemoReviews = handle === 'glitter-flat' && realReviews.length === 0;
  const reviewList = realReviews.length ? realReviews : (isDemoReviews ? demoReviews : []);
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
      { image: 'black-pump-formals-model.png', title: 'Formals', note: 'A sharp, confident finish for workdays and polished occasions.', alt: 'Model wearing black SYORA slingback heels with tailored formal trousers and a black blazer' },
      { image: 'black-pump-dress-model.png', title: 'Dress', note: 'A sleek black heel for evening dresses and special plans.', alt: 'Model wearing black SYORA slingback heels with an elegant black evening dress' },
      { image: 'black-pump-indo-western-model.png', title: 'Indo-western', note: 'Classic black heels bring a refined finish to festive fusion wear.', alt: 'Model wearing black SYORA slingback heels with a black and gold Indo-western outfit' },
    ]
    : {
    icon: [
      { image: 'heels-saree-model.png', title: 'Saree', note: 'A graceful saree look for celebrations and evenings.', alt: 'Model wearing SYORA black heels with a sage green saree' },
      { image: 'heels-western-model.png', title: 'Western', note: 'A polished heel to finish tailored western looks.', alt: 'Model wearing SYORA black heels with a black top and tailored trousers' },
      { image: 'heels-indo-western-model.png', title: 'Indo-western', note: 'A contemporary fusion look, finished with classic heels.', alt: 'Model wearing SYORA black heels with an embroidered Indo-western outfit' },
    ],
    heritage: [
      { image: 'lehenga-style.png', title: 'Lehenga', note: 'Traditional craft meets a festive silhouette.' },
      { image: 'saree-style.png', title: 'Saree', note: 'A considered pairing for zari and mirror details.' },
      { image: 'anarkali-style.png', title: 'Anarkali', note: 'A graceful choice for daytime celebrations.' },
    ],
    everyday: [
      { image: 'workwear-flats.png', title: 'Workwear', note: 'A refined finish for office days and plans after.' },
      { image: 'saree-style.png', title: 'Saree', note: 'An easy way to dress up a simple occasion look.' },
      { image: 'anarkali-style.png', title: 'Anarkali', note: 'A comfortable, polished pairing for celebrations.' },
    ],
    motion: [
      { image: 'denim-sneakers.png', title: 'Denim', note: 'An easy match for everyday city plans.' },
      { image: 'workwear-flats.png', title: 'Smart casual', note: 'Keep weekday dressing comfortable and composed.' },
      { image: 'relaxed-clogs.png', title: 'Relaxed layers', note: 'A laid-back look for slower days.' },
    ],
    'off-duty': [
      { image: 'relaxed-clogs.png', title: 'Relaxed layers', note: 'An easy fit for off-duty comfort.' },
      { image: 'denim-sneakers.png', title: 'Denim', note: 'Casual layers for errands and weekends.' },
      { image: 'workwear-flats.png', title: 'Smart casual', note: 'A relaxed look that still feels put together.' },
    ],
    boots: [
      { image: 'workwear-flats.png', title: 'Tailored layers', note: 'Clean lines bring balance to a strong boot.' },
      { image: 'denim-sneakers.png', title: 'Denim', note: 'A versatile pairing for everyday wear.' },
      { image: 'lehenga-style.png', title: 'Festive', note: 'A modern contrast for statement dressing.' },
    ],
    }[stylingUniverse] || [];

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
  const availableFact = (value) => value && !/^(—|-|n\/a)$/i.test(String(value).trim());
  const cushionFact = product.benefits?.find(({ text = '' }) => /cushion|foam|footbed|insole/i.test(text))?.text
    || (availableFact(product.soleType) && /cushion|foam|footbed|insole/i.test(product.soleType) ? product.soleType : null)
    || (availableFact(product.comfortProfile?.cushioning) ? `${product.comfortProfile.cushioning} cushioning` : null);
  const comfortFact = availableFact(product.comfortProfile?.bestForHours)
    ? `Comfort profile: ${product.comfortProfile.bestForHours}.`
    : (availableFact(product.soleType) ? `${product.soleType}.` : null);
  const everydayCloserLook = isEverydayFlat && everydayGallery.length > 0 ? [
    {
      title: 'Cushioning',
      image: chooseEverydayImage(/footbed|insole|cushion|foam|interior/i, everydayFeatureIndices.cushioning),
      copy: cushionFact || `A close look at the footbed of ${product.name}.`,
    },
    {
      title: 'Stitching & finish',
      image: chooseEverydayImage(/stitch|seam|texture|upper|finish|close.?up|detail/i, everydayFeatureIndices.finish),
      copy: availableFact(product.material)
        ? `A closer look at the ${product.material} upper and its visible finish.`
        : `A close-up of the upper finish, edge detailing, and stitching on ${product.name}.`,
    },
    {
      title: 'Comfort & sole',
      image: chooseEverydayImage(/sole|outsole|side|profile|base|comfort|wear/i, everydayFeatureIndices.sole),
      copy: comfortFact || `A side or outsole view of ${product.name}, showing its sole profile.`,
    },
  ] : [];

  const policyPanels = [
    {
      title: 'SHIPPING & EXCHANGE',
      content: (
        <>
          <p>We ship across India to serviceable PIN codes. Estimated delivery is 5–7 business days.</p>
          <p>Cash on Delivery is available across India wherever the PIN code and courier are serviceable.</p>
          <p>For a size or colour exchange, contact SYORA within 48 hours of delivery. Items must be unworn and returned with their original packaging and tags. Exchanges are subject to availability.</p>
          <p>If your order arrives damaged or you receive the wrong item, please contact us within 48 hours with your order number and clear photos. We will arrange an appropriate resolution. No change-of-mind returns are offered; this does not limit remedies required by applicable consumer law.</p>
        </>
      ),
    },
    {
      title: 'COMPOSITION & CARE',
      content: (
        <>
          <p><strong>Composition:</strong> {product.material || 'Material details are not provided in the current product listing. Please refer to the product label or contact SYORA support.'}</p>
          <p><strong>Care:</strong> Wipe gently with a soft, dry cloth. Keep away from prolonged moisture, direct heat, and harsh chemicals. Store in a cool, dry place.</p>
        </>
      ),
    },
    {
      title: 'BRAND DETAILS',
      content: (
        <>
          <p><strong>Brand:</strong> {product.vendor || 'SYORA'}</p>
        </>
      ),
    },
  ];

  /* CTA label */
  const isProcessing = cartLoading;
  const ctaLabel = isProcessing
    ? 'ADDING…'
    : addedToCart
      ? '✓ ADDED TO BAG'
      : selectedSize
        ? `BUY NOW — SIZE ${selectedSize}`
        : 'SELECT SIZE';

  /* Variant availability */
  function isSizeAvailable(size) {
    const variant = product.variantMap?.[size];
    if (!variant) return false;
    return variant.availableForSale !== false;
  }

  return (
    <div className="pdp2">
      <title>{product.pageTitle}</title>
      <meta name="description" content={product.pageDescription} />

      <Navbar universeMode universeId={product.universeId} />

      {/* ═══════════ OFFER BANNER ═══════════ */}
      {product.offerBanner && (
        <div className="pdp2-offer-banner" role="banner">
          <span>🎁</span>
          <span>{product.offerBanner}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          HERO — CSS places the gallery before product details on mobile;
          the desktop grid keeps the split gallery and information layout.
      ═══════════════════════════════════════════════ */}
      <section className="pdp2-hero" ref={heroRef}>

          {/* Product name and price follow the gallery in the mobile reading order. */}
        <div className="pdp2-info-top pdp2-info">
          {/* Mobile: breadcrumb / universe label */}
          <nav className="pdp2-info__breadcrumb" aria-label="Breadcrumb">
            <span onClick={() => navigate('/')} style={{cursor:'pointer'}}>Home</span>
            <span className="pdp2-info__breadcrumb-sep">/</span>
            <span onClick={() => navigate(`/universe/${product.universeId}`)} style={{cursor:'pointer'}}>{product.category}</span>
            <span className="pdp2-info__breadcrumb-sep">/</span>
            <span>{product.subCategory}</span>
          </nav>

          {/* Badge */}
          {product.badge && (
            <span className="pdp2-info__badge">{product.badge}</span>
          )}

          {/* Rating */}
          <div className="pdp2-info__rating">
            {isNewArrival ? (
              <span className="pdp2-info__new-arrival">✦ New Arrival</span>
            ) : (
              <>
                <span className="pdp2-info__rating-num">{Number(displayRating).toFixed(1)}</span>
                <div className="pdp2-stars" aria-label={`${displayRating} out of 5 stars`}>
                  {[1,2,3,4,5].map(s => {
                    const fill = Math.max(0, Math.min(1, Number(displayRating) - s + 1));
                    return <span
                      key={s}
                      className={`pdp2-star ${fill === 1 ? 'pdp2-star--filled' : fill > 0 ? 'pdp2-star--half' : ''}`}
                      style={hasRating ? {
                        background: `linear-gradient(90deg, #1a1412 ${fill * 100}%, #bdbdbd ${fill * 100}%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      } : undefined}
                    >★</span>;
                  })}
                </div>
                <button
                  className="pdp2-info__rating-link"
                  onClick={() => {
                    setProductPanel('reviews');
                    document.getElementById('pdp2-product-reviews')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  ({reviewCount})
                </button>
              </>
            )}
          </div>

          {/* Name */}
          <h1 className="pdp2-info__name">{product.name}</h1>

          {/* Price row */}
          <div className="pdp2-info__price-row">
            <span className="pdp2-info__price">
              {product.price ? `₹${product.price.toLocaleString('en-IN')}` : ''}
            </span>
            {product.originalPrice > 0 && product.originalPrice > product.price && (
              <span className="pdp2-info__original-price">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className="pdp2-info__discount">{product.discountPercent}% OFF</span>
            )}
          </div>
          <p className="pdp2-info__tax-note">Inclusive of all taxes</p>

          {/* Desktop-only: offer pill */}
          {product.offerBanner && (
            <div className="pdp2-info__offer-pill pdp2-desktop-only">
              <span>🎁</span> {product.offerBanner}
            </div>
          )}
        </div>

        {/* ── Gallery (renders SECOND = below top info on mobile) ── */}
        <div
          className="pdp2-gallery"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Badge — desktop only (mobile badge is in info) */}
          {product.badge && (
            <div className={`pdp2-gallery__badge pdp2-gallery__badge--${product.badge.toLowerCase().replace(' ', '-')} pdp2-desktop-only`}>
              {product.badge}
            </div>
          )}

          {/* Main image */}
          <div className="pdp2-gallery__main">
            <img
              key={activeImg}
              src={product.images[activeImg]}
              alt={`${product.name} — view ${activeImg + 1}`}
              className="pdp2-gallery__img"
            />
            <button
              className="pdp2-gallery__arrow pdp2-gallery__arrow--prev"
              onClick={() => moveGalleryImage(-1)}
              aria-label="Previous image"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              className="pdp2-gallery__arrow pdp2-gallery__arrow--next"
              onClick={() => moveGalleryImage(1)}
              aria-label="Next image"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="pdp2-gallery__thumbs pdp2-desktop-only" role="list" aria-label="Product images">
            {galleryImageIndices.map((imageIndex, i) => (
              <button
                key={imageIndex}
                className={`pdp2-gallery__thumb ${imageIndex === activeImg ? 'pdp2-gallery__thumb--active' : ''}`}
                onClick={() => setActiveImg(imageIndex)}
                aria-label={`View image ${i + 1}`}
                role="listitem"
              >
                <img src={product.images[imageIndex]} alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>

          {/* Dot nav — mobile */}
          <div className="pdp2-gallery__dots" aria-hidden="true">
            {galleryImageIndices.map((imageIndex, i) => (
              <button
                key={imageIndex}
                className={`pdp2-gallery__dot ${imageIndex === activeImg ? 'pdp2-gallery__dot--active' : ''}`}
                onClick={() => setActiveImg(imageIndex)}
              />
            ))}
          </div>
        </div>

        {product.colours?.length > 0 && (
          <div className="pdp2-mobile-colours pdp2-mobile-only">
            <p className="pdp2-mobile-colours__label">Colours</p>
            <div className="pdp2-mobile-colours__grid">
              {product.colours.map((colour, index) => (
                <button
                  key={colour.name}
                  className={`pdp2-mobile-colour-thumb ${index === selectedColour ? 'pdp2-mobile-colour-thumb--active' : ''}`}
                  onClick={() => handleColourSelect(index)}
                  aria-label={`Select colour: ${colour.name}`}
                  aria-pressed={index === selectedColour}
                >
                  {colour.image
                    ? <img className="pdp2-colour-image" src={colour.image} alt="" />
                    : <span className="pdp2-mobile-colour-thumb__swatch" style={{ background: colour.hex }} />}
                  <span className="pdp2-mobile-colour-thumb__name">
                    <span className="pdp2-colour-indicator" style={{ backgroundColor: colour.hex }} aria-hidden="true" />
                    {colour.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Info panel BOTTOM (renders THIRD = below gallery on mobile) ── */}
        <div className="pdp2-info-bottom pdp2-info">

          {/* We keep this divider to separate gallery and the bottom section on mobile,
              but on desktop it separates top and bottom. Wait, on desktop we'll handle with padding/borders. */}
          <div className="pdp2-info__divider" />

          {/* ── Colour picker ── */}
          {product.colours && product.colours.length >= 1 && (
            <div className="pdp2-info__field pdp2-desktop-colours">
              <p className="pdp2-info__label pdp2-info__label--bold">
                Colours
              </p>
              <div className="pdp2-colour-swatches">
                {product.colours.map((c, i) => (
                  <button
                    key={i}
                    className={`pdp2-swatch ${i === selectedColour ? 'pdp2-swatch--active' : ''}`}
                    onClick={() => handleColourSelect(i)}
                    title={c.name}
                    aria-label={`Select colour: ${c.name}`}
                    aria-pressed={i === selectedColour}
                  >
                    {c.image
                      ? <img className="pdp2-colour-image" src={c.image} alt="" />
                      : <span className="pdp2-colour-swatch__fill" style={{ background: c.hex }} />}
                    <span className="pdp2-swatch__name">
                      <span className="pdp2-colour-indicator" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Size picker ── */}
          <div className="pdp2-info__field">
            <div className="pdp2-size__header">
              <p className="pdp2-info__label pdp2-info__label--bold">Sizes</p>
              <button
                className="pdp2-size__guide-link"
                onClick={() => sizeGuideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                aria-label="Open size guide"
                aria-controls="pdp2-size-guidance"
              >
                Size guide
              </button>
            </div>

            <div className={`pdp2-sizes ${sizeError ? 'pdp2-sizes--error' : ''}`}>
              {product.sizes.map(sz => {
                const available = isSizeAvailable(sz);
                return (
                  <button
                    key={sz}
                    id={`pdp2-size-${sz}`}
                    className={`pdp2-size-btn ${selectedSize === sz ? 'pdp2-size-btn--active' : ''} ${!available ? 'pdp2-size-btn--soldout' : ''}`}
                    onClick={() => available && handleSizeSelect(sz)}
                    aria-pressed={selectedSize === sz}
                    aria-label={available ? `Size ${sz}` : `Size ${sz} — sold out`}
                    disabled={!available}
                    title={!available ? 'Sold out' : undefined}
                  >
                    {sz}
                    {!available && <span className="pdp2-size-btn__soldout-line" />}
                  </button>
                );
              })}
            </div>

            {sizeError && (
              <p className="pdp2-size__error" role="alert">Please select a size to continue.</p>
            )}

            {/* Fit note box */}
            {product.fitNote && product.fitNote !== 'Not known yet' && (
              <div className="pdp2-fit-note-box">
                <span className="pdp2-fit-note-box__icon">ⓘ</span>
                <p><strong>{product.fitNote}.</strong> We recommend ordering your usual size.</p>
              </div>
            )}
          </div>

          {/* ── Delivery PIN checker (desktop only) ── */}
          <div className="pdp2-pin-checker pdp2-desktop-only">
            <p className="pdp2-pin-checker__label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Check delivery to your PIN code
            </p>
            <div className="pdp2-pin-checker__row">
              <input
                id="pdp2-pin-input"
                className="pdp2-pin-input"
                type="tel"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter PIN code"
                value={pinCode}
                onChange={e => { setPinCode(e.target.value.replace(/\D/g, '')); setPinResult(null); }}
                onKeyDown={e => e.key === 'Enter' && handlePinCheck()}
                aria-label="PIN code for delivery check"
              />
              <button className="pdp2-pin-btn" onClick={handlePinCheck} disabled={pinLoading}>
                {pinLoading ? '...' : 'Check'}
              </button>
            </div>
            {pinResult && !pinResult.error && (
              <p className="pdp2-pin-result pdp2-pin-result--ok">
                ✓ Delivery in <strong>{pinResult.date}</strong>
                {pinResult.cod && <span className="pdp2-cod-badge">COD available</span>}
              </p>
            )}
            {pinResult?.error && (
              <p className="pdp2-pin-result pdp2-pin-result--err">{pinResult.error}</p>
            )}
          </div>

        </div>

      </section>

            {everydayCloserLook.length > 0 && (
              <section className="pdp2-feature-stories" aria-labelledby="pdp2-everyday-stories-title">
                <h2 id="pdp2-everyday-stories-title">A closer look</h2>
                <div className="pdp2-feature-stories__grid">
                  {everydayCloserLook.map((story, index) => (
                    <article className="pdp2-feature-card" key={`${product.handle}-everyday-detail-${index}`}>
                      <div className="pdp2-feature-card__image">
                        <img
                          src={story.image.url}
                          alt={story.image.altText || `${product.name} — product gallery view ${(story.image.index ?? 0) + 1}`}
                          width={story.image.width || undefined}
                          height={story.image.height || undefined}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="pdp2-feature-card__copy">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <h3>{story.title}</h3>
                        <p>{story.copy}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {handle === 'glitter-flat' && (
              <section className="pdp2-feature-stories" aria-labelledby="pdp2-feature-stories-title">
                <h2 id="pdp2-feature-stories-title">A closer look</h2>
                <div className="pdp2-feature-stories__grid">
                  <article className="pdp2-feature-card">
                    <div className="pdp2-feature-card__image">
                      <img
                        src={isGlitterFlatBurgundy
                          ? '/images/product-details/glitter-flat-burgundy-footbed-feel.png'
                          : '/images/product-details/glitter-flat-footbed-feel.png'}
                        alt={isGlitterFlatBurgundy
                          ? 'Close-up of the Burgundy Glitter Flat footbed with the gold SYORA wordmark'
                          : 'Close-up showing the cushioned burgundy footbed beneath the glossy black strap'}
                        width="1130"
                        height="1392"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="pdp2-feature-card__copy">
                      <span>01</span>
                      <h3>Footbed feel</h3>
                      <p>A closer view of the footbed, framed by the glossy strap.</p>
                    </div>
                  </article>
                  <article className="pdp2-feature-card">
                    <div className="pdp2-feature-card__image">
                      <img
                        src={isGlitterFlatBurgundy
                          ? '/images/product-details/glitter-flat-burgundy-finish-stitching.png'
                          : '/images/product-details/glitter-flat-texture.jpg'}
                        alt={isGlitterFlatBurgundy
                          ? 'Macro detail of the Burgundy patent upper and stitched edge'
                          : 'Macro detail of the glossy black upper and stitched edge'}
                        width="962"
                        height="1200"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="pdp2-feature-card__copy">
                      <span>02</span>
                      <h3>Finish &amp; stitching</h3>
                      <p>The smooth patent finish and fine edge detail up close.</p>
                    </div>
                  </article>
                  <article className="pdp2-feature-card">
                    <div className="pdp2-feature-card__image">
                      <img
                        src={isGlitterFlatBurgundy
                          ? '/images/product-details/glitter-flat-burgundy-heel-base.png'
                          : '/images/product-details/glitter-flat-heel.jpg'}
                        alt={isGlitterFlatBurgundy
                          ? 'Side close-up of the Burgundy Glitter Flat heel and base'
                          : "Side close-up showing the shoe's broad low block heel"}
                        width="962"
                        height="1200"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="pdp2-feature-card__copy">
                      <span>03</span>
                      <h3>Heel height &amp; base</h3>
                      <p>A side view of the low block heel and its broad base.</p>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {handle === 'black-pumps' && (
              <section className="pdp2-feature-stories" aria-labelledby="pdp2-feature-stories-title">
                <h2 id="pdp2-feature-stories-title">A closer look</h2>
                <div className="pdp2-feature-stories__grid">
                  <article className="pdp2-feature-card">
                    <div className="pdp2-feature-card__image">
                      <img
                        src="/images/product-details/black-pumps-cushioning.png"
                        alt="Close-up of the Black Pumps cushioned burgundy footbed, pressed to show its padding"
                        width="1254"
                        height="1254"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="pdp2-feature-card__copy">
                      <span>01</span>
                      <h3>Cushioned insole</h3>
                      <p>A close-up of the soft burgundy footbed and its gentle cushioning.</p>
                    </div>
                  </article>
                  <article className="pdp2-feature-card">
                    <div className="pdp2-feature-card__image">
                      <img
                        src="/images/product-details/black-pumps-stitching.png"
                        alt="Macro detail of the Black Pumps glossy black finish and fine stitched edge"
                        width="1254"
                        height="1254"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="pdp2-feature-card__copy">
                      <span>02</span>
                      <h3>Finish &amp; stitching</h3>
                      <p>Look closely at the glossy patent finish and neatly stitched edge.</p>
                    </div>
                  </article>
                  <article className="pdp2-feature-card">
                    <div className="pdp2-feature-card__image">
                      <img
                        src={product.images?.[3] || product.images?.[0]}
                        alt="Fourth gallery view of the Black Pumps showing the block heel height and base"
                        width="1200"
                        height="1200"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="pdp2-feature-card__copy">
                      <span>03</span>
                      <h3>Block height</h3>
                      <p>A side view of the heel height and the shape of its base.</p>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {handle === 'black-pump' && (
              <section className="pdp2-feature-stories" aria-labelledby="pdp2-feature-stories-title">
                <h2 id="pdp2-feature-stories-title">A closer look</h2>
                <div className="pdp2-feature-stories__grid">
                  <article className="pdp2-feature-card">
                    <div className="pdp2-feature-card__image">
                      <img
                        src="/images/product-details/black-pump-cushioning.png"
                        alt="Close-up of the Black Pump's cushioned black footbed being pressed to show its padding"
                        width="1656"
                        height="1110"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="pdp2-feature-card__copy">
                      <span>01</span>
                      <h3>Cushioned insole</h3>
                      <p>A close-up of the soft footbed and its gentle cushioning.</p>
                    </div>
                  </article>
                  <article className="pdp2-feature-card">
                    <div className="pdp2-feature-card__image">
                      <img
                        src="/images/product-details/black-pump-stitching.png"
                        alt="Macro detail of the Black Pump's glossy patent finish and fine stitched edge"
                        width="1536"
                        height="1024"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="pdp2-feature-card__copy">
                      <span>02</span>
                      <h3>Finish &amp; stitching</h3>
                      <p>Look closely at the glossy patent finish and neatly stitched edge.</p>
                    </div>
                  </article>
                  <article className="pdp2-feature-card">
                    <div className="pdp2-feature-card__image">
                      <img
                        src={product.images?.[3] || product.images?.[0]}
                        alt="Close-up from the fourth Black Pump gallery image, focused on the slingback heel and heel base"
                        width="1200"
                        height="1200"
                        loading="lazy"
                        decoding="async"
                        style={{
                          objectPosition: 'left center',
                          transform: 'scale(1.25)',
                          transformOrigin: 'left center',
                        }}
                      />
                    </div>
                    <div className="pdp2-feature-card__copy">
                      <span>03</span>
                      <h3>Heel height &amp; base</h3>
                      <p>A closer view of the slingback heel and its base.</p>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {stylingLooks.length > 0 && (
              <section className="pdp2-styling" aria-labelledby="pdp2-styling-title">
                <p className="pdp2-styling__eyebrow">STYLING</p>
                <h2 id="pdp2-styling-title">Pairs beautifully with {footwearLabel}</h2>
                <div className="pdp2-styling__grid">
                  {stylingLooks.map((look, index) => (
                    <article
                      className={`pdp2-styling-card${stylingUniverse === 'icon' ? ' pdp2-styling-card--model' : ''}`}
                      key={look.image}
                    >
                      <img
                        src={`/images/styling/${look.image}`}
                        alt={look.alt || `${look.title} outfit styling illustration`}
                        width="600"
                        height="750"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="pdp2-styling-card__copy">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <h3>{look.title}</h3>
                        <p>{look.note}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

      <section
        id="pdp2-size-guidance"
        ref={sizeGuideRef}
        className="pdp2-size-guidance"
        aria-labelledby="pdp2-size-guidance-title"
      >
        <div className="pdp2-size-guidance__tabbar">
          <h2 id="pdp2-size-guidance-title">WOMEN</h2>
        </div>
        <div className="pdp2-size-guidance__table-wrap">
          <table className="pdp2-size-guidance__table">
            <thead>
              <tr><th scope="col">EU/IND</th><th scope="col">UK</th><th scope="col">US</th><th scope="col">CM</th></tr>
            </thead>
            <tbody>
              {[
                [35, 2, 5, '22.5'],
                [36, 3, 6, '23'],
                [37, 4, 7, '24'],
                [38, 5, 8, '24.5'],
                [39, 6, 9, '25'],
                [40, 7, 10, '25.5'],
                [41, 8, 11, '26'],
                [42, 9, 12, '26.5'],
              ].map(([eu, uk, us, cm]) => (
                <tr key={eu}><td>{eu}</td><td>{uk}</td><td>{us}</td><td>{cm}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pdp2-size-guidance__note">
          <strong>Foot Length:</strong> Measure from the tip of your longest toe to the back of your heel.
        </p>
        <img
          className="pdp2-size-guidance__illustration"
          src="/images/product-details/foot-measurement-guide.png"
          alt="Foot measurement guide showing side and sole views"
          width="560"
          height="576"
          loading="lazy"
          decoding="async"
        />
      </section>

      <div className="pdp2-cta-row pdp2-cta-row--after-guide" role="group" aria-label="Buy after size guide">
        <button
          id={`pdp2-buy-now-after-guide-${handle}`}
          className={`pdp2-cta-buy ${addedToCart ? 'pdp2-cta-buy--done' : ''} ${!selectedSize ? 'pdp2-cta-buy--unselected' : ''}`}
          onClick={handleBuyNow}
        >
          <span>{ctaLabel}</span>
          {!addedToCart && <span className="pdp2-cta-buy__arrow">→</span>}
        </button>
      </div>

      <section className="pdp2-description" aria-label="Product description">
        <p className="pdp2-description__eyebrow">PRODUCT DESCRIPTION</p>
        <p className="pdp2-description__text">{product.description || 'Product description will be available soon.'}</p>
      </section>



      {/* ═══════════ WHY YOU'LL LOVE IT ═══════════ */}
      {(product.oneLineHook || product.benefits?.length > 0) && (
        <section className="pdp2-benefits" aria-label="Why you'll love it">
          <div className="pdp2-benefits__inner">
            <p className="pdp2-section-eyebrow">WHY YOU'LL LOVE IT</p>
            {product.oneLineHook && <h2 className="pdp2-section-heading">{product.oneLineHook}</h2>}
            {product.benefits?.length > 0 && (
              <div className="pdp2-benefits__grid">
                {product.benefits.map((b, i) => (
                  <div key={i} className="pdp2-benefit-card">
                    <span className="pdp2-benefit-card__icon">{b.icon}</span>
                    <p className="pdp2-benefit-card__text">{b.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════ PRODUCT DETAILS ═══════════ */}
      <section className="pdp2-details" aria-label="Product details">
        <div className="pdp2-details__inner">
          {/* Quick facts - desktop */}
          <div className="pdp2-details__facts pdp2-desktop-only">
            <p className="pdp2-section-eyebrow" style={{marginBottom:16}}>PRODUCT DETAILS</p>
            <div className="pdp2-details__facts-grid">
              <div className="pdp2-fact"><span className="pdp2-fact__label">Material</span><span className="pdp2-fact__value">{product.material}</span></div>
              <div className="pdp2-fact"><span className="pdp2-fact__label">Closure</span><span className="pdp2-fact__value">{product.closureType}</span></div>
              <div className="pdp2-fact"><span className="pdp2-fact__label">Sole</span><span className="pdp2-fact__value">{product.soleType}</span></div>
              <div className="pdp2-fact"><span className="pdp2-fact__label">Best for</span><span className="pdp2-fact__value">{product.bestForOccasion}</span></div>
            </div>
          </div>

          {/* Accordions */}
          {product.accordion.map((item, i) => (
            <div key={i} className="pdp2-accordion__item">
              <button
                className="pdp2-accordion__trigger"
                onClick={() => setAccordion(openAccordion === i ? null : i)}
                aria-expanded={openAccordion === i}
              >
                <span>{item.title}</span>
                <span className="pdp2-accordion__icon">{openAccordion === i ? '−' : '+'}</span>
              </button>
              <div className={`pdp2-accordion__body ${openAccordion === i ? 'pdp2-accordion__body--open' : ''}`}>
                <p>{item.content}</p>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ═══════════ COMPLETE THE LOOK ═══════════ */}
      {product.completeTheLook && product.completeTheLook.length > 0 && (
        <section className="pdp2-look" aria-label="Complete the look">
          <div className="pdp2-look__header">
            <h2 className="pdp2-look__big-heading">COMPLETE THE LOOK</h2>
            {product.stylingNote && (
              <p className="pdp2-look__styling-note">{product.stylingNote}</p>
            )}
          </div>
          <div className="pdp2-look__scroll">
            <div className="pdp2-look__grid">
              {product.completeTheLook.map((item, i) => (
                <div key={i} className="pdp2-look-card">
                  <div className="pdp2-look-card__img">
                    <img src={item.img} alt={item.label} />
                    <button className="pdp2-look-card__wish" aria-label={`Wishlist ${item.label}`}>♡</button>
                  </div>
                  <p className="pdp2-look-card__price">{item.price}</p>
                  <p className="pdp2-look-card__label">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ FAQ ═══════════ */}
      {product.productSpecificQuestions && product.productSpecificQuestions.length > 0 && (
        <section className="pdp2-faq" aria-label="Frequently asked questions">
          <div className="pdp2-faq__inner">
            <p className="pdp2-section-eyebrow">COMMON QUESTIONS</p>
            <h2 className="pdp2-section-heading">Frequently Asked</h2>
            <div className="pdp2-faq__list">
              {product.productSpecificQuestions.map((faq, i) => (
                <div key={i} className="pdp2-faq__item">
                  <button
                    className="pdp2-faq__trigger"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{faq.q}</span>
                    <span className="pdp2-faq__icon">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  <div className={`pdp2-faq__body ${openFaq === i ? 'pdp2-faq__body--open' : ''}`}>
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ YOU MAY ALSO LIKE ═══════════ */}
      {related.length > 0 && (
        <section className="pdp2-related" aria-label="You may also like">
          <div className="pdp2-related__inner">
            <h2 className="pdp2-related__big-heading">YOU MAY ALSO LIKE</h2>
            <div className="pdp2-related__grid">
              {related.map(p => (
                <button
                  key={p.id}
                  className="pdp2-related-card"
                  onClick={() => navigate(`/product/${p.id}`)}
                  aria-label={`View ${p.name}`}
                >
                  <div className="pdp2-related-card__img">
                    <img src={p.images[0]} alt={p.name} />
                    <button
                      className="pdp2-related-card__wish"
                      onClick={e => e.stopPropagation()}
                      aria-label={`Wishlist ${p.name}`}
                    >♡</button>
                    <div className="pdp2-related-card__overlay"><span>VIEW →</span></div>
                  </div>
                  <div className="pdp2-related-card__info">
                    <div className="pdp2-related-card__price-row">
                      <span className="pdp2-related-card__price">₹{p.price.toLocaleString('en-IN')}</span>
                      <span className="pdp2-related-card__orig">₹{p.originalPrice.toLocaleString('en-IN')} Original price</span>
                      <span className="pdp2-related-card__disc">–{p.discountPercent}%</span>
                    </div>
                    <p className="pdp2-related-card__name">{p.name}</p>
                    <p className="pdp2-related-card__cat">{p.universeName}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

          <div className="pdp2-product-panels" aria-label="Product information and policies">
            {policyPanels.map((panel, index) => (
              <div key={panel.title} className="pdp2-accordion__item">
                <button
                  className="pdp2-accordion__trigger"
                  onClick={() => setProductPanel(openProductPanel === index ? null : index)}
                  aria-expanded={openProductPanel === index}
                >
                  <span>{panel.title}</span>
                  <span className="pdp2-accordion__icon">{openProductPanel === index ? '−' : '+'}</span>
                </button>
                <div className={`pdp2-accordion__body ${openProductPanel === index ? 'pdp2-accordion__body--open' : ''}`}>
                  <div className="pdp2-product-panel__content">{panel.content}</div>
                </div>
              </div>
            ))}





            <div className="pdp2-product-social">
              <button className="pdp2-product-share" onClick={handleShareProduct}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"/></svg>
                {shareFeedback || 'SHARE'}
              </button>
              <button
                className="pdp2-product-rating"
                onClick={() => setProductPanel(openProductPanel === 'reviews' ? null : 'reviews')}
                aria-expanded={openProductPanel === 'reviews'}
                aria-controls="pdp2-product-reviews"
              >
                <span className="pdp2-product-rating__stars" aria-label={hasRating ? `${displayRating} out of 5 stars` : 'No rating yet'}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={hasRating ? 'is-filled' : ''}
                      style={hasRating ? {
                        background: `linear-gradient(90deg, #59654d ${Math.max(0, Math.min(1, Number(displayRating) - star + 1)) * 100}%, #bdbdbd ${Math.max(0, Math.min(1, Number(displayRating) - star + 1)) * 100}%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      } : undefined}
                    >★</span>
                  ))}
                </span>
                <span>{hasRating ? `${reviewCount} reviews | ${Number(displayRating).toFixed(1)}` : `${reviewCount} reviews`}</span>
              </button>
            </div>
            <div
              id="pdp2-product-reviews"
              className={`pdp2-accordion__body ${openProductPanel === 'reviews' ? 'pdp2-accordion__body--open' : ''}`}
            >
              <div className="pdp2-product-panel__content">
                {isDemoReviews && (
                  <p className="pdp2-review-demo-note">
                    Demo reviews with sample copy and ratings. Replace with verified customer feedback before publishing.
                  </p>
                )}
                {reviewList.length ? reviewList.map((review) => (
                  <article key={review.id} className="pdp2-review-card">
                    <div className="pdp2-review-card__header">
                      <span className="pdp2-review-card__author">{review.author}</span>
                      <span className="pdp2-review-card__date">{review.date}</span>
                    </div>
                    {isDemoReviews && (
                      <div className="pdp2-review-card__stars" aria-label={`${review.rating} out of 5 stars`}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    )}
                    <p className="pdp2-review-card__text">{review.text}</p>
                  </article>
                )) : <p>{reviewCount ? 'Review details are not available yet.' : 'No reviews yet. Be the first to share your experience.'}</p>}
              </div>
            </div>
          </div>

      <div className="pdp2-cta-row">
            <button
              id={`pdp2-buy-now-${handle}`}
              className={`pdp2-cta-buy ${addedToCart ? 'pdp2-cta-buy--done' : ''} ${!selectedSize ? 'pdp2-cta-buy--unselected' : ''}`}
              onClick={handleBuyNow}
            >
              <span>{ctaLabel}</span>
              {!addedToCart && <span className="pdp2-cta-buy__arrow">→</span>}
            </button>
            <button
              className={`pdp2-cta-wishlist ${wishlisted ? 'pdp2-cta-wishlist--active' : ''}`}
              onClick={() => setWishlisted(w => !w)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {wishlisted ? '♥' : '♡'}
            </button>
      </div>

      <Footer />
    </div>
  );
}
