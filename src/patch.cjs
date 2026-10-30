const fs = require('fs');
const path = '/Users/dhruvtomar/Desktop/syora/src/App.css';

let css = fs.readFileSync(path, 'utf8');

const startMarker = '/* ════════════════════════════════════════════════\n   SYORA — PRODUCT DETAIL PAGE v2 (PDP2)';
const endMarker = '/* Hero Split */';

const startIndex = css.indexOf(startMarker);
const endIndex = css.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found', { start: startIndex !== -1, end: endIndex !== -1 });
  process.exit(1);
}

const newCss = `/* ════════════════════════════════════════════════
   SYORA — PRODUCT DETAIL PAGE v2 (PDP2)
   Full spec build — mobile-first, doubt-sequence
   ordered, sticky bar, all sections.
════════════════════════════════════════════════ */

/* ── Page shell ── */
.pdp2 {
  background: #ffffff;
  color: #000000;
  min-height: 100vh;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
}
.pdp2-not-found {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 80vh; gap: 20px;
}

/* ── Shared section typography ── */
.pdp2-section-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 12px;
  text-transform: uppercase;
}
.pdp2-section-heading {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: 700;
  color: #000;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Utilities ── */
.pdp2-desktop-only { display: none !important; }
.pdp2-mobile-only { display: block !important; }

/* ══════════════════════════════════════════════
   1. OFFER BANNER
══════════════════════════════════════════════ */
.pdp2-offer-banner {
  width: 100%;
  background: #000;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 50;
}

/* ══════════════════════════════════════════════
   2–4. HERO SPLIT
══════════════════════════════════════════════ */
.pdp2-hero {
  display: flex;
  flex-direction: column;
}

/* ── Info panel (mobile top) ── */
.pdp2-info {
  padding: 16px 20px 24px 20px;
  display: flex;
  flex-direction: column;
}

.pdp2-info__breadcrumb {
  font-size: 0.75rem;
  color: #767677; /* Subtle grey */
  margin-bottom: 16px;
  display: flex;
  gap: 4px;
}
.pdp2-info__breadcrumb span {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.pdp2-info__breadcrumb-sep {
  text-decoration: none !important;
  margin: 0 2px;
}

.pdp2-info__badge {
  display: inline-block;
  background: #ede7dd;
  color: #000;
  font-size: 0.7rem;
  padding: 4px 8px;
  width: fit-content;
  margin-bottom: 12px;
}

/* Rating */
.pdp2-info__rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}
.pdp2-info__new-arrival {
  font-size: 0.75rem;
  font-weight: 600;
  color: #000;
}
.pdp2-info__rating-num {
  font-weight: 600;
}
.pdp2-stars { display: flex; gap: 1px; }
.pdp2-star { font-size: 0.7rem; color: #000; line-height: 1; }
.pdp2-star--filled { color: #000; }
.pdp2-star--half { color: #000; opacity: 0.5; }
.pdp2-star--sm { font-size: 0.65rem; }
.pdp2-info__rating-link {
  font-size: 0.8rem;
  color: #767677;
  text-decoration: underline;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.pdp2-info__name {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #000;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Price */
.pdp2-info__price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.pdp2-info__price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #000;
}
.pdp2-info__original-price {
  font-size: 0.9rem;
  color: #767677;
  text-decoration: line-through;
}
.pdp2-info__discount {
  font-size: 0.75rem;
  font-weight: 700;
  color: #c0392b;
}
.pdp2-info__tax-note {
  font-size: 0.75rem;
  color: #767677;
  margin-bottom: 20px;
}

/* ── Gallery ── */
.pdp2-gallery {
  position: relative;
  background: #f0ebe3;
  width: 100%;
  height: 85vw; /* Almost square on mobile */
  min-height: 320px;
  display: flex;
  flex-direction: column;
}
.pdp2-gallery__main {
  position: relative;
  flex: 1;
  overflow: hidden;
  padding: 20px; /* Space around shoe */
}
.pdp2-gallery__img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Show full shoe */
  object-position: center;
}
.pdp2-gallery__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px; height: 40px;
  background: transparent;
  border: none;
  color: #000;
  display: flex; align-items: center; justify-content: center;
  z-index: 5;
}
.pdp2-gallery__arrow--prev { left: 0; }
.pdp2-gallery__arrow--next { right: 0; }

.pdp2-gallery__dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 6;
}
.pdp2-gallery__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(0,0,0,0.2);
  border: none;
}
.pdp2-gallery__dot--active {
  background: #000;
}

/* ── Mobile Colours ── */
.pdp2-mobile-colours {
  padding: 24px 20px;
  border-bottom: 4px solid #000; /* Adidas style thick border */
}
.pdp2-mobile-colours__label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 12px;
}
.pdp2-mobile-colours__grid {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.pdp2-mobile-colours__grid::-webkit-scrollbar { display: none; }
.pdp2-mobile-colour-thumb {
  width: 100px;
  flex-shrink: 0;
  background: #f0ebe3;
  border: 1px solid transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.pdp2-mobile-colour-thumb--active {
  border-bottom: 2px solid #000;
}
.pdp2-mobile-colour-thumb__swatch {
  width: 100%;
  height: 80px;
}
.pdp2-mobile-colour-thumb__name { display: none; }

/* ── Size Picker ── */
.pdp2-info__field { margin-bottom: 24px; padding: 0; }
.pdp2-size__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pdp2-info__label--bold {
  font-size: 0.9rem;
  font-weight: 700;
  color: #000;
  text-transform: none;
  letter-spacing: normal;
}
.pdp2-size__guide-link {
  font-size: 0.85rem;
  color: #000;
  text-decoration: underline;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.pdp2-sizes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.pdp2-size-btn {
  background: #f5f5f5;
  border: 1px solid transparent;
  color: #000;
  font-size: 0.85rem;
  padding: 14px 0;
  text-align: center;
  cursor: pointer;
}
.pdp2-size-btn:hover { border-color: #000; }
.pdp2-size-btn--active {
  background: #000;
  color: #fff;
}
.pdp2-size__error {
  color: #c0392b;
  font-size: 0.8rem;
  margin-top: 8px;
}

/* Fit note box */
.pdp2-fit-note-box {
  margin: 16px 0;
  padding: 12px 16px;
  border: 1px solid #000;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.8rem;
  color: #000;
}
.pdp2-fit-note-box p { margin: 0; line-height: 1.4; }
.pdp2-fit-note-box__icon { font-size: 1rem; line-height: 1; }

/* ── CTA Row ── */
.pdp2-cta-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.pdp2-cta-buy {
  flex: 1;
  background: #000;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 16px 20px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pdp2-cta-buy__arrow { font-size: 1.1rem; }

.pdp2-cta-wishlist {
  width: 52px; height: 52px;
  border: 1px solid #000;
  background: #fff;
  color: #000;
  font-size: 1.4rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

/* Trust list (mobile) */
.pdp2-trust-list {
  margin-bottom: 24px;
}
.pdp2-trust-list__item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e0e0e0;
  text-decoration: none;
  color: #000;
}
.pdp2-trust-list__icon { font-size: 1.2rem; }
.pdp2-trust-list__text {
  flex: 1;
  font-size: 0.85rem;
}
.pdp2-trust-list__chevron {
  font-size: 1.2rem;
  color: #767677;
}

/* ══════════════════════════════════════════════
   SECTIONS: Benefits / Comfort / Details
══════════════════════════════════════════════ */
.pdp2-benefits, .pdp2-comfort, .pdp2-details, .pdp2-reviews, .pdp2-faq {
  padding: 0 20px;
  border-top: 1px solid #e0e0e0;
}

/* Accordions (mobile details) */
.pdp2-accordion__item {
  border-bottom: 1px solid #e0e0e0;
}
.pdp2-accordion__trigger {
  width: 100%;
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 700;
  color: #000;
}
.pdp2-accordion__icon { font-size: 1.2rem; font-weight: 300; }
.pdp2-accordion__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
  overflow: hidden;
}
.pdp2-accordion__body--open { grid-template-rows: 1fr; }
.pdp2-accordion__body > div {
  min-height: 0;
}
.pdp2-accordion__body p {
  padding: 0 0 20px 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #000;
}

/* Size guide inside accordion */
.pdp2-size-guide-table { width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 16px; }
.pdp2-size-guide-table th { padding: 8px 0; border-bottom: 1px solid #e0e0e0; font-size: 0.8rem; }
.pdp2-size-guide-table td { padding: 12px 0; border-bottom: 1px solid #f5f5f5; font-size: 0.85rem; }

/* Review list */
.pdp2-review-card {
  margin-bottom: 20px;
}
.pdp2-review-card__header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.pdp2-review-card__author { font-size: 0.85rem; font-weight: 600; margin-left: 8px; }
.pdp2-review-card__date { font-size: 0.75rem; color: #767677; }
.pdp2-review-card__text { font-size: 0.85rem; line-height: 1.5; font-style: italic; }

/* ══════════════════════════════════════════════
   COMPLETE THE LOOK / RELATED
══════════════════════════════════════════════ */
.pdp2-look, .pdp2-related {
  padding: 32px 0;
}
.pdp2-look__header, .pdp2-related__inner > h2 {
  padding: 0 20px;
}
.pdp2-look__big-heading, .pdp2-related__big-heading {
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.pdp2-look__scroll {
  overflow-x: auto;
  padding: 0 20px 20px;
  scrollbar-width: none;
}
.pdp2-look__grid {
  display: flex;
  gap: 4px;
  width: max-content;
}
.pdp2-look-card {
  width: 200px;
  display: flex;
  flex-direction: column;
}
.pdp2-look-card__img {
  width: 100%;
  height: 250px;
  background: #f0ebe3;
  position: relative;
  margin-bottom: 8px;
}
.pdp2-look-card__img img {
  width: 100%; height: 100%;
  object-fit: contain;
}
.pdp2-look-card__wish {
  position: absolute;
  top: 8px; right: 8px;
  background: none; border: none; font-size: 1.2rem; cursor: pointer;
}
.pdp2-look-card__price {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 4px;
}
.pdp2-look-card__label {
  font-size: 0.85rem;
  text-transform: uppercase;
}

.pdp2-related__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 0 20px;
}
.pdp2-related-card {
  background: none; border: none; padding: 0; text-align: left;
}
.pdp2-related-card__img {
  position: relative;
  aspect-ratio: 4/5;
  background: #f0ebe3;
  margin-bottom: 8px;
}
.pdp2-related-card__img img { width: 100%; height: 100%; object-fit: contain; }
.pdp2-related-card__wish {
  position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 1.2rem; cursor: pointer;
}
.pdp2-related-card__overlay { display: none; } /* Hide hover on mobile */
.pdp2-related-card__info { padding-bottom: 16px; }
.pdp2-related-card__price-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
}
.pdp2-related-card__price { font-size: 0.85rem; font-weight: 700; color: #c0392b; }
.pdp2-related-card__orig { font-size: 0.75rem; color: #767677; text-decoration: line-through; }
.pdp2-related-card__name { font-size: 0.85rem; }
.pdp2-related-card__cat { font-size: 0.75rem; color: #767677; }

/* ══════════════════════════════════════════════
   STICKY BUY BAR
══════════════════════════════════════════════ */
.pdp2-sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  transform: translateY(100%);
  transition: transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);
}
.pdp2-sticky-bar--visible { transform: translateY(0); }
.pdp2-sticky-bar__info { display: none; }
.pdp2-sticky-bar__btn {
  flex: 1;
  background: #000;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 14px 20px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.pdp2-sticky-bar__wish {
  width: 48px; height: 48px;
  border: 1px solid #000;
  background: #fff; font-size: 1.4rem;
  display: flex; align-items: center; justify-content: center;
}

/* ══════════════════════════════════════════════
   DESKTOP OVERRIDES
══════════════════════════════════════════════ */
@media (min-width: 1024px) {
  .pdp2-mobile-only { display: none !important; }
  .pdp2-desktop-only { display: block !important; }

  .pdp2-hero {
    flex-direction: row-reverse;
  }
  .pdp2-gallery {
    flex: 1.2;
    height: 100vh;
    position: sticky;
    top: 0;
  }
  .pdp2-info {
    flex: 0.8;
    padding: 100px 5% 64px 5%;
  }

  .pdp2-gallery__thumbs {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
  }
  .pdp2-gallery__thumb { width: 50px; height: 50px; border: 1px solid transparent; background: #fff; cursor: pointer; }
  .pdp2-gallery__thumb--active { border-color: #000; }
  .pdp2-gallery__thumb img { width: 100%; height: 100%; object-fit: contain; }

  .pdp2-related__grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .pdp2-related-card__overlay { display: block; }

  .pdp2-sticky-bar__info { display: flex; flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  .pdp2-gallery__img { animation: none; }
  .pdp2-sticky-bar { transition: none; }
}

`;

const finalCss = css.substring(0, startIndex) + newCss + '\n' + css.substring(endIndex);
fs.writeFileSync(path, finalCss, 'utf8');
console.log('Successfully replaced PDP2 CSS');
