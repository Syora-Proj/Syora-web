/**
 * SYORA — build-time pre-render (runs after `vite build`, see "build" in package.json).
 *
 * For every product in the Shopify store it writes dist/product/<handle>/index.html: the normal
 * app shell PLUS the page's real <title>, description, canonical, social tags, Product/Breadcrumb
 * structured data and a plain-HTML copy of the key content. Crawlers and link-preview bots (WhatsApp,
 * Instagram, Facebook…) read that HTML without running JavaScript; browsers then boot the React app
 * exactly as before. It also writes sitemap.xml and robots.txt.
 *
 * Shopify is expected to be reachable at build time. If the Shopify request fails for any reason
 * (missing/invalid credentials, network error, HTTP error, GraphQL error) the build FAILS LOUDLY
 * (non-zero exit) instead of silently shipping a deploy with zero product pages and a stale/empty
 * sitemap — a broken Shopify connection is a build-blocking problem, not a warning to scroll past.
 * Set PRERENDER_ALLOW_SKIP=true to explicitly opt out of that (e.g. local dev before .env.local
 * has real credentials yet); this is never set in production/Vercel.
 *
 * Offline testing: PRERENDER_FIXTURE=path/to/products.json (an array of raw Storefront product nodes)
 * skips the network entirely and never fails for Shopify-reachability reasons.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const log = (...a) => console.log('[prerender]', ...a);
const warn = (...a) => console.warn('[prerender] WARNING:', ...a);

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const UNIVERSE_IDS = ['icon', 'heritage', 'everyday', 'motion'];

const HANDLES_QUERY = `
  query PrerenderHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges { node { handle updatedAt } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

async function main() {
  let template;
  try {
    template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
  } catch {
    warn('dist/index.html not found — run `vite build` first. Skipping.');
    return;
  }

  const vite = await createServer({
    root,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });

  try {
    const { shopifyFetch } = await vite.ssrLoadModule('/src/lib/shopify/client.js');
    const { PRODUCT_BY_HANDLE_QUERY } = await vite.ssrLoadModule('/src/lib/shopify/queries.js');
    const { normaliseProduct } = await vite.ssrLoadModule('/src/lib/shopify/products.js');
    const seoLib = await vite.ssrLoadModule('/src/lib/seo.js');
    const { INFO_PAGES } = await vite.ssrLoadModule('/src/data/infoPages.jsx');
    const { UNIVERSES } = await vite.ssrLoadModule('/src/data/universes.js');
    const productCatalog = await vite.ssrLoadModule('/src/data/productCatalog.js');
    const origin = seoLib.siteOrigin();

    /* ── 1. Which products? ── */
    let nodes = [];
    if (process.env.PRERENDER_FIXTURE) {
      nodes = JSON.parse(await fs.readFile(path.resolve(process.env.PRERENDER_FIXTURE), 'utf8'));
      log(`fixture mode: ${nodes.length} product(s)`);
    } else {
      let after = null;
      for (let page = 0; page < 20; page += 1) {
        const data = await shopifyFetch({ query: HANDLES_QUERY, variables: { first: 100, after } });
        const conn = data?.products;
        (conn?.edges || []).forEach((e) => e?.node?.handle && nodes.push(e.node));
        if (!conn?.pageInfo?.hasNextPage) break;
        after = conn.pageInfo.endCursor;
      }
      log(`found ${nodes.length} product(s) in the store`);
    }

    /* ── 2. One static page per product ── */
    const written = [];
    const queue = [...nodes];
    const worker = async () => {
      while (queue.length) {
        const stub = queue.shift();
        try {
          const raw = process.env.PRERENDER_FIXTURE
            ? stub
            : (await shopifyFetch({ query: PRODUCT_BY_HANDLE_QUERY, variables: { handle: stub.handle } }))?.product;
          const product = normaliseProduct(raw);
          if (!product?.handle) continue;
          const universe = UNIVERSES[product.universeId];
          const seo = seoLib.buildProductSeo(product, { origin, universe: universe ? { id: product.universeId, name: universe.name } : null });
          const html = injectProduct(template, product, seo, seoLib.productHeadHtml(seo));
          const dir = path.join(dist, 'product', productCatalog.slugFor(product.handle) || product.handle);
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(path.join(dir, 'index.html'), html);
          written.push({ handle: product.handle, lastmod: (stub.updatedAt || '').slice(0, 10) });
        } catch (err) {
          warn(`skipped "${stub.handle}": ${err.message}`);
        }
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    log(`wrote ${written.length} product page(s)`);

    /* ── 3. sitemap.xml + robots.txt ── */
    const urls = [
      { loc: `${origin}/` },
      { loc: `${origin}/shop` },
      ...UNIVERSE_IDS.filter((id) => UNIVERSES[id]).map((id) => ({ loc: `${origin}/universe/${id}` })),
      ...INFO_PAGES.map((p) => ({ loc: `${origin}/info/${p.slug}` })),
      ...written.sort((a, b) => a.handle.localeCompare(b.handle)).map((p) => ({ loc: `${origin}${productCatalog.productPath(p.handle)}`, lastmod: p.lastmod })),
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
      .join('\n')}\n</urlset>\n`;
    await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap);
    await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /order-confirmation\nDisallow: /cart\nDisallow: /wishlist\nDisallow: /search\n\nSitemap: ${origin}/sitemap.xml\n`);
    log(`wrote sitemap.xml (${urls.length} URLs) and robots.txt for ${origin}`);
  } finally {
    await vite.close();
  }
}

/** Swap the page head for the product's and put a plain-HTML copy of the content inside #root. */
function injectProduct(template, product, seo, headTags) {
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title data-prerender>${esc(seo.title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${esc(seo.description)}" data-prerender>`);
  // Drop the generic homepage canonical / share tags: the product's own replace them.
  html = html.replace(/\s*<(?:link|meta)\b[^>]*data-site-default[^>]*>/gi, '');
  html = html.replace('</head>', `    ${headTags}\n  </head>`);
  // The splash-screen block (hidden outside the homepage) holds a second <h1>: drop it from product pages.
  html = html.replace(/<div id="initial-hero"[\s\S]*?<\/div>\s*(?=<div id="root">)/i, '');
  html = html.replace(/<script>\s*if \(window\.location\.pathname === '\/'\)[\s\S]*?<\/script>/i, '');

  const specs = [
    ['Material', product.material],
    ['Heel height', product.heelHeight],
    ['Brand', product.vendor || 'SYORA'],
  ].filter(([, v]) => v && !/^(—|-)$/.test(String(v)));
  const body = `<main style="max-width:760px;margin:0 auto;padding:32px 20px;font:16px/1.65 Inter,system-ui,sans-serif;color:#1f140e;background:#faf5ee">
      <nav aria-label="Breadcrumb"><a href="/">Home</a>${product.universeId ? ` / <a href="/universe/${esc(product.universeId)}">${esc(product.universeId)}</a>` : ''}</nav>
      <h1>${esc(product.name)}</h1>
      ${product.price > 0 ? `<p><strong>₹${Number(product.price).toLocaleString('en-IN')}</strong>${product.originalPrice > product.price ? ` <s>₹${Number(product.originalPrice).toLocaleString('en-IN')}</s>` : ''} — inclusive of all taxes</p>` : ''}
      ${seo.image ? `<p><img src="${esc(seo.image)}" alt="${esc(product.name)}" width="640" style="max-width:100%;height:auto"></p>` : ''}
      ${product.description ? `<p>${esc(product.description)}</p>` : ''}
      ${specs.length ? `<ul>${specs.map(([l, v]) => `<li>${esc(l)}: ${esc(v)}</li>`).join('')}</ul>` : ''}
      <p>Delivery across India in 3–7 business days. Easy exchanges.</p>
    </main>`;
  return html.replace('<div id="root"></div>', `<div id="root">\n    ${body}\n    </div>`);
}

main().catch((err) => {
  warn(`pre-render FAILED — ${err.message}`);
  if (process.env.PRERENDER_ALLOW_SKIP === 'true') {
    warn('PRERENDER_ALLOW_SKIP=true — continuing with an unmodified SPA build (no product pages, no sitemap update).');
    process.exitCode = 0;
  } else {
    warn('Shopify is expected to be reachable at build time. Failing the build instead of shipping a deploy ' +
      'with zero product pages. Set PRERENDER_ALLOW_SKIP=true to explicitly bypass this (not recommended in production).');
    process.exitCode = 1;
  }
}).finally(() => process.exit(process.exitCode ?? 0));
