import { Link } from 'react-router-dom';
import Shell from '../components/Shell';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <Shell>
      <Seo title="Page not found" noindex path="/404" />
      <div className="sy-container sy-notfound">
        <p className="sy-label sy-muted">404</p>
        <h1 className="sy-h1">This page has <em className="sy-em">wandered off</em>.</h1>
        <p className="sy-lead sy-muted">The link may be old, or the style may no longer be available.</p>
        <div className="sy-hero__actions" style={{ justifyContent: 'center' }}>
          <Link className="sy-btn" to="/shop">Shop all</Link>
          <Link className="sy-link" to="/">Back to home</Link>
        </div>
      </div>
    </Shell>
  );
}
