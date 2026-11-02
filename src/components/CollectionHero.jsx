import './CollectionPage.css';

/**
 * SYORA — Collection hero
 *
 * Editorial banner at the top of every universe collection page:
 * eyebrow → headline (the page's <h1>) → supporting line → live product count,
 * beside a crop of the universe's campaign photography.
 * Colours come from `hero.colors`, so each universe has its own atmosphere
 * while the structure stays identical.
 */
export default function CollectionHero({ hero, headingId, title, description, countLabel, onBrowse }) {
  return (
    <header
      className="plp-hero"
      style={{ '--banner-ar': hero.image.bannerRatio || '4 / 1', '--banner-fade': hero.image.bannerFade || '34%', '--hero-bg': hero.image.bannerBg || hero.colors.bg, '--hero-ink': hero.colors.ink, '--hero-accent': hero.colors.accent }}
    >
      <div className="plp-hero__media">
        <picture>
          {hero.image.bannerMobile && <source media="(max-width: 639px)" srcSet={hero.image.bannerMobile} />}
          <img
            src={hero.image.banner || hero.image.src}
            alt={hero.image.alt}
            width={hero.image.banner ? (hero.image.bannerRatio ? 2000 : 1600) : 1600}
            height={hero.image.banner ? 400 : 898}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="plp-hero__text">
        {hero.eyebrow && <p className="plp-hero__eyebrow">{hero.eyebrow}</p>}
        <h1 id={headingId} className="plp-hero__title">
          {String(title).split('\n').map((line, i) => (i === 0 ? line : [' ', <br key={i} />, line]))}
        </h1>
        {description && <p className="plp-hero__desc">{description}</p>}
        <p className="plp-hero__count" role="status" aria-live="polite">{countLabel}</p>
        {hero.cta && countLabel && onBrowse && (
          <button type="button" className="plp-hero__cta" onClick={onBrowse}>
            <span>{hero.cta}</span>
            <span className="plp-hero__cta-arrow" aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </header>
  );
}
