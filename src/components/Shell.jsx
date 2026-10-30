import Header from './Header';
import Footer from './Footer';

/** Every page: skip link, header (with bag), main landmark, footer. */
export default function Shell({ over = false, universe, children }) {
  return (
    <div data-universe={universe}>
      <a className="sy-skip" href="#main">Skip to content</a>
      <Header over={over} />
      <main id="main" className={`sy-main${over ? '' : ' sy-main--pad'}`}>{children}</main>
      <Footer />
    </div>
  );
}
