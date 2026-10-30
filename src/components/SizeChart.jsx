import { useState } from 'react';

export default function SizeChart() {
  const [selectedSize, setSelectedSize] = useState(null);
  const sizes = [35, 36, 37, 38, 39, 40, 41];
  const taglines = [['COMFORT', 'FOR TODAY.'], ['CONFIDENCE', 'FOR TOMORROW.'], ['JUTTIS', 'FOR EVERYWHERE.']];

  return (
    <section className="size-chart">
      {/* Base Image */}
      <img src="/size chart.png" alt="Size Chart" className="size-chart__img" />

      {/* ── DESKTOP: All absolute overlay elements ── */}
      <div className="size-chart__left size-chart--desktop">
        <p className="size-chart__label">
          <span className="size-chart__label-line"></span>
          08 / THE FIT CHECK
        </p>
        <h2 className="size-chart__heading">
          GOOD<br />SHOES<br />TAKE YOU<br />FURTHER.
        </h2>
        <p className="size-chart__body">
          Let's make sure your SYORA<br />
          fits just right — for all the places<br />
          you plan to go.
        </p>
        <a href="#find-fit" className="size-chart__cta">FIND MY FIT &nbsp;→</a>
        <p className="size-chart__footer">Same feet.<br />Bigger plans.<br />♡</p>
      </div>

      <div className="size-chart__center size-chart--desktop">
        <p>Well<br />Fitted<br />Happier<br />Adventures<br />♡</p>
      </div>

      <div className="size-chart__right-note size-chart--desktop">
        <p>What's<br />your size?</p>
      </div>

      <div className="size-chart__right-sizes size-chart--desktop">
        {sizes.map(s => (
          <button key={s} onClick={() => setSelectedSize(s)}
            className={`size-chart__size-btn ${selectedSize === s ? 'active' : ''}`}>{s}</button>
        ))}
      </div>

      <div className="size-chart__right-measure size-chart--desktop">
        <span>Not sure? We've got you.</span>
        <a href="#measure">MEASURE MY FOOT →</a>
      </div>

      <div className="size-chart__bottom size-chart--desktop">
        {taglines.map(([t, s], i) => (
          <div key={t} style={{ display: 'contents' }}>
            <div className="size-chart__bottom-item">
              <p className="size-chart__bottom-title">{t}</p>
              <p className="size-chart__bottom-desc">{s}</p>
            </div>
            {i < 2 && <div className="size-chart__bottom-sep" />}
          </div>
        ))}
      </div>

      {/* ── MOBILE: Clean stacked layout below image ── */}
      <div className="size-chart--mobile">
        <p className="size-chart__label">
          <span className="size-chart__label-line"></span>
          08 / THE FIT CHECK
        </p>
        <h2 className="size-chart__heading">
          GOOD SHOES<br />TAKE YOU<br />FURTHER.
        </h2>
        <p className="size-chart__body">
          Let's make sure your SYORA fits just right — for all the places you plan to go.
        </p>

        <p className="sc-mobile__size-label">What's your size?</p>
        <div className="sc-mobile__sizes">
          {sizes.map(s => (
            <button key={s} onClick={() => setSelectedSize(s)}
              className={`size-chart__size-btn sc-mobile__btn ${selectedSize === s ? 'active' : ''}`}>{s}</button>
          ))}
        </div>
        <p className="sc-mobile__measure">
          Not sure? We've got you. &nbsp;<a href="#measure">MEASURE MY FOOT →</a>
        </p>
        <a href="#find-fit" className="size-chart__cta">FIND MY FIT &nbsp;→</a>

        <div className="sc-mobile__taglines">
          {taglines.map(([t, s]) => (
            <div key={t} className="sc-mobile__tagline-item">
              <strong>{t}</strong>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
