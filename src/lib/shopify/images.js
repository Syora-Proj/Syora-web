/**
 * Responsive image URLs.
 *
 * Shopify's CDN resizes on request (`?width=`) and serves WebP/AVIF automatically
 * to browsers that accept it. Other hosts (local assets, mocks) are returned
 * unchanged. Product cards used to download the full-size original.
 */
const isShopifyCdn = (url) => typeof url === 'string' && /cdn\.shopify\.com|\.myshopify\.com\/cdn\//.test(url);

export function imgUrl(url, width) {
  if (!url || !isShopifyCdn(url)) return url;
  const u = new URL(url);
  u.searchParams.set('width', String(width));
  return u.toString();
}

export function imgSrcSet(url, widths = [320, 480, 640, 800, 1200]) {
  if (!url || !isShopifyCdn(url)) return undefined;
  return widths.map((w) => `${imgUrl(url, w)} ${w}w`).join(', ');
}
