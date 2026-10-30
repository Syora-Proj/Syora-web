/**
 * SYORA — Shopify Product Helpers
 *
 * Functions that call the Storefront API for product/collection data
 * and normalise the response into the shape the existing SYORA UI expects.
 */

import { shopifyFetch }                            from './client';
import { SHOP_QUERY, COLLECTION_QUERY, PRODUCT_BY_HANDLE_QUERY } from './queries';

/* ─────────────────────────────────────────────────────────────
   Formatters
───────────────────────────────────────────────────────────── */

/**
 * Format a Shopify MoneyV2 object into a localised Indian Rupee string.
 * e.g. { amount: "1299.00", currencyCode: "INR" } → "₹1,299"
 */
export function formatMoney(money) {
  if (!money) return '';
  const amount = parseFloat(money.amount);
  if (money.currencyCode === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: money.currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a raw price amount string to a number.
 * Shopify returns amount as a string (e.g. "1299.00").
 */
export function parsePrice(amount) {
  return parseFloat(amount || '0');
}

/**
 * Compute discount percentage between sale price and compare-at price.
 * Returns 0 if no compare-at price or no discount.
 */
export function computeDiscountPercent(price, compareAtPrice) {
  if (!compareAtPrice) return 0;
  const sale = parsePrice(price?.amount);
  const orig = parsePrice(compareAtPrice?.amount);
  if (!orig || orig <= sale) return 0;
  return Math.round(((orig - sale) / orig) * 100);
}

/**
 * Read the `universe` tag from a Shopify product's tags array.
 * Convention: products are tagged with `universe:icon`, `universe:heritage`, etc.
 * Returns the universe id string, or null if not found.
 */
export function getUniverseFromTags(tags = []) {
  const tag = tags.find((t) => t.toLowerCase().startsWith('universe:'));
  return tag ? tag.split(':')[1].trim().toLowerCase() : null;
}

/* ─────────────────────────────────────────────────────────────
   Normaliser — Shopify product → ProductCard shape
   (matches what ProductGrid / ProductCard expect)
───────────────────────────────────────────────────────────── */

/**
 * Convert a Shopify product node (from collection query) into the minimal
 * card shape used by ProductCard / ProductGrid.
 *
 * @param {Object} node - Shopify product node from GraphQL edge
 * @returns {{ id, handle, img, name, price, originalPrice, badge, availableForSale }}
 */
export function normaliseProductCard(node) {
  const price       = node.priceRange?.minVariantPrice;
  const compareAt   = node.compareAtPriceRange?.minVariantPrice;
  const cardImages  = (node.images?.edges || []).map((edge) => edge.node).filter((image) => image?.url);
  const featuredUrl = node.featuredImage?.url || '';
  const galleryImages = [
    featuredUrl,
    ...cardImages.map((image) => image.url).filter((url) => url && url !== featuredUrl),
  ];
  const wearingImage = cardImages.find((image) =>
    /model|wear(?:ing)?|on.?foot|lifestyle|girl|woman|styled|lookbook/i.test(image.altText || '')
  ) || [...cardImages].reverse().find((image) => image.url !== featuredUrl);

  // Badge logic: use tags `badge:BESTSELLER`, `badge:NEW`, etc.
  const badgeTag = (node.tags || []).find((t) => t.toLowerCase().startsWith('badge:'));
  const badge    = badgeTag ? badgeTag.split(':')[1].trim().toUpperCase() : null;

  return {
    // Public product routes use the handle; retain the GraphQL ID for API use.
    id:              node.handle,
    shopifyId:       node.id,
    handle:          node.handle,
    // ProductCard renders product.img
    img:             featuredUrl,
    imgHover:        wearingImage?.url || '',
    imgSecond:       galleryImages[1] || '',
    images:          galleryImages,
    imgAlt:          node.featuredImage?.altText || node.title,
    name:            node.title,
    // ProductCard renders product.price as a string
    price:           formatMoney(price),
    priceRaw:        parsePrice(price?.amount),
    originalPrice:   formatMoney(compareAt),
    originalPriceRaw: parsePrice(compareAt?.amount),
    discountPercent: computeDiscountPercent(price, compareAt),
    badge,
    availableForSale: node.availableForSale,
  };
}

/* ─────────────────────────────────────────────────────────────
   Normaliser — Shopify product → full PDP shape
───────────────────────────────────────────────────────────── */

/**
 * Convert a full Shopify product node (from PRODUCT_BY_HANDLE_QUERY)
 * into the shape ProductPage.jsx consumes.
 *
 * Fields that Shopify does not provide natively (comfortProfile, benefits,
 * fitNote, editorialTagline, etc.) are set to sensible defaults so the PDP
 * renders gracefully until they are populated via Shopify metafields.
 *
 * @param {Object} node - Full Shopify product node from GraphQL
 * @returns {Object} - PDP-compatible product shape
 */
export function normaliseProduct(node) {
  if (!node) return null;

  const price     = node.priceRange?.minVariantPrice;
  const compareAt = node.compareAtPriceRange?.minVariantPrice;
  const imageNodes = (node.images?.edges || []).map((e) => e.node);
  const variants  = (node.variants?.edges || []).map((e) => e.node);
  const images = [...new Set([
    ...imageNodes.map((image) => image.url),
    ...variants.map((variant) => variant.image?.url),
    node.featuredImage?.url,
  ].filter(Boolean))];

  const colourByName = new Map();
  variants.forEach((variant) => {
    const option = variant.selectedOptions?.find(({ name }) => /colou?r/i.test(name));
    if (!option) return;
    const name = option.value;
    const normalizedName = name.trim().toLowerCase();
    const altImage = imageNodes.find(({ altText }) =>
      altText?.toLowerCase().includes(normalizedName)
    );
    const image = variant.image?.url || altImage?.url || null;
    const imageIndex = image ? images.indexOf(image) : -1;
    const knownHex = {
      black: '#1a1a1a', white: '#f5f3ef', nude: '#c9aa91', beige: '#c9b7a4', burgundy: '#641f35',
      brown: '#684b3b', tan: '#b88962', red: '#a83232', blue: '#46647e',
      gold: '#c5a45a', silver: '#b8b8b8', pink: '#d9a2ad', green: '#526b50',
    };
    const existingColour = colourByName.get(name);
    if (!existingColour || (existingColour.imageIndex < 0 && imageIndex >= 0)) {
      colourByName.set(name, {
        name,
        hex: knownHex[normalizedName] || '#d8d1c8',
        image,
        imageIndex,
      });
    }
  });

  // Some Shopify catalogs keep each color as a separate run of gallery photos
  // instead of making color a variant option. Use image alt text when provided.
  if (colourByName.size === 0) {
    const knownColours = ['black', 'white', 'nude', 'beige', 'burgundy', 'brown', 'tan', 'red', 'blue', 'gold', 'silver', 'pink', 'green'];
    imageNodes.forEach((image, imageIndex) => {
      const altText = image.altText || '';
      const matchedName = knownColours.find((colour) => new RegExp(`\\b${colour}\\b`, 'i').test(altText));
      if (!matchedName || colourByName.has(matchedName)) return;
      const knownHex = { black: '#1a1a1a', white: '#f5f3ef', nude: '#c9aa91', beige: '#c9b7a4', burgundy: '#641f35', brown: '#684b3b', tan: '#b88962', red: '#a83232', blue: '#46647e', gold: '#c5a45a', silver: '#b8b8b8', pink: '#d9a2ad', green: '#526b50' };
      colourByName.set(matchedName, { name: matchedName[0].toUpperCase() + matchedName.slice(1), hex: knownHex[matchedName], image: image.url, imageIndex });
    });
  }

  // This product's listing has no color option or image alt labels. The
  // gallery switches from Black to Nude after the first five images.
  if (colourByName.size === 0 && node.handle === 'black-pumps' && images.length > 6) {
    colourByName.set('Black', { name: 'Black', hex: '#1a1a1a', image: images[0], imageIndex: 0 });
    colourByName.set('Nude', { name: 'Nude', hex: '#c9aa91', image: images[6], imageIndex: 6 });
  }
  if (colourByName.size === 0 && node.handle === 'glitter-flat' && images.length > 5) {
    colourByName.set('Black', { name: 'Black', hex: '#1a1a1a', image: images[0], imageIndex: 0 });
    colourByName.set('Burgundy', { name: 'Burgundy', hex: '#641f35', image: images[6], imageIndex: 6 });
  }
  if (colourByName.size === 0 && node.handle === 'tip-dip' && images.length > 7) {
    colourByName.set('Nude', { name: 'Nude', hex: '#c9aa91', image: images[0], imageIndex: 0 });
    colourByName.set('Black', { name: 'Black', hex: '#1a1a1a', image: images[7], imageIndex: 7 });
  }
  if (colourByName.size === 0 && node.handle === 'kitten-heels' && images.length >= 15) {
    colourByName.set('Nude', { name: 'Nude', hex: '#c9aa91', image: images[0], imageIndex: 0 });
    colourByName.set('Burgundy', { name: 'Burgundy', hex: '#641f35', image: images[4], imageIndex: 4 });
    colourByName.set('Black', { name: 'Black', hex: '#1a1a1a', image: images[7], imageIndex: 7 });
  }

  const orderedColours = [...colourByName.values()]
    .filter((colour) => colour.imageIndex >= 0)
    .sort((a, b) => a.imageIndex - b.imageIndex);
  orderedColours.forEach((colour, colourIndex) => {
    const normalizedName = colour.name.trim().toLowerCase();
    if (node.handle === 'glitter-flat') {
      // Burgundy begins at gallery image 5; keep every Burgundy image out of Black's set.
      const splitIndex = 5;
      colour.galleryIndices = images
        .map((_, index) => index)
        .filter((index) => normalizedName === 'burgundy' ? index >= splitIndex : index < splitIndex);
      return;
    }

    const matchingAltIndices = imageNodes.flatMap((image, index) =>
      image.altText?.toLowerCase().includes(normalizedName) ? [images.indexOf(image.url)] : []
    ).filter((index) => index >= 0);
    if (matchingAltIndices.length) {
      colour.galleryIndices = [...new Set(matchingAltIndices)];
      return;
    }

    if (node.handle === 'black-pumps' || node.handle === 'tip-dip') {
      const splitIndex = node.handle === 'tip-dip' ? 7 : 5;
      colour.galleryIndices = colour.imageIndex < splitIndex
        ? images.map((_, index) => index).filter((index) => index < splitIndex)
        : images.map((_, index) => index).filter((index) => index >= splitIndex);
      return;
    }

    if (node.handle === 'kitten-heels') {
      const indicesByColour = {
        nude: [0, 1, 2, 3],
        burgundy: [4, 5, 6, 9, 11],
        black: [7, 8, 10, 12, 13, 14],
      };
      colour.galleryIndices = (indicesByColour[normalizedName] || [])
        .filter((index) => index < images.length);
      return;
    }

    const nextColourImage = orderedColours.slice(colourIndex + 1)
      .find((next) => next.imageIndex > colour.imageIndex)?.imageIndex ?? images.length;
    colour.galleryIndices = images
      .map((_, index) => index)
      .filter((index) => index >= colour.imageIndex && index < nextColourImage);
  });

  // Shopify option labels vary (for example "Size", "Shoe size", or "EU Size").
  const isSizeOption = (name = '') => /size/i.test(name);
  const sizeOption = (node.options || []).find((option) => isSizeOption(option.name));
  const sizeLabelFromVariant = (variant) => {
    const selectedSize = variant.selectedOptions?.find(({ name }) => isSizeOption(name));
    if (selectedSize?.value) return String(selectedSize.value).trim();

    // Some catalogs encode the shoe size in the variant title (e.g. "EU 38" or
    // "Black / 38") even when the product option is named "Title".
    const title = String(variant.title || '').trim();
    const match = title.match(/(?:^|\b)(?:EU\s*)?(3[5-9]|4[0-3])(?:\b|$)/i);
    return match?.[1] || '';
  };

  // Derive sizes from both the product option and variants. The latter keeps
  // the selector populated for Shopify products whose option is misnamed,
  // while ensuring every displayed size still maps to a real variant.
  const variantMap = {};
  variants.forEach((variant) => {
    const size = sizeLabelFromVariant(variant);
    if (size) variantMap[size] = variant;
  });
  const optionSizes = (sizeOption?.values || []).map((value) => String(value).trim()).filter(Boolean);
  const sizes = [...new Set([...optionSizes, ...Object.keys(variantMap)])]
    .filter((size) => variantMap[size])
    .sort((a, b) => {
      const aNumber = Number(String(a).match(/\d+(?:\.\d+)?/)?.[0]);
      const bNumber = Number(String(b).match(/\d+(?:\.\d+)?/)?.[0]);
      return Number.isFinite(aNumber) && Number.isFinite(bNumber) ? aNumber - bNumber : a.localeCompare(b);
    });

  // Quantity-level inventory is not queried; keep this shape for compatibility.
  const stockPerSize = {};
  Object.entries(variantMap).forEach(([size, variant]) => {
    stockPerSize[size] = variant.quantityAvailable ?? null;
  });

  // Badge
  const badgeTag = (node.tags || []).find((t) => t.toLowerCase().startsWith('badge:'));
  const badge    = badgeTag ? badgeTag.split(':')[1].trim().toUpperCase() : null;

  // Universe
  const universeId = getUniverseFromTags(node.tags);

  const discountPercent = computeDiscountPercent(price, compareAt);
  const materialTag = (node.tags || []).find((tag) => tag.toLowerCase().startsWith('material:'));
  const rawDescription = typeof node.description === 'string' ? node.description.trim() : '';
  const description = /^(n\/?a|not available|—|-)?$/i.test(rawDescription) ? '' : rawDescription;

  return {
    /* Shopify identifiers */
    shopifyId:        node.id,
    handle:           node.handle,

    /* Core fields — mapped from Shopify */
    id:               node.handle,          // used as URL slug
    name:             node.title,
    price:            parsePrice(price?.amount),
    originalPrice:    parsePrice(compareAt?.amount),
    discountPercent,
    availableForSale: node.availableForSale,

    /* Images — Shopify CDN URLs */
    images: images.length ? images : [node.featuredImage?.url].filter(Boolean),
    detailImages: images.slice(0, 3),
    imageDetails: images.map((url, index) => {
      const imageNode = imageNodes.find((image) => image.url === url);
      return {
        url,
        index,
        altText: imageNode?.altText || '',
        width: imageNode?.width || null,
        height: imageNode?.height || null,
      };
    }),

    /* Variants & sizes */
    sizes,
    variantMap,
    stockPerSize,

    /* Description */
    description,
    descriptionHtml: node.descriptionHtml,

    /* Badge & universe */
    badge,
    universeId,

    /* Fields with Shopify-native values where available, else sensible defaults */
    colours: [...colourByName.values()],
    videos:  [],

    /* Comfort profile — defaults; override via metafields */
    heelHeight:    node.tags?.find((t) => t.startsWith('heel:'))?.split(':')[1] || '—',
    closureType:   '—',
    soleType:      '—',
    material:      materialTag ? materialTag.split(':').slice(1).join(':').trim() : '',
    vendor:        node.vendor || '',
    comfortProfile: { cushioning: '—', stability: '—', bestForHours: '—' },

    /* Defaults for editorial sections */
    fitNote:         '',
    // Product descriptions belong beneath the gallery, not in the editorial hook section.
    oneLineHook:     '',
    benefits:        [],
    bestForOccasion: '',
    stylingNote:     '',
    offerBanner:     null,

    /* Delivery / returns — adjust per your store policy */
    deliveryDaysEstimate: '5–7 business days',
    returnWindowDays:     7,
    exchangeWindowDays:   15,
    codAvailable:         true,

    /* Reviews — Shopify Storefront API does not expose reviews natively */
    rating:          null,
    reviewCount:     0,
    reviews:         [],
    customerPhotos:  [],

    /* FAQ & accordion — these are editorial and can be sourced from metafields */
    productSpecificQuestions: [],
    accordion: [],

    relatedProducts: [],
    completeTheLook: [],

    /* SEO */
    pageTitle:       node.seo?.title       || `${node.title} — SYORA`,
    pageDescription: node.seo?.description || node.description || '',

    /* Editorial */
    editorialTagline: 'DIFFERENT WORLDS.\nSAME YOU.',
    editorialBg:      '',

    isBestseller: !!(node.tags || []).find(
      (t) => t.toLowerCase() === 'bestseller' || t.toLowerCase() === 'badge:bestseller'
    ),
  };
}

/* ─────────────────────────────────────────────────────────────
   API Calls
───────────────────────────────────────────────────────────── */

/**
 * Test that the Storefront API is reachable and credentials are valid.
 * Returns the shop name string, or throws on failure.
 */
export async function testShopifyConnection() {
  const data = await shopifyFetch({ query: SHOP_QUERY });
  return data?.shop?.name || 'Connected';
}

/**
 * Fetch normalised product cards for a given collection handle.
 * Used by UniversePage to populate product grids.
 *
 * @param {string} handle  - Shopify collection handle (e.g. 'icon', 'heritage')
 * @param {number} [first=20] - Number of products to fetch
 * @returns {Promise<Array>}  - Array of normalised product card objects
 */
export async function getCollectionProducts(handle, first = 20) {
  const data = await shopifyFetch({
    query:     COLLECTION_QUERY,
    variables: { handle, first },
  });

  const collection = data?.collection;
  if (!collection) return [];

  return (collection.products?.edges || []).map((e) => normaliseProductCard(e.node));
}

/**
 * Fetch a single product by handle for the PDP.
 * Returns a normalised product object, or null if not found.
 *
 * @param {string} handle - Shopify product handle
 * @returns {Promise<Object|null>}
 */
export async function getProductByHandle(handle) {
  const data = await shopifyFetch({
    query:     PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });
  return normaliseProduct(data?.product);
}
