import { useNavigate } from 'react-router-dom';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';

/**
 * SYORA — Explore More Universes
 *
 * Shown at the bottom of every universe page.
 * The current universe is automatically excluded from the list.
 */
export default function ExploreMore({ currentId }) {
  const navigate = useNavigate();

  // Show all universes except the current one, in canonical order
  const others = UNIVERSE_ORDER.filter((id) => id !== currentId);

  return (
    <section className="explore-more" aria-labelledby="explore-more-title">
      <div className="explore-more__header">
        <p className="explore-more__eyebrow">— THE MULTIVERSE</p>
        <h2 id="explore-more-title" className="explore-more__title">
          EXPLORE MORE UNIVERSES
        </h2>
        <p className="explore-more__subtitle">
          Every side of you has a home here.
        </p>
      </div>

      <div className="explore-more__grid">
        {others.map((id) => {
          const u = UNIVERSES[id];
          return (
            <button
              key={id}
              id={`explore-tile-${id}`}
              className="explore-tile"
              onClick={() => navigate(`/universe/${id}`)}
              aria-label={`Explore ${u.name} universe — ${u.tagline}`}
            >
              {/* Background image */}
              <div className="explore-tile__img-wrap">
                <img
                  src={u.heroImage}
                  alt={u.heroImageAlt}
                  className="explore-tile__img"
                  loading="lazy"
                />
              </div>

              {/* Gradient overlay */}
              <div className="explore-tile__overlay" />

              {/* Text */}
              <div className="explore-tile__content">
                <span className="explore-tile__name">{u.name}</span>
                <span className="explore-tile__tagline">{u.tagline}</span>
                <span className="explore-tile__cta">ENTER →</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
