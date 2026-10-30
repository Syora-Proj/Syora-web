# SYORA Project Context

This file is a working guide to the repository: how the application is assembled, where its data lives, how the storefront talks to Shopify, and which parts are legacy or currently incomplete. It is based on the checked-out files as of 2026-10-13. Treat the source as authoritative when this document and the implementation differ.

## Project at a glance

SYORA is a React 19 single-page storefront for a premium Indian women's footwear brand. It uses Vite 8, React Router 7, plain JavaScript/JSX, and hand-written CSS. The current primary experience is a cinematic landing page called “The Multiverse,” leading to five universe/collection pages, product pages, a Shopify cart drawer, and a Shopify-hosted checkout. A separate older editorial homepage remains accessible at `/home` and `/shop`.

There is no server-side application in this repository. Product/catalog/cart networking is performed by the browser against Shopify's Storefront GraphQL API. The payment and checkout experience is hosted by Shopify. Analytics helpers push GA4-style events to `window.dataLayer` when present.

## Start and build

Requirements: Node.js compatible with the installed Vite 8 toolchain and npm.

```sh
npm install
npm run dev       # Vite development server
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run lint      # Oxlint
```

The package scripts are defined in `package.json`. Runtime dependencies are `react`, `react-dom`, and `react-router-dom`; development dependencies are Vite, its React plugin, and Oxlint. `vite.config.js` uses only `@vitejs/plugin-react`. There is no test script or test suite in the repository.

Shopify browser configuration is read from `.env.local` (ignored by Git):

| Variable | Purpose |
| --- | --- |
| `VITE_SHOPIFY_STORE_DOMAIN` | Shopify store hostname, used to construct the Storefront API URL |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Public Storefront API access token sent in the API request header |

Only a Storefront token belongs in this browser app. Never put Shopify Admin API credentials in a `VITE_` variable or client bundle. `.gitignore` excludes `.env.local`, other local environment files, `node_modules`, and `dist`.

## Routes and application composition

`src/main.jsx` mounts the app in `StrictMode`, `BrowserRouter`, and the global `CartProvider`. `src/App.jsx` imports the three stylesheets, renders the cart drawer above the route tree, and scrolls to page top when the pathname changes.

| Route | Screen |
| --- | --- |
| `/` | `MultiverseEntry`: video hero, universe selector, brand story, footer |
| `/universe/icon` | Shared `UniversePage` configured for ICON |
| `/universe/heritage` | Shared `UniversePage` configured for HERITAGE |
| `/universe/everyday` | Shared `UniversePage` configured for EVERYDAY |
| `/universe/motion` | Shared `UniversePage` configured for MOTION |
| `/universe/off-duty` | Shared `UniversePage` configured for OFF-DUTY |
| `/product/:handle` | `ProductPage`; `handle` is the Shopify product handle |
| `/home`, `/shop` | Preserved legacy editorial homepage (`LegacyHome`) |
| `/order-confirmation` | Shopify return/confirmation presentation |
| anything else | Redirects to `/` |

`LegacyHome` composes `Navbar`, `Hero`, `StorySection`, `CategorySection`, `SizeChart`, `AboutUs`, and `Footer`. Several older components are not imported into current routes; see “Legacy and unused components.”

## Main user flow

1. On `/`, the visitor sees a muted, looping, full-screen video and scrolls to five universe tiles. Clicking a tile adds a short selected state, then navigates to its universe route.
2. A universe page reads its copy, palette, and hero asset from `src/data/universes.js`. It requests the Shopify collection whose handle is the universe id (`icon`, `heritage`, `everyday`, `motion`, `off-duty`). Product cards navigate to `/product/<handle>`.
3. Product detail loads a Shopify product by handle. The visitor selects an available Size option; that selection resolves to a Shopify variant GID.
4. Add-to-cart / Buy Now uses the shared `CartContext` and Shopify Cart API. Add-to-cart opens the persistent cart drawer. Checkout redirects to the Shopify `checkoutUrl`.
5. Shopify can return to `/order-confirmation`. The page reads order ID/number URL parameters for display/analytics only; it explicitly does not verify payment.

## Main components

| File | Responsibility |
| --- | --- |
| `src/App.jsx` | Route table, legacy homepage composition, scroll-to-top behavior, global cart drawer placement |
| `src/components/MultiverseEntry.jsx` | Video landing page, animated universe selection, about section |
| `src/components/UniversePage.jsx` | Data-driven universe hero/editorial/product listing/bestseller/explore/footer template; fetches collection data |
| `src/components/ProductGrid.jsx` | Shopify product cards and empty state; cards navigate to product route; wishlist state is local/in-memory only |
| `src/components/ProductPage.jsx` | Product fetch, gallery, color/size UI, add/buy actions, PIN-code mock, editorial/detail sections and sticky buy bar |
| `src/components/Navbar.jsx` | Responsive nav, route links, mobile menu, cart badge/open action |
| `src/components/CartDrawer.jsx` | Cart line rendering, quantity changes/removal, subtotal, checkout action and view-cart analytics |
| `src/components/OrderConfirmation.jsx` | Shopify-return thank-you page; purchase analytics guarded by session storage |
| `src/components/ExploreMore.jsx` | Links to the other four universes in canonical order |
| `src/components/Footer.jsx` | Brand/footer columns and decorative payment badges |
| `src/context/CartContext.jsx` | Global cart state, async mutation guard, error/loading state, drawer state and checkout redirect |
| `src/hooks/useShopifyCollection.js` | Loads/normalizes a collection, derives bestseller subset from normalized badge |
| `src/hooks/useShopifyProduct.js` | Loads a full product by handle |

Product detail sections include gallery navigation (touch swipe on mobile), sizes/variant availability, wishlisting, fit and comfort details, benefits, reviews, FAQs, accordions, related-product section, and sticky buy bar. Some of those fields are empty/default when sourced from Shopify (see integration notes below).

## Data model and catalog sources

### Universe configuration

`src/data/universes.js` exports:

- `UNIVERSE_ORDER`: canonical ordering `icon`, `heritage`, `everyday`, `motion`, `off-duty`.
- `UNIVERSES`: config for each route, including id/name/tagline/headline/editorial/CTA, CSS palette variables, hero image and alt text, and local sample products/bestsellers.

The page route passes the id as the `universe` prop. Product collections are fetched live from Shopify by matching collection handle. The local `products` and `bestsellers` arrays are not used as a fallback by `UniversePage` today; they serve as sample/configuration content and visual reference. MOTION and OFF-DUTY currently have no local product entries and comments mark their product imagery/catalog as pending.

### Local product fixture catalog

`src/data/products.js` exports `PRODUCTS` and `getProduct(id)`. It defines six richly populated local product fixtures: `icon-1`, `icon-2`, `her-1`, `her-2`, `her-3`, and `evr-1`. Fields include universe/category, price and compare-at price, colors, EU sizes and stock map, construction/comfort, copy/benefits, image lists, reviews, delivery/return/COD claims, FAQs, related items, accordions, complete-the-look cards, and SEO/editorial content.

Important: the current `ProductPage` does not call `getProduct`; it fetches Shopify data through `useShopifyProduct`. The fixtures are therefore not a live fallback unless code is changed to use them. Shopify normalization intentionally supplies placeholders for fields Shopify does not expose directly.

### Shopify product tagging conventions

`src/lib/shopify/products.js` expects product tags such as `universe:heritage`, `badge:BESTSELLER`, `badge:NEW`, and optionally `heel:<value>`. Collection handle must match the universe id. Product cards use the Shopify handle for `/product/:handle`; their normalized `id` is also the handle while `shopifyId` retains the opaque GraphQL ID. Variants should expose a product option whose name contains “size” (for example Shopify's “Shoe size”); the product UI maps selected values to variant IDs and disables variants with `availableForSale === false`.

## Shopify integration

All GraphQL operations are centralized in `src/lib/shopify/queries.js`; calls go through `src/lib/shopify/client.js` using Storefront API version `2025-01` and a 10-second abort timeout.

`src/lib/shopify/products.js` provides money formatting, price parsing, discount calculation, tag parsing, collection card normalization, full PDP normalization, connection check, collection fetch, and product fetch. Product card normalization maps Shopify featured image, title, price range, compare-at price, badge tags, and sale availability. PDP normalization maps Shopify image URLs, product option values and variants, stock availability, descriptions, tags, vendor/SEO, and defaults for editorial fields.

`src/lib/shopify/cart.js` provides get/create/add/update/remove and checkout URL helpers. It stores the Shopify cart ID in `localStorage` under `syora_cart_id`, normalizes Shopify cart responses, and reports mutation `userErrors`. Shopify remains the price source; no payment details are collected in this app. `CartContext` loads the stored cart at mount and serializes in-flight mutations with a ref.

Potential integration considerations visible in the current implementation:

- `UniversePage` only renders fetched Shopify products. Empty collection results show “Coming Soon”; fetch errors show a refresh prompt. There is no local fixture fallback.
- `useShopifyCollection` recognizes bestsellers only through a normalized `badge === 'BESTSELLER'`. Its comment mentions a plain `bestseller` tag, but that extra plain-tag check currently returns `false`.
- `PRODUCT_BY_HANDLE_QUERY` receives the `MoneyFields` fragment through `VARIANT_FRAGMENT`; do not interpolate `MONEY_FRAGMENT` a second time in that operation, because Shopify rejects duplicate fragment definitions.
- `normaliseProduct` maps size values from option names containing “size”. `quantityAvailable` is not requested because the configured Storefront token does not have the `unauthenticated_read_product_inventory` scope; the UI uses `availableForSale` to disable unavailable variants.
- The current PIN-code delivery check is a timed client-side mock: any six digits return the product's general delivery estimate and COD flag. It is not a real serviceability check.
- Product color choices currently change only selected swatch state; variant/color-specific images or variant selection are not connected.
- `handleBuyNow` awaits `addToCart`, then separately calls `getCheckoutUrl()`; cart mutations are Shopify-backed, but the flow does not use the cart object returned from the add operation directly.
- `OrderConfirmation` displays a thank-you state based on route access and does not verify payment or fetch order data. The purchase event currently uses total `0` and empty items from the client route parameter; comments mark verified server/webhook data as future work.
- Product list/detail analytics helpers exist in `src/lib/analytics.js`; verify actual call sites and configure GTM/gtag before relying on them. The source comment describes GA4 setup. `trackPurchase` uses `sessionStorage` and should only be given a verified order id/data source.
- `shopifyFetch` builds its endpoint even when environment variables are missing; configure `.env.local` before expecting API-backed pages/cart to work.

## Analytics

`src/lib/analytics.js` provides `trackViewItem`, `trackViewItemList`, `trackSelectItem`, `trackAddToCart`, `trackRemoveFromCart`, `trackViewCart`, `trackBeginCheckout`, and `trackPurchase`. Events clear the previous ecommerce payload before pushing a new `dataLayer` object, use INR, and avoid direct PII. A GA4 Measurement ID/GTM integration is not visibly present in the checked-in `index.html`; follow the comments in the analytics module before activating production measurement.

## Styling and visual system

- `src/index.css` contains global resets, Google Fonts imports (Cormorant Garamond, Inter, Caveat, Great Vibes), and global champagne/ivory/burgundy CSS variables.
- `src/App.css` is the large main stylesheet (~3,500 lines) for the legacy site, navbar, multiverse, universe pages, product page, responsive behavior, and transitions. It is organized in comment-labeled sections. `src/components/StorySection.jsx` also has scroll/resize-driven animation logic.
- `src/shopify.css` styles cart drawer, loading/error/empty states and integration-related UI.
- Universe page sets `--u-*` CSS custom properties inline from its configured palette.
- Product detail has a separate mostly black/white visual treatment defined in `App.css`.

## Assets

### `public/` assets (referenced by root URL)

- `SYORA_ICON_Hero_High_Resolution (1).png`, `SYORA_HERITAGE_Hero_High_Resolution.jpg`, `SYORA_EVERYDAY_Hero_High_Resolution.jpg`, `SYORA_MOTION_Hero_High_Resolution_2x.jpg`, `SYORA_OFF_DUTY_Hero_High_Resolution.png`: hero images used by universe configs and tiles.
- `Model_changing_outfits_across_en…_20260922122547_gwr_video_mvp.mp4`: landing page loop video. The filename literally includes a Unicode ellipsis; `MultiverseEntry.jsx` uses the same string in `VIDEO_SRC`.
- `about us.png`: about/craft image used on current landing and legacy about section.
- `craft_sketch.png`, `craft_stitching.png`: craft visuals currently present in public assets; inspect references before changing/removing.
- `favicon.svg`, `icons.svg`: browser icon and SVG icon resource.

### `src/assets/` imported assets

- `heels_strappy.png`, `product_heel_1.png`, `product_hero.png`: heel/product imagery.
- `jutti_signature.png`, `jutti_embroidered.png`, `jutti_everyday.png`: jutti/product imagery.
- `hero_model.png`, `secondary_hero.png`, `hero.png`, `truck_frame.png`: legacy/design source visuals; not all are used by routed pages.
- `react.svg`, `vite.svg`: starter assets.
- `make_truck.py`: helper script associated with generating/working with a truck visual; not part of the Vite app runtime.

## Legacy and unused components / files

`src/components/BestOf.jsx`, `CategoryStrip.jsx`, `SecondaryHero.jsx`, `Topbar.jsx`, and `TrustBar.jsx` are present but are not currently imported by `App.jsx` or the currently routed components. `CategorySection.jsx`, `Hero.jsx`, `StorySection.jsx`, `SizeChart.jsx`, and `AboutUs.jsx` are only used by `/home` and `/shop` legacy routes. `src/patch.cjs`, `src/patch2.cjs`, and root `update_colors.cjs` are one-off CSS editing scripts, not runtime code. The patch scripts hardcode the original absolute workspace path and should not be treated as portable project tooling.

The current repository's `public/` directory does not contain several image filenames still referenced by legacy components (`/syora_hero.png`, `/roadmap.png`, `/juttis 01.png`, `/size chart.png`, `/category section copy.png`). Those assets were not present in the checked-out public file list when this document was written; if `/home` or `/shop` is used, check/restore those assets or update those references. The current root route uses the new video and universe hero assets instead.

## Repository inventory

```text
index.html                    HTML shell, metadata, Vite entry point
package.json / package-lock    npm scripts and dependencies
vite.config.js                Vite React plugin configuration
.oxlintrc.json                Oxlint React/Oxc rules
.gitignore                    build, dependencies, local env and editor ignores
README.md                      Original Vite template readme (not project-specific)
context.md                     This repository guide
update_colors.cjs              One-off CSS color replacement utility
src/main.jsx                   Browser entry / provider setup
src/App.jsx                    Routes and legacy route composition
src/App.css                    Main visual stylesheet
src/index.css                  Global reset, fonts, palette
src/shopify.css                Shopify cart/loading state styles
src/context/CartContext.jsx    Shared cart provider and hook
src/data/products.js           Six local product fixtures
src/data/universes.js          Five universe page configurations
src/hooks/                     Shopify collection/product React hooks
src/lib/analytics.js           GA4-style dataLayer event helpers
src/lib/shopify/               Storefront GraphQL client, operations, cart and product helpers
src/components/                Current and legacy page components
src/assets/                    Imported local images and helper assets
public/                        Public hero, video, craft, favicon and SVG assets
```

## Known context caveats

- `README.md` is the stock React/Vite template and does not explain SYORA's routes or business behavior; use this document and the implementation instead.
- `dist/` is generated build output and is ignored by Git. It was present locally at inspection time; do not use it as the source of truth.
- `.env.local` is intentionally ignored. This guide records only the variable names, never their values.
- This workspace had pre-existing modified, deleted, and untracked files at the time `context.md` was created. Those changes were left untouched. Check `git status` before making further edits or interpreting files as committed project state.
- The product fixture content contains editorial prices, review snippets, policy claims, and future dates; treat it as mock/store content until confirmed against the live store and current policy.

## Where to make common changes

| Change | Primary location |
| --- | --- |
| Add/change route | `src/App.jsx` |
| Edit universe copy, palette, hero or local card sample | `src/data/universes.js` |
| Change live collection/product behavior | `src/lib/shopify/queries.js`, `src/lib/shopify/products.js`, hooks and page components |
| Update local detailed product fixtures | `src/data/products.js` |
| Update cart behavior or persisted cart id | `src/context/CartContext.jsx`, `src/lib/shopify/cart.js` |
| Update Storefront API request configuration | `src/lib/shopify/client.js` and `.env.local` |
| Change analytics mapping/events | `src/lib/analytics.js` and its component call sites |
| Change visual styles | `src/App.css`, `src/index.css`, `src/shopify.css` |
| Update the main landing video or hero image | `src/components/MultiverseEntry.jsx`, `src/data/universes.js`, corresponding `public/` asset |
