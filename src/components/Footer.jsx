import { Link } from 'react-router-dom';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';
import { INFO_PAGES, infoPath } from '../data/infoPages';
import './Footer.css';

// Shop column is derived from the single source of truth for universes.
const shopLinks = UNIVERSE_ORDER.map((id) => ({
  label: UNIVERSES[id].name.charAt(0) + UNIVERSES[id].name.slice(1).toLowerCase(),
  path: `/universe/${id}`,
}));
// Customer Service and About entries are real pages (see data/infoPages.jsx).
const serviceLinks = INFO_PAGES.filter((p) => p.group === 'service');
const aboutPages = INFO_PAGES.filter((p) => p.group === 'about');

// Real social profile URLs are not in the repository and must not be invented.
// Add the URL for each network here and its icon will appear automatically.
const SOCIAL_LINKS = [
  { name: 'Instagram', url: '' },
  { name: 'YouTube',   url: '' },
  { name: 'Pinterest', url: '' },
  { name: 'LinkedIn',  url: '' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo" aria-label="SYORA — home">SYORA</Link>
          <p className="footer__tagline">WALK YOUR WAY</p>
          <p className="footer__about">
            Premium Indian women's footwear.<br />
            Handcrafted tradition, contemporary design.
          </p>
          {SOCIAL_LINKS.some(({ url }) => url) && <div className="footer__socials">
            {SOCIAL_LINKS.filter(({ url }) => url).map(({ name: s, url }) => (
              <a key={s} href={url} className="footer__social" aria-label={s} target="_blank" rel="noopener noreferrer">
                {s === 'Instagram' && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor"/></svg>
                )}
                {s === 'YouTube' && (
                  <svg width="28" height="26" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="2" y="4" width="22" height="16" rx="5"/><path d="M10.5 8.5v7l6-3.5z" fill="currentColor"/></svg>
                )}
                {s === 'Pinterest' && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M9 21l2.6-10.2M8.2 14.2C6.6 11 8 6 12.6 6c3.2 0 4.8 2.4 4.4 5-.4 2.7-2.1 4.4-4.1 4.2-1.1-.1-1.8-.9-1.5-2"/></svg>
                )}
                {s === 'LinkedIn' && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.5 9h3.3v10.5H4.5zM6.15 4a1.9 1.9 0 110 3.8 1.9 1.9 0 010-3.8zM10 9h3.1v1.5h.05c.45-.85 1.55-1.75 3.2-1.75 3.4 0 4.05 2.2 4.05 5.1v5.65h-3.3v-5c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6v5.1H10z"/></svg>
                )}
              </a>
            ))}
          </div>}
        </div>

        {/* Link columns */}
        <div className="footer__cols">
          <div className="footer__col">
            <h3 className="footer__col-title">COLLECTIONS</h3>
            <ul>{shopLinks.map(l => <li key={l.label}><Link to={l.path}>{l.label}</Link></li>)}</ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__col-title">CUSTOMER SERVICE</h3>
            <ul>{serviceLinks.map((l) => <li key={l.slug}><Link to={infoPath(l.slug)}>{l.title}</Link></li>)}</ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__col-title">ABOUT</h3>
            <ul>
              <li><Link to="/#about">Our Story</Link></li>
              {aboutPages.map((l) => <li key={l.slug}><Link to={infoPath(l.slug)}>{l.title}</Link></li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p className="footer__copy">© {new Date().getFullYear()} SYORA. All rights reserved.</p>
        <div className="footer__payments" aria-label="Accepted payment methods">
          <span className="pay pay--visa">VISA</span>
          <span className="pay pay--mc" role="img" aria-label="Mastercard"><i /><i /></span>
          <span className="pay pay--upi">UPI</span>
          <span className="pay pay--gpay"><b>G</b> Pay</span>
          <span className="pay pay--cod">COD</span>
          <span className="footer__ssl">
            <svg width="28" height="30" viewBox="0 0 28 30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M14 2l11 4v8c0 7-4.6 11.6-11 14C7.6 25.6 3 21 3 14V6z"/><path d="M9.5 14.5l3.5 3.5 6-7"/></svg>
            <span>SSL Secure<br />Payments</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
