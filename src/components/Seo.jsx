import { SITE } from '../config/site';

/**
 * Per-route head tags. React 19 hoists <title>, <meta> and <link> into <head>,
 * and removes them again when the route changes.
 * `path` is the canonical path (no query string). `jsonLd` is one object or an array.
 */
export default function Seo({ title, description, path = '/', image, noindex = false, jsonLd }) {
  const full = title ? `${title} | ${SITE.name}` : SITE.title;
  const desc = description || SITE.description;
  const url = `${SITE.url}${path}`;
  const img = image ? (image.startsWith('http') ? image : `${SITE.url}${image}`) : `${SITE.url}/img/hero-icon-1440.webp`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <>
      <title>{full}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
      ))}
    </>
  );
}

export const organizationLd = () => ({
  '@context': 'https://schema.org', '@type': 'Organization', name: SITE.name, url: SITE.url,
  logo: `${SITE.url}/favicon.svg`, email: SITE.email,
});
export const websiteLd = () => ({
  '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url,
  potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
});
export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE.url}${it.path}` })),
});
