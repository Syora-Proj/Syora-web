/**
 * SYORA — site configuration.
 * Brand-level facts and structure live here; products never do.
 */
export const SITE = {
  name: 'SYORA',
  url: 'https://www.syora.co.in',
  title: 'SYORA — The Multiverse | One Woman. Infinite Versions.',
  description: 'Contemporary, design-led women’s footwear across four universes: ICON, HERITAGE, EVERYDAY and MOTION.',
  email: 'support@syora.co.in',
};

/**
 * Shopping categories. A category is a Shopify collection; the storefront
 * connects to it by `handle`. These handles are a default guess: tell us the
 * real handles and change them here (one line each). A handle that does not
 * exist in Shopify renders a quiet "Coming soon" plate, never an error.
 */
export const CATEGORIES = [
  { id: 'flats',          name: 'Flats',          handle: 'flats' },
  { id: 'kitten-heels',   name: 'Kitten Heels',   handle: 'kitten-heels' },
  { id: 'block-heels',    name: 'Block Heels',    handle: 'block-heels' },
  { id: 'closed',         name: 'Closed Footwear', handle: 'closed-footwear' },
  { id: 'mules',          name: 'Mules',          handle: 'mules' },
  { id: 'kolhapuri',      name: 'Kolhapuri',      handle: 'kolhapuri' },
];

/**
 * Trust facts. Wording is taken from the existing policy text in the footer.
 * They are shown as written there and still await the owner's confirmation
 * (asset request 5). Remove or edit a line here and it disappears everywhere.
 */
export const TRUST = [
  { id: 'delivery', label: 'Delivery',  text: 'Estimated 5–7 business days to serviceable PIN codes.' },
  { id: 'cod',      label: 'Payment',   text: 'Cash on delivery where the PIN code and courier allow.' },
  { id: 'exchange', label: 'Exchanges', text: 'Size or colour exchange within 48 hours of delivery, unworn.' },
  { id: 'support',  label: 'Support',   text: SITE.email },
];

/** Add real profile URLs here and the icons appear in the footer. */
export const SOCIAL = [
  { name: 'Instagram', url: '' },
  { name: 'Pinterest', url: '' },
  { name: 'Facebook',  url: '' },
];

/**
 * Product metafields to read, as { namespace, key, label }. Empty until the
 * metafield definitions are confirmed (asset request 9). Anything listed here
 * that has a value renders in the product details; anything without a value
 * is skipped.
 */
export const PRODUCT_METAFIELDS = [];
