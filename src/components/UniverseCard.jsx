import { Link } from 'react-router-dom';
import './UniverseShowcase.css';

/* Lifestyle crops of the existing SYORA campaign photography (legs + footwear),
   with a per-universe tonal colour that continues the photograph's own tones. */
export const CARD_ART = {
  icon: {
    src: '/universe-cards/icon.webp',
    alt: 'Woman wearing black patent stiletto heels with a burgundy silk dress',
    panel: '#3a0e12',
  },
  heritage: {
    src: '/universe-cards/heritage.webp',
    alt: 'Woman wearing gold embroidered juttis with a burgundy silk outfit',
    panel: '#4a2a18',
  },
  everyday: {
    src: '/universe-cards/everyday.webp',
    alt: 'Woman wearing ivory quilted ballet flats with a bow detail on stone steps',
    panel: '#7a5636',
  },
  motion: {
    src: '/universe-cards/motion.webp',
    alt: 'Woman tying white and beige sneakers on stone steps',
    panel: '#34281f',
  },
};

/**
 * Universe card — shared by the homepage "Find Your Style" section and the
 * "Explore More Universes" row on every collection page.
 */
export default function UniverseCard({
  universe,
  tileId,
  ariaLabel,
  delay = 0,
  selected = false,
  isStatic = false,
  onClick,
}) {
  const art = CARD_ART[universe.id];
  return (
    <Link
      id={tileId}
      to={`/universe/${universe.id}`}
      className={`uw-card${selected ? ' uw-card--selected' : ''}${isStatic ? ' uw-card--static' : ''}`}
      style={{ '--card-delay': `${delay}ms`, '--panel': art.panel }}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <div className="uw-card__media">
        <img
          src={art.src}
          alt={art.alt}
          width="800"
          height="1000"
          className="uw-card__img"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="uw-card__shade" />

      <div className="uw-card__body">
        <span className="uw-card__name">{universe.name}</span>
        <span className="uw-card__tagline">{universe.tagline}</span>
      </div>
    </Link>
  );
}
