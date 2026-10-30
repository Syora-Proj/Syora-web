export default function AboutUs() {
  return (
    <section className="about-us">
      {/* Base Image */}
      <img src="/about-us.jpg" alt="About Us" className="about-us__img" loading="lazy" decoding="async" />

      {/* ── DESKTOP: Left Column Text Overlay ── */}
      <div className="about-us__left about-us--desktop">
        <p className="about-us__label">
          <span className="about-us__label-line" />
          03 / OUR JOURNEY
        </p>
        <h2 className="about-us__heading">
          FROM<br />THREADS<br />TO YOUR<br />STORY ♡
        </h2>
        <p className="about-us__subtext1">A journey of many hands,<br />for your next steps.</p>
        <p className="about-us__subtext2">
          Every SYORA jutti carries a story —<br />
          of skilled artisans, thoughtful details<br />
          and a whole lot of heart.
        </p>
        <a href="#craft" className="about-us__cta">MEET THE CRAFT &nbsp;→</a>
        <p className="about-us__footer">INDIAN CRAFT.<br />GLOBAL STEPS.</p>
      </div>

      {/* ── MOBILE: Clean block below the image ── */}
      <div className="about-us--mobile">
        <p className="about-us__label">
          <span className="about-us__label-line" />
          03 / OUR JOURNEY
        </p>
        <h2 className="about-us__heading">
          FROM THREADS<br />TO YOUR STORY ♡
        </h2>
        <p className="about-us__subtext1">A journey of many hands, for your next steps.</p>
        <p className="about-us__subtext2">
          Every SYORA jutti carries a story — of skilled artisans, thoughtful details and a whole lot of heart.
        </p>
        <a href="#craft" className="about-us__cta">MEET THE CRAFT &nbsp;→</a>
        <p className="about-us__footer">INDIAN CRAFT. GLOBAL STEPS.</p>
      </div>
    </section>
  );
}
