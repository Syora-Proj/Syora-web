export default function Hero() {
  return (
    <section className="hero" id="hero">
      {/* Full-viewport banner image */}
      <div className="hero__bg">
        <img
          src="/syora_hero.png"
          alt="SYORA"
          className="hero__bg-img"
        />
      </div>

      <div className="hero__inner">
        {/* Top Left - Handwritten */}
        <div className="hero__script-tl">
          Your<br />Outfit<br />Called.
        </div>

        {/* Center Right (Below R and A) */}
        <div className="hero__cr-text">
          WALK YOUR WAY
        </div>

        {/* Bottom Left - Main CTA */}
        <div className="hero__bl-box">
          <h1 className="hero__bl-title">
            TRADITION<br />
            HAD A<br />
            <em>GLOW-UP.</em>
          </h1>
          <p className="hero__bl-desc">
            Handcrafted juttis for<br />
            your kind of plans.
          </p>
          <a href="#juttis" className="btn btn--dark">SHOP JUTTIS →</a>
        </div>
      </div>
    </section>
  );
}
