import secondaryHero from '../assets/secondary_hero.png';

export default function SecondaryHero() {
  return (
    <section className="sec-hero" id="collections">
      <div className="sec-hero__copy">
        <p className="sec-hero__season">NEW SEASON</p>
        <h2 className="sec-hero__headline">
          NEW<br />VIBES
        </h2>
        <p className="sec-hero__desc">
          Step into styles<br />that take you further.
        </p>
        <a href="#juttis" className="btn btn--filled">EXPLORE COLLECTION →</a>
      </div>
      <div className="sec-hero__img-wrap">
        <img src={secondaryHero} alt="SYORA New Vibes collection — model with juttis" className="sec-hero__img" />
        <div className="sec-hero__leaf" aria-hidden="true" />
      </div>
    </section>
  );
}
