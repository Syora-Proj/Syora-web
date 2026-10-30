# SYORA — Frontend refinement phase (branch `website-improvements`)

Scope: frontend rendering only. No Shopify data, settings, products, prices, metafields,
checkout configuration or production deployment were touched. Brand identity (palette, fonts,
photography, video, copy, universes) is unchanged. Baseline commit `e27346a` is intact.

Commits: one per round (`git log --oneline`).

## Round 1 — shared components
| Problem | Root cause | Fix |
|---|---|---|
| Header text collided with the hero eyebrow on every universe page | `.u-hero` was a fixed `100vh` flex box with bottom-aligned content; taller content overflowed **upward** under the absolute navbar (also true on HERITAGE/EVERYDAY/MOTION, not only ICON) | `.u-hero` now `min-height` and grows with its content |
| Nav links ran into the logo between 769–1220px | Left nav needs ~435px but the hamburger only kicked in at 768px | Navigation has its own breakpoint (1220px); gap tightened mid-range, unchanged ≥1440px |
| Mobile menu rendered colour-inverted, dimmed, and was tabbable while closed | Drawer lives inside a `mix-blend-mode: difference` header; backdrop z-index sat above the drawer; no `visibility` | Blend off while open, backdrop below header, `visibility: hidden` when closed, Escape closes |
| Dark strip on the right edge of every page; cart focusable while closed | Closed cart drawer's `box-shadow` bled in; `aria-modal` dialog never hidden | Shadow only when open, `visibility` + `aria-hidden` |
| Header nav dead links (`#new-arrivals`, `#bestsellers`) | Anchors never existed | Header now lists the four universes from `src/data/universes.js` |
| Footer: `href="#"` links, 2025 year, 1-column tablet layout | — | Universe routes, `getFullYear()`, 4→3→2→1 column progression |

## Round 2 — homepage
* Universe grid was `repeat(5, 1fr)` (OFF-DUTY leftover) → permanent empty 5th column. Now 4 columns, 2×2 below 900px; removed `:nth-child(5)` rule.
* Glass-edge strip was blurring the "Explore the Universes" heading; content layered above it.
* Faint captions raised in contrast (same colours, higher alpha). Tiles are real links.
* Scroll cue is a real button. Dead `#craft` CTA → `/universe/heritage`.

## Round 3 — universe pages
* Hero text column was ~460px (`max-width: 620px` included padding) so headlines broke mid-word and the block grew tall. Now a true 620px; all four heroes are the same height.
* Light edge scrims + plain header colour on universe heroes (the `difference` blend left the logo/nav unreadable over the beige photos). Imagery unchanged.
* ICON-only compact mobile treatment now applies to all four universes.
* Explore-More grid was 4 columns for 3 tiles. Now 3.
* "View full collection" / "All bestsellers" linked to the page you were already on → removed. Empty bestsellers strip no longer renders.
* Empty collections (HERITAGE, MOTION) and errors share one polished state in each universe's palette, with a route onward.

## Round 4 — product cards
* Card was `<article role="link">` containing a `<button>` (invalid nested interactive). Now: image + title are links, heart is a sibling button (`aria-pressed`, 44px target).
* Wishlist persists on-device (`src/lib/wishlist.js`; localStorage, guarded). No account/wishlist page exists yet.
* Names clamp to 2 lines; prices align across a row; sold-out labelled; "was" price only when Shopify compare-at is genuinely higher.
* Bug: hover hid the primary image even when there was no second image (blank card). Now conditional.
* Grid is explicit 4 / 3 / 2 columns.

## Round 5 — product page
* **No Add to Bag existed** (the handler was dead code); the only CTA was a "BUY NOW" at the very bottom of the page. Add to Bag + Buy Now now sit directly under the size picker (and again after the content).
* Buy Now no longer redirects to checkout when the cart add failed.
* Removed the unsupported "✦ New Arrival" label (shown for every product with zero reviews) and a duplicate unstyled gallery badge.
* Breadcrumb: real links, no empty "Home / /".
* Product facts (material/closure/sole/best for) render only when present; the "material details are not provided" filler line is gone.
* **Reviews:** the five hardcoded "Demo review 01–05 / SAMPLE" entries, the invented 4.2★ summary and the sample-copy disclaimer were removed (earlier audit fix, kept). With no real reviews the slot shows a non-interactive "No reviews yet". Nothing is invented.
* Delivery PIN checker switched off (`SHOW_PIN_CHECKER = false`): it answered "delivery in 5–7 days, COD available" for any 6-digit code after a fake delay.
* Layout: dead ~200px gap in the info column, thumbnails flattened into a row by a legacy `!important`, closed accordions leaking their first line, size guide without page gutters.

## Round 6 — responsive / accessibility
* Touch targets (hamburger, hero buttons, footer links, size-guide link, share), `prefers-reduced-motion` for page scroll, footer headings `h4→h3` (skipped heading level), dialog focus.

## Decisions that need your call
1. **Search and Account** (header) have no implementation (no search page, no customer-account URL). They are shown dimmed and inert (`aria-disabled`, "coming soon" title) instead of pretending to work.
2. **Homepage has no header** (cinematic hero). Left as designed. Cart is therefore unreachable from `/` until you open a universe.
3. **Social icons** removed from the footer: no real URLs exist in the repo and none were invented. Add them to `SOCIAL_LINKS` in `Footer.jsx` and they reappear.
4. **"Craftsmanship"** footer link removed (no destination). "Our Story" → `/#about`.
5. **Hero scrim** (`.u-hero::after`) is subtle but visible, especially at the bottom of EVERYDAY/HERITAGE. Dial it down or remove it in one rule if you prefer the raw photographs.
6. **Add to Bag is primary, Buy Now secondary** (outlined). Swap the two if checkout-first is the intent.

## Content flagged, not changed
Brand copy still says "skilled artisans", "handcrafted", "craftsmanship" (homepage story, footer blurb, universe editorials). These are claims you should be able to support.

## Not done / needs Shopify or backend work
* Product material/closure/sole/best-for metafield mapping; real reviews; real PIN-code serviceability; related products and complete-the-look (data never populated); search; accounts; a wishlist page; social URLs.
* `src/App.css`: 153 of 544 class names are referenced by no JSX (old `pdp-*`, `mv-entry`, `mv-glass`, `story` generations), 11 selectors are defined more than once, 20 `!important`. Not removed: needs a verified pass. `context.md` still describes five universes.
* `public/` hero images are 1.7–2.4 MB PNGs; worth converting (not touched: "do not modify original image files").
