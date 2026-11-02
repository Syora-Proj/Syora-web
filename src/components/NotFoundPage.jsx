import { Link } from 'react-router-dom';
import { UNIVERSES } from '../data/universes';
import Navbar from './Navbar';
import Footer from './Footer';
import './CartPage.css';

/** SYORA — branded "page not found" (replaces the silent redirect to the homepage). */
export default function NotFoundPage() {
  const { palette } = UNIVERSES.icon;
  return (
    <div
      className="universe-page"
      style={{ '--u-bg': palette.bg, '--u-accent': palette.accent, '--u-text': palette.text, '--u-muted': palette.muted, '--u-border': palette.border }}
    >
      <title>Page not found — SYORA</title>
      <meta name="robots" content="noindex" />
      <Navbar universeMode solid />
      <main id="main" className="cp">
        <div className="cp__inner cp__nf">
          <p className="cp__nf-code" aria-hidden="true">404</p>
          <h1 className="cp__nf-title">This page has wandered off.</h1>
          <p className="cp__nf-sub">The link may be old or mistyped. Let's get you back to something beautiful.</p>
          <div className="cp__empty-actions">
            <Link to="/shop" className="cp__btn">Shop all products</Link>
            <Link to="/" className="cp__chip">Home</Link>
            <Link to="/search" className="cp__chip">Search</Link>
            {['icon', 'heritage', 'everyday', 'motion'].map((id) => (
              <Link key={id} to={`/universe/${id}`} className="cp__chip">{UNIVERSES[id].name}</Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
