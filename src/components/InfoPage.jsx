import { useEffect, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { INFO_GROUPS, INFO_PAGES, SUPPORT_EMAIL, getInfoPage, infoPath } from '../data/infoPages';
import './InfoPage.css';

const slugId = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Mail({ children }) {
  return <a href={`mailto:${SUPPORT_EMAIL}`}>{children || SUPPORT_EMAIL}</a>;
}

function Para({ item }) {
  if (typeof item === 'string') return <p>{item}</p>;
  return <p>{item.before}<Mail />{item.after}</p>;
}

function Body({ page }) {
  return (
    <>
      {page.lead && <p className="info__lead">{page.lead}</p>}

      {page.steps && (
        <ol className="info-steps">
          {page.steps.map((s) => (
            <li key={s.n} className="info-step">
              <span className="info-step__n" aria-hidden="true">{s.n}</span>
              <div><h2>{s.h}</h2><p>{s.p}</p></div>
            </li>
          ))}
        </ol>
      )}

      {page.facts && (
        <ul className="info-facts">
          {page.facts.map((f) => (
            <li key={f.label} className="info-fact">
              <span className="info-fact__big">{f.big}</span>
              <span className="info-fact__small">{f.small}</span>
              <span className="info-fact__label">{f.label}</span>
            </li>
          ))}
        </ul>
      )}

      {page.sizes && (
        <>
          <div className="info-table-wrap">
            <table className="info-table">
              <caption className="sr-only">Shoe size conversion</caption>
              <thead><tr><th scope="col">EU / IND</th><th scope="col">UK</th><th scope="col">US</th><th scope="col">Foot length (cm)</th></tr></thead>
              <tbody>{page.sizes.map(([eu, uk, us, cm]) => <tr key={eu}><th scope="row">{eu}</th><td>{uk}</td><td>{us}</td><td>{cm}</td></tr>)}</tbody>
            </table>
          </div>
          <aside className="info-note">
            <h2>How to measure</h2>
            <p>{page.measure}</p>
          </aside>
        </>
      )}

      {page.faqs && page.faqs.map((g) => (
        <section key={g.group} className="info-faqgroup">
          <h2 className="info-faqgroup__title">{g.group}</h2>
          <div className="info-faqs">
            {g.items.map((f) => (
              <details key={f.q} className="info-faq">
                <summary><span>{f.q}</span><i aria-hidden="true" /></summary>
                <p>
                  {f.a}
                  {f.mail && <> <Mail>Email {SUPPORT_EMAIL}</Mail>.</>}
                  {f.link && <> <Link to={f.link.to}>{f.link.label} →</Link></>}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}

      {page.contact && (
        <div className="info-contact">
          <a className="info-contact__card" href={`mailto:${SUPPORT_EMAIL}`}>
            <span className="info-contact__label">Email</span>
            <span className="info-contact__value">{SUPPORT_EMAIL}</span>
            <span className="info-contact__cta">Write to us →</span>
          </a>
          <div className="info-contact__card info-contact__card--static">
            <span className="info-contact__label">Please include</span>
            <span className="info-contact__value">Your order number</span>
            <span className="info-contact__note">For a damaged or wrong item, add clear photos too, and write within 48 hours of delivery.</span>
          </div>
        </div>
      )}

      {page.bullets && (
        <>
          <h2 className="info__h">Our priorities</h2>
          <ul className="info-bullets">{page.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        </>
      )}
      {page.closing && <p>{page.closing}</p>}

      {page.sections && page.sections.map((s, i) => (
        <section key={s.h} id={slugId(s.h)} className="info-section">
          <h2><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{s.h}</h2>
          {s.p.map((item, k) => <Para key={k} item={item} />)}
        </section>
      ))}
    </>
  );
}

/**
 * SYORA — help & information page (Customer Service + About)
 * One template for every footer link: header band, topic menu, readable content.
 */
export default function InfoPage() {
  const { slug } = useParams();
  const page = getInfoPage(slug);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!page) return undefined;
    const prev = document.title;
    document.title = `${page.title} — SYORA`;
    return () => { document.title = prev; };
  }, [page]);

  // on phones the topic menu scrolls sideways: bring the current topic into view
  useEffect(() => {
    const menu = menuRef.current;
    const active = menu && menu.querySelector('a.is-active');
    if (menu && active && menu.scrollWidth > menu.clientWidth) {
      menu.scrollLeft = active.offsetLeft - (menu.clientWidth - active.offsetWidth) / 2;
    }
  }, [slug]);

  if (!page) return <Navigate to="/" replace />;
  const group = INFO_GROUPS.find((g) => g.id === page.group);

  return (
    <div className="info">
      <Navbar universeMode solid />

      <header className="info__hero">
        <div className="info__hero-inner">
          <nav className="info__crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link><span aria-hidden="true">/</span><span>{group.title}</span>
          </nav>
          <h1 className="info__title">{page.title}</h1>
          <p className="info__intro">{page.intro}</p>
        </div>
      </header>

      <div className="info__layout">
        <aside className="info__menu" aria-label="Help topics" ref={menuRef}>
          {INFO_GROUPS.map((g) => (
            <div key={g.id} className="info__menu-group">
              <p className="info__menu-title">{g.title}</p>
              <ul>
                {INFO_PAGES.filter((p) => p.group === g.id).map((p) => (
                  <li key={p.slug}>
                    <Link to={infoPath(p.slug)} aria-current={p.slug === page.slug ? 'page' : undefined} className={p.slug === page.slug ? 'is-active' : undefined}>{p.title}</Link>
                  </li>
                ))}
                {g.id === 'about' && <li><Link to="/#about">Our Story</Link></li>}
              </ul>
            </div>
          ))}
        </aside>

        <main id="main" className="info__main">
          {page.sections && (
            <nav className="info__toc" aria-label="On this page">
              <p>On this page</p>
              <ol>{page.sections.map((s) => <li key={s.h}><a href={`#${slugId(s.h)}`}>{s.h}</a></li>)}</ol>
            </nav>
          )}
          <article className="info__card">
            <Body page={page} />
          </article>

          {!page.contact && <aside className="info__help">
            <div>
              <h2>Still need help?</h2>
              <p>Write to us and we will get back to you.</p>
            </div>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="info__help-btn">Email {SUPPORT_EMAIL}</a>
          </aside>}
        </main>
      </div>

      <Footer />
    </div>
  );
}
