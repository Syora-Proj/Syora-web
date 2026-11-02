import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';
import UniverseCard from './UniverseCard';

/**
 * SYORA — Explore More Universes
 *
 * Shown at the bottom of every universe page.
 * The current universe is automatically excluded from the list.
 */
export default function ExploreMore({ currentId }) {
  // Show all universes except the current one, in canonical order
  const others = UNIVERSE_ORDER.filter((id) => id !== currentId);

  return (
    <section id="explore-more" className="explore-more" aria-labelledby="explore-more-title">
      <div className="explore-more__header">
        <p className="explore-more__eyebrow">— THE MULTIVERSE</p>
        <h2 id="explore-more-title" className="explore-more__title">
          EXPLORE MORE UNIVERSES
        </h2>
        <p className="explore-more__subtitle">
          Every side of you has a home here.
        </p>
      </div>

      <div className="uw-more-grid">
        {others.map((id) => {
          const u = UNIVERSES[id];
          return (
            <UniverseCard
              key={id}
              universe={u}
              tileId={`explore-tile-${id}`}
              ariaLabel={`Explore ${u.name} universe — ${u.tagline}`}
              isStatic
            />
          );
        })}
      </div>
    </section>
  );
}
