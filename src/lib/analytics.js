/**
 * SYORA — GA4 Ecommerce Analytics
 *
 * Fires standard GA4 ecommerce events at the correct touchpoints.
 * Import and call these functions from components — never inline.
 *
 * IMPORTANT:
 * - Requires GA4 Measurement ID configured via Google Tag Manager or gtag.js
 * - Does NOT fire purchase events until verified end-to-end
 * - Does NOT send PII (names, emails, card data)
 * - Purchase event is guarded against double-firing on page refresh
 *
 * To activate:
 * 1. Add your GTM container snippet to /index.html <head>
 * 2. OR add gtag.js snippet and set VITE_GA4_MEASUREMENT_ID
 * 3. Configure GA4 enhanced ecommerce in GTM/GA4
 */

/* ─────────────────────────────────────────────────────────────
   Safe dataLayer push helper
───────────────────────────────────────────────────────────── */

function push(event) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce data
  window.dataLayer.push(event);
}

/* ─────────────────────────────────────────────────────────────
   Item shape builder
───────────────────────────────────────────────────────────── */

function buildItem(product, variant = null, quantity = 1, index = 0) {
  return {
    item_id:         variant?.id    || product.shopifyId || product.id,
    item_name:       product.name   || product.title,
    item_variant:    variant?.title || undefined,
    item_category:   product.universeId ? `SYORA / ${product.universeId.toUpperCase()}` : undefined,
    price:           variant ? parseFloat(variant.price?.amount || 0) : (product.price || 0),
    currency:        'INR',
    quantity,
    index,
  };
}

/* ─────────────────────────────────────────────────────────────
   Public event functions
───────────────────────────────────────────────────────────── */

/** Fire when a product detail page loads. */
export function trackViewItem(product) {
  if (!product) return;
  push({
    event: 'view_item',
    ecommerce: {
      currency: 'INR',
      value:    product.price || 0,
      items:    [buildItem(product)],
    },
  });
}

/** Fire when a collection / universe page loads. */
export function trackViewItemList(products = [], listName = 'Collection') {
  if (!products.length) return;
  push({
    event: 'view_item_list',
    ecommerce: {
      item_list_name: listName,
      items: products.map((p, i) => buildItem(p, null, 1, i)),
    },
  });
}

/** Fire when a user clicks a product card. */
export function trackSelectItem(product, listName = 'Collection', index = 0) {
  if (!product) return;
  push({
    event: 'select_item',
    ecommerce: {
      item_list_name: listName,
      items: [buildItem(product, null, 1, index)],
    },
  });
}

/** Fire when a variant is added to cart. */
export function trackAddToCart(product, variant, quantity = 1) {
  if (!product) return;
  push({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'INR',
      value:    parseFloat(variant?.price?.amount || product.price || 0) * quantity,
      items:    [buildItem(product, variant, quantity)],
    },
  });
}

/** Fire when a line item is removed from cart. */
export function trackRemoveFromCart(product, variant, quantity = 1) {
  if (!product) return;
  push({
    event: 'remove_from_cart',
    ecommerce: {
      currency: 'INR',
      value:    parseFloat(variant?.price?.amount || 0) * quantity,
      items:    [buildItem(product, variant, quantity)],
    },
  });
}

/** Fire when the cart drawer opens. */
export function trackViewCart(cart) {
  if (!cart) return;
  push({
    event: 'view_cart',
    ecommerce: {
      currency: 'INR',
      value:    parseFloat(cart.subtotal?.amount || 0),
      items: (cart.lines || []).map((line, i) =>
        buildItem(
          { shopifyId: line.variant?.product?.id, name: line.variant?.product?.title, universeId: null },
          line.variant,
          line.quantity,
          i
        )
      ),
    },
  });
}

/** Fire when the user initiates checkout (clicks "Go to Checkout"). */
export function trackBeginCheckout(cart) {
  if (!cart) return;
  push({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'INR',
      value:    parseFloat(cart.subtotal?.amount || 0),
      items: (cart.lines || []).map((line, i) =>
        buildItem(
          { shopifyId: line.variant?.product?.id, name: line.variant?.product?.title },
          line.variant,
          line.quantity,
          i
        )
      ),
    },
  });
}

/**
 * Fire a purchase event once per order.
 *
 * IMPORTANT: This must only be called ONCE per transaction ID.
 * The OrderConfirmation page must guard against re-firing on refresh
 * by storing the orderId in sessionStorage after firing.
 *
 * Do not call this until you can verify the order data from Shopify.
 *
 * @param {Object} orderData - { orderId, total, subtotal, currency, items }
 */
export function trackPurchase(orderData) {
  const { orderId, total, currency = 'INR', items = [] } = orderData;
  if (!orderId) return;

  // Guard: only fire once per order ID in this session
  const firedKey = `purchase_fired_${orderId}`;
  if (sessionStorage.getItem(firedKey)) {
    console.info('[SYORA Analytics] Purchase event already fired for order', orderId);
    return;
  }

  push({
    event: 'purchase',
    ecommerce: {
      transaction_id: orderId,
      value:          total,
      currency,
      items,
    },
  });

  sessionStorage.setItem(firedKey, '1');
}
