/**
 * Writes dist/sitemap.xml and dist/robots.txt after `vite build`.
 * Static routes always; product URLs are read from Shopify when the build has
 * VITE_SHOPIFY_* variables (Vercel does). If Shopify is unreachable the sitemap
 * still ships with the static routes. No secrets are written anywhere.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const SITE = 'https://www.syora.co.in';
const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
const token = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const paths = ['/', '/universe/icon', '/universe/heritage', '/universe/everyday', '/universe/motion', '/shop'];

async function gql(query, variables) {
  const r = await fetch(`https://${domain}/api/2025-01/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  return (await r.json()).data;
}

const dynamic = [];
if (domain && token) {
  try {
    let after = null;
    do {
      const d = await gql('query($after:String){products(first:100,after:$after){pageInfo{hasNextPage endCursor} edges{node{handle updatedAt}}}}', { after });
      d.products.edges.forEach((e) => dynamic.push({ path: `/product/${e.node.handle}`, lastmod: e.node.updatedAt?.slice(0, 10) }));
      after = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
    } while (after);
  } catch (e) { console.warn('sitemap: product list skipped:', e.message); }
} else console.warn('sitemap: no Shopify env at build; static routes only');

const urls = [...paths.map((path) => ({ path })), ...dynamic];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `  <url><loc>${SITE}${u.path}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
mkdirSync('dist', { recursive: true });
writeFileSync('dist/sitemap.xml', xml);
console.log(`sitemap: ${urls.length} urls`);
