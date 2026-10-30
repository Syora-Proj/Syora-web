const fs = require('fs');
const path = '/Users/dhruvtomar/Desktop/syora/src/App.css';

let css = fs.readFileSync(path, 'utf8');

// I will replace `.pdp2-info {` padding logic.
css = css.replace(
  /\.pdp2-info \{\s*padding: 104px 52px 64px 52px;\s*overflow-y: auto;\s*display: flex;\s*flex-direction: column;\s*gap: 0;\s*\}/,
  `.pdp2-info {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.pdp2-info-top {
  padding: 24px 20px 16px 20px;
}
.pdp2-info-bottom {
  padding: 16px 0 24px 0;
}`
);

// I will replace the desktop media query block.
const desktopMQStart = css.indexOf('@media (min-width: 1024px) {\n  .pdp2-mobile-only { display: none !important; }');
if (desktopMQStart > -1) {
  const desktopMQEndStr = '  .pdp2-sticky-bar__info { display: flex; flex-direction: column; }\n}';
  const desktopMQEnd = css.indexOf(desktopMQEndStr, desktopMQStart) + desktopMQEndStr.length;

  const newMQ = `@media (min-width: 1024px) {
  .pdp2-mobile-only { display: none !important; }
  .pdp2-desktop-only { display: block !important; }

  .pdp2-hero {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    grid-template-areas:
      "gallery info-top"
      "gallery info-bottom";
    align-items: start;
  }
  .pdp2-gallery {
    grid-area: gallery;
    height: 100vh;
    position: sticky;
    top: 0;
  }
  .pdp2-info-top {
    grid-area: info-top;
    padding: 100px 5% 0 5%;
  }
  .pdp2-info-bottom {
    grid-area: info-bottom;
    padding: 0 5% 64px 5%;
  }

  .pdp2-gallery__thumbs {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
  }
  .pdp2-gallery__thumb { width: 50px; height: 50px; border: 1px solid transparent; background: #fff; cursor: pointer; }
  .pdp2-gallery__thumb--active { border-color: #000; }
  .pdp2-gallery__thumb img { width: 100%; height: 100%; object-fit: contain; }

  .pdp2-related__grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .pdp2-related-card__overlay { display: block; }

  .pdp2-sticky-bar__info { display: flex; flex-direction: column; }
}`;

  css = css.substring(0, desktopMQStart) + newMQ + css.substring(desktopMQEnd);
}

fs.writeFileSync(path, css, 'utf8');
console.log('Successfully patched desktop MQ and info padding');
