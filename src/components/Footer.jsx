import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UNIVERSES, UNIVERSE_ORDER } from '../data/universes';
import { CATEGORIES, SOCIAL, SITE } from '../config/site';

// Shop column is derived from the single source of truth for universes.
const shopLinks = UNIVERSE_ORDER.map((id) => ({
  label: UNIVERSES[id].name.charAt(0) + UNIVERSES[id].name.slice(1).toLowerCase(),
  path: `/universe/${id}`,
}));
const serviceLinks = ['Contact Us', 'Shipping & Delivery', 'Returns & Refunds', 'Size Guide', 'FAQs'];
// 'Our Story' routes to the homepage Our Journey section. The former
// 'Craftsmanship' entry had no destination (href="#") and was removed.
const aboutLinks   = ['Sustainability', 'Privacy Policy', 'Terms & Conditions'];


export default function Footer() {
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    if (!activeService) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setActiveService(null);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeService]);

  const renderServiceContent = () => {
    switch (activeService) {
      case 'Contact Us':
        return <><p>Email: <a href="mailto:support@syora.co.in">support@syora.co.in</a></p><p>C -118, ipsa, Bajaj Nagar, khadi colony, Jaipur - 302015</p></>;
      case 'Shipping & Delivery':
        return <><p>We ship across India to serviceable PIN codes. Estimated delivery is 5–7 business days.</p><p>Cash on Delivery is available across India wherever the PIN code and courier are serviceable.</p></>;
      case 'Returns & Refunds':
        return <><p>For a size or colour exchange, contact SYORA within 48 hours of delivery. Items must be unworn and returned with their original packaging and tags. Exchanges are subject to availability.</p><p>If your order arrives damaged or you receive the wrong item, contact us within 48 hours with your order number and clear photos so we can arrange an appropriate resolution.</p><p>No change-of-mind returns are offered. This does not limit remedies required by applicable consumer law.</p></>;
      case 'Size Guide':
        return <><div className="service-modal__table-wrap"><table className="service-modal__table"><thead><tr><th>EU/IND</th><th>UK</th><th>US</th><th>CM</th></tr></thead><tbody>{[[35,2,5,'22.5'],[36,3,6,'23'],[37,4,7,'24'],[38,5,8,'24.5'],[39,6,9,'25'],[40,7,10,'25.5'],[41,8,11,'26'],[42,9,12,'26.5']].map(([eu,uk,us,cm]) => <tr key={eu}><td>{eu}</td><td>{uk}</td><td>{us}</td><td>{cm}</td></tr>)}</tbody></table></div><p><strong>Foot length:</strong> Measure from the tip of your longest toe to the back of your heel.</p></>;
      case 'FAQs':
        return <><p><strong>How long does delivery take?</strong><br />Estimated delivery is 5–7 business days to serviceable PIN codes.</p><p><strong>Can I pay by Cash on Delivery?</strong><br />COD is available where the PIN code and courier are serviceable.</p><p><strong>How do I request an exchange?</strong><br />Contact SYORA within 48 hours of delivery. Items must be unworn, with original packaging and tags.</p></>;
      case 'Terms & Conditions':
        return <>
          <p>These Terms &amp; Conditions apply when you visit the SYORA website or place an order. By using the website or placing an order, you agree to these terms.</p>
          <h3>Products and availability</h3>
          <p>We make reasonable efforts to display products, colours, sizes, and images accurately. Colours may appear differently depending on your screen. Availability may change, and quantities may be limited.</p>
          <h3>Prices and payment</h3>
          <p>Prices are shown in Indian Rupees. Applicable taxes, delivery charges, and other order charges will be shown at checkout before you place your order. Orders are subject to payment authorisation and confirmation.</p>
          <h3>Orders and cancellations</h3>
          <p>We may contact you to verify order or delivery details. If we cannot accept or fulfil an order, we will notify you and arrange any refund due for amounts already paid. To request cancellation before dispatch, email <a href="mailto:support@syora.co.in">support@syora.co.in</a> as soon as possible. Cancellation cannot be guaranteed after dispatch. This does not limit rights or remedies available under applicable law.</p>
          <h3>Delivery, returns, and exchanges</h3>
          <p>Our Shipping &amp; Delivery and Returns &amp; Refunds policies form part of these Terms &amp; Conditions.</p>
          <h3>Website use and intellectual property</h3>
          <p>Website content, including SYORA names, designs, text, images, and graphics, belongs to SYORA or its licensors. It may not be copied or used commercially without permission. You agree not to misuse the website, interfere with its operation, or submit unlawful or misleading information.</p>
          <h3>Consumer rights and liability</h3>
          <p>Nothing in these terms excludes or limits a consumer right or remedy that cannot legally be excluded or limited. To the extent permitted by law, SYORA is not responsible for indirect or unforeseeable losses arising from use of the website.</p>
          <h3>Changes and governing law</h3>
          <p>We may update these terms by publishing a revised version on the website. The version in effect when you place an order applies to that order, subject to applicable law. These terms are governed by the laws of India, and disputes will be handled by the appropriate forums under applicable law.</p>
          <h3>Contact and complaints</h3>
          <p>For order questions or complaints, email <a href="mailto:support@syora.co.in">support@syora.co.in</a> or write to C -118, ipsa, Bajaj Nagar, khadi colony, Jaipur - 302015.</p>
        </>;
      case 'Privacy Policy':
        return <>
          <p>SYORA respects your privacy. This policy explains how information may be collected, used, and shared when you visit our website, contact us, or place an order.</p>
          <h3>Information we may collect</h3>
          <p>Depending on how you use the website, this may include your name, email address, phone number, shipping address, order and transaction details, customer service correspondence, and device or website interaction information where cookies or similar technologies are enabled.</p>
          <h3>How we use information</h3>
          <p>We use information to process and deliver orders and payments, handle exchanges and eligible refunds, send order updates, respond to questions, maintain and protect the website, improve our services, and meet legal, accounting, security, and fraud-prevention obligations. We send marketing messages where permitted; you can opt out.</p>
          <h3>Shopify and service providers</h3>
          <p>SYORA uses Shopify to support its online store and checkout. Relevant information may be shared with Shopify, payment processors, delivery partners, and service providers when needed to complete an order, support the website, or meet legal obligations. Payment providers handle payment information as part of checkout.</p>
          <h3>Cookies and security</h3>
          <p>The website may use cookies or similar technologies for essential functions such as remembering a cart or supporting checkout. We use reasonable safeguards designed to protect information, but no online system can be guaranteed completely secure.</p>
          <h3>Retention and your requests</h3>
          <p>We keep information as long as needed for the purposes above, including order servicing, legal obligations, and resolving disputes. You can contact us to request access to, correction of, or deletion of personal information, withdraw consent where processing is based on consent, or ask a privacy question. Some information may need to be retained for legal, order, or accounting records.</p>
          <h3>Contact and updates</h3>
          <p>For a privacy request or question, email <a href="mailto:support@syora.co.in">support@syora.co.in</a> or write to C -118, ipsa, Bajaj Nagar, khadi colony, Jaipur - 302015. We may update this policy and will publish the current version here.</p>
        </>;
      case 'Sustainability':
        return <>
          <p>At SYORA, we believe thoughtful design includes care for the people and resources behind each product. We are working to make responsible choices across our products, packaging, and operations.</p>
          <h3>Our priorities</h3>
          <ul>
            <li>Choose durable designs and materials where product requirements and supplier availability allow.</li>
            <li>Work with suppliers to understand how products are made and improve visibility into sourcing and production.</li>
            <li>Avoid unnecessary packaging and assess lower-impact packaging options.</li>
            <li>Reduce avoidable operational waste and handle returned or damaged products responsibly.</li>
            <li>Make specific claims about materials or environmental benefits only when we have information to support them.</li>
          </ul>
          <p>Our approach will continue to develop as we learn more about our supply chain and the impact of our products. We will update this page as our practices and measurable commitments become clearer.</p>
        </>;
      default:
        return null;
    }
  };

  return (
    <footer className="sy-footer">
      <div className="sy-container">
        <div className="sy-footer__top">
          <div>
            <span className="sy-footer__logo">SYORA</span>
            <p className="sy-footer__tag">Contemporary, design-led women’s footwear.</p>
            {SOCIAL.some(({ url }) => url) && (
              <ul style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                {SOCIAL.filter(({ url }) => url).map(({ name: s, url }) => (
                  <li key={s}><a href={url} target="_blank" rel="noopener noreferrer">{s}</a></li>
                ))}
              </ul>
            )}
          </div>
          <nav aria-label="Universes">
            <h3>Universes</h3>
            <ul>{shopLinks.map((l) => <li key={l.label}><Link to={l.path}>{l.label}</Link></li>)}
              <li><Link to="/shop">Shop all</Link></li></ul>
          </nav>
          <nav aria-label="Categories">
            <h3>Categories</h3>
            <ul>{CATEGORIES.map((c) => <li key={c.id}><Link to={`/shop/${c.id}`}>{c.name}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Help">
            <h3>Help</h3>
            <ul>
              {serviceLinks.map((l) => <li key={l}><button type="button" onClick={() => setActiveService(l)}>{l}</button></li>)}
              {aboutLinks.map((l) => <li key={l}><button type="button" onClick={() => setActiveService(l)}>{l}</button></li>)}
            </ul>
          </nav>
        </div>
        <div className="sy-footer__bottom">
          <span>© {new Date().getFullYear()} SYORA. All rights reserved.</span>
          <a href={`mailto:${SITE.email}`} style={{ color: 'inherit' }}>{SITE.email}</a>
        </div>
      </div>
      {activeService && (
        <div className="service-modal__backdrop" onMouseDown={(event) => event.target === event.currentTarget && setActiveService(null)}>
          <section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
            <button type="button" className="service-modal__close" onClick={() => setActiveService(null)} aria-label="Close" autoFocus>×</button>
            <p className="service-modal__eyebrow">SYORA CUSTOMER SERVICE</p>
            <h2 id="service-modal-title">{activeService}</h2>
            <div className="service-modal__content">{renderServiceContent()}</div>
          </section>
        </div>
      )}
    </footer>
  );
}
