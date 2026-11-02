/**
 * SYORA — collection-page editorial content (one entry per universe)
 *
 * Headline, supporting copy, hero photograph and colour direction for the universe
 * collection pages. Products, prices and filters are NOT defined here: they always
 * come from the live Shopify collection that matches the universe id.
 *
 * Hero photographs are crops of existing SYORA campaign photography (public/collection-heroes).
 */
export const COLLECTION_CONTENT = {
  icon: {
    eyebrow: 'The ICON Universe',
    cta: 'Explore ICON',
    headline: 'Statement Heels\nfor Standout Moments.',
    description: 'Bold silhouettes, refined details and unforgettable presence.',
    hero: {
      src: '/collection-heroes/icon.webp',
      banner: '/collection-heroes/banner-icon.webp',
      bannerMobile: '/collection-heroes/banner-m-icon.webp',
      bannerBg: '#2a0205',
      alt: 'Woman wearing strappy ankle-strap heels on polished marble',
      position: '100% 100%',
    },
    colors: { bg: '#2b0a0d', ink: '#f7eee4', accent: '#e4c9a3', pill: '#2b0a0d' },
  },
  heritage: {
    eyebrow: 'The HERITAGE Universe',
    cta: 'Explore HERITAGE',
    headline: 'Rooted in Craft.\nWorn with Pride.',
    description: 'Timeless juttis and traditional-inspired designs that celebrate our rich heritage with a modern interpretation.',
    hero: {
      src: '/collection-heroes/heritage.webp',
      banner: '/collection-heroes/banner-heritage.webp',
      bannerMobile: '/collection-heroes/banner-m-heritage.webp',
      bannerBg: '#47240f',
      alt: 'Woman wearing embroidered juttis on sandstone steps',
      position: '100% 100%',
    },
    colors: { bg: '#3a2214', ink: '#f7eee4', accent: '#e6c48c', pill: '#3a2214' },
  },
  everyday: {
    eyebrow: 'The EVERYDAY Universe',
    cta: 'Explore EVERYDAY',
    headline: 'Effortless Flats\nfor Everyday Edits.',
    description: 'Versatile, comfortable and endlessly wearable — designed for the days you do it all.',
    hero: {
      src: '/collection-heroes/everyday.webp',
      banner: '/collection-heroes/banner-everyday.webp',
      bannerMobile: '/collection-heroes/banner-m-everyday.webp',
      bannerBg: '#dcb898',
      alt: 'Woman wearing cream flats with a gold buckle detail in soft daylight',
      position: '100% 100%',
    },
    colors: { bg: '#f0dcc3', ink: '#2a1810', accent: '#8a4b32', pill: '#5f4128' },
  },
  motion: {
    eyebrow: 'The MOTION Universe',
    cta: 'Explore MOTION',
    headline: 'City Energy.\nYour Pace.',
    description: 'Modern sneakers and everyday essentials for a life in motion. Designed for those who move, create and go further.',
    hero: {
      src: '/collection-heroes/motion.webp',
      banner: '/collection-heroes/banner-motion.webp',
      bannerMobile: '/collection-heroes/banner-m-motion.webp',
      bannerBg: '#231e19',
      alt: 'Woman lacing white sneakers with striped socks against a concrete wall',
      position: '100% 100%',
    },
    colors: { bg: '#2a221d', ink: '#f7eee4', accent: '#d9c3a0', pill: '#2a221d' },
  },
};

/**
 * "Explore All" — the full catalogue page (/shop). The banner is composed from one shoe of each
 * universe's photography (public/collection-heroes/banner-all.webp).
 */
export const ALL_PRODUCTS_CONTENT = {
  eyebrow: 'The Full Collection',
  headline: 'Every Pair.\nEvery Version of You.',
  description: 'Heels, juttis, flats and sneakers from all four SYORA universes — in one place.',
  hero: {
    src: '/collection-heroes/banner-all.webp',
    banner: '/collection-heroes/banner-all.webp',
    bannerMobile: '/collection-heroes/banner-m-all.webp',
    bannerBg: '#2a0205',
    bannerRatio: '5 / 1',
    bannerFade: '8%',
    alt: 'A heel, a jutti, a flat and a sneaker from the four SYORA collections',
  },
  colors: { bg: '#2a0205', ink: '#f7eee4', accent: '#e4c9a3', pill: '#2a0205' },
};
