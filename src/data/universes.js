/**
 * SYORA — the four universes ("chapters").
 * Single source of truth for chapter names, order, numerals and voice.
 * Products are never listed here: they come from Shopify.
 * A universe is a Shopify collection whose handle equals `id`.
 */
export const UNIVERSE_ORDER = ['icon', 'heritage', 'everyday', 'motion'];

export const UNIVERSES = {
  icon: {
    id: 'icon', num: '01', name: 'ICON',
    tagline: 'Walk into any room first.',
    headline: 'Confidence is your best heel.', emphasis: 'best',
    intro: 'Heels with a point of view: kitten, block, slingback and Mary Jane. Made for the room you want to walk into first.',
    soon: 'ICON is being restocked.',
    alt: 'Model in a burgundy evening gown and heels in a warmly lit interior',
    pos: '60% 30%',
  },
  heritage: {
    id: 'heritage', num: '02', name: 'HERITAGE',
    tagline: 'Tradition had a glow-up.',
    headline: 'Tradition had a glow-up.', emphasis: 'glow-up',
    intro: 'Indian footwear traditions, worn the way you dress now.',
    soon: 'Launching soon.',
    alt: 'Model in an embroidered kurta seated on stone steps in warm light',
    pos: '55% 30%',
  },
  everyday: {
    id: 'everyday', num: '03', name: 'EVERYDAY',
    tagline: 'Effortless. Every single day.',
    headline: 'The ones you reach for.', emphasis: 'reach',
    intro: 'Slides and sandals for the pairs you reach for without thinking.',
    soon: 'EVERYDAY is being restocked.',
    alt: 'Model in cream tailoring seated on a sofa in soft morning light',
    pos: '58% 30%',
  },
  motion: {
    id: 'motion', num: '04', name: 'MOTION',
    tagline: 'City energy. Your pace.',
    headline: 'Move on your own terms.', emphasis: 'own',
    intro: 'Footwear for moving fast.',
    soon: 'Launching soon.',
    alt: 'Model in a black blazer crouching to tie a sneaker in an urban setting',
    pos: '50% 25%',
  },
};

export const isUniverse = (id) => UNIVERSE_ORDER.includes(id);
