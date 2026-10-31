/**
 * SYORA — colour name → swatch colour
 *
 * Product colour options arrive from Shopify as plain names ("Nude", "Black"). The
 * card swatches map those names to a display colour. Names are matched whole first,
 * then word by word ("Nude Pink" → nude), so most naming variants resolve. A name we
 * don't know falls back to a neutral swatch rather than a wrong colour.
 */
const COLOURS = {
  black: '#1b1714', noir: '#1b1714', onyx: '#1b1714',
  white: '#f7f4ef', ivory: '#eadfcb', cream: '#efe4d0', 'off white': '#f1ebe0', pearl: '#ece4d8', bone: '#e6dccb',
  nude: '#dcc0ab', blush: '#e6c4b8', beige: '#d9c3a3', sand: '#d6c0a0', champagne: '#e3cfae', taupe: '#a8957f',
  tan: '#b98a5e', camel: '#b5835a', caramel: '#a8703f', brown: '#6b4630', tobacco: '#7a4d2e', chocolate: '#4d3224', cognac: '#9a5b2f',
  gold: '#c9a35b', golden: '#c9a35b', bronze: '#a67a43', copper: '#b5683f', silver: '#c4c4c2', metallic: '#c9b88f',
  pink: '#e3a5b0', rose: '#d99aa3', mauve: '#b78b95', peach: '#efbfa3', coral: '#e57f6a',
  red: '#a8232b', maroon: '#5a1717', burgundy: '#5a1717', wine: '#5a1d2e', oxblood: '#4a1414', cherry: '#8e1d2a', rust: '#a2482b',
  orange: '#d9772f', yellow: '#e2c25a', mustard: '#c99a2e',
  green: '#5b7a5a', olive: '#6b6b3f', sage: '#9aa88a', emerald: '#1f6b50',
  blue: '#41618c', navy: '#1f2a44', teal: '#2f6f73', sky: '#a5c3de',
  purple: '#6f4b7a', lilac: '#bba6cf', plum: '#5b2a47',
  grey: '#9a9a98', gray: '#9a9a98', charcoal: '#3b3a39', stone: '#bdb5a8',
};
const FALLBACK = '#cfc4b6';

export function colourHex(name = '') {
  const key = String(name).toLowerCase().trim();
  if (COLOURS[key]) return COLOURS[key];
  const word = key.split(/[\s/&-]+/).find((w) => COLOURS[w]);
  return word ? COLOURS[word] : FALLBACK;
}
