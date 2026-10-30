import { useEffect, useState } from 'react';

const shopLinks    = ['Juttis', 'Heels', 'Sneakers', 'Sandals', 'New Arrivals'];
const serviceLinks = ['Contact Us', 'Shipping & Delivery', 'Returns & Refunds', 'Size Guide', 'FAQs'];
const aboutLinks   = ['Our Story', 'Craftsmanship', 'Sustainability', 'Privacy Policy', 'Terms & Conditions'];

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
    <footer className="footer">
      <div className="footer__top">
        {/* Brand */}
        <div className="footer__brand">
          <span className="footer__logo">SYORA</span>
          <p className="footer__tagline">WALK YOUR WAY</p>
          <p className="footer__about">
            Premium Indian women's footwear.<br />
            Handcrafted tradition, contemporary design.
          </p>
          <div className="footer__socials">
            {['Instagram', 'Pinterest', 'Facebook'].map(s => (
              <a key={s} href="#" className="footer__social" aria-label={s}>
                {s === 'Instagram' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                )}
                {s === 'Pinterest' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.49-.25 1.04.52 1.88 1.54 1.88 1.85 0 3.09-2.36 3.09-5.16 0-2.13-1.44-3.76-4.07-3.76-2.97 0-4.82 2.22-4.82 4.7 0 .85.25 1.44.64 1.9.18.21.2.3.14.54-.05.17-.15.59-.2.75-.06.24-.25.33-.47.24-1.31-.54-1.92-1.98-1.92-3.6 0-2.67 2.25-5.87 6.71-5.87 3.58 0 5.93 2.59 5.93 5.37 0 3.67-2.03 6.41-5.02 6.41-.97 0-1.87-.52-2.18-1.13l-.6 2.39c-.22.85-.8 1.91-1.19 2.56.89.28 1.84.43 2.82.43 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
                )}
                {s === 'Facebook' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div className="footer__col">
          <h4 className="footer__col-title">SHOP</h4>
          <ul>{shopLinks.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
        </div>

        {/* Customer Service */}
        <div className="footer__col">
          <h4 className="footer__col-title">CUSTOMER SERVICE</h4>
          <ul>{serviceLinks.map(l => <li key={l}><button type="button" className="footer__service-button" onClick={() => setActiveService(l)}>{l}</button></li>)}</ul>
        </div>

        {/* About */}
        <div className="footer__col">
          <h4 className="footer__col-title">ABOUT</h4>
          <ul>{aboutLinks.map(l => <li key={l}>{['Sustainability', 'Privacy Policy', 'Terms & Conditions'].includes(l)
            ? <button type="button" className="footer__service-button" onClick={() => setActiveService(l)}>{l}</button>
            : <a href="#">{l}</a>}</li>)}</ul>
        </div>
      </div>

      {/* Payment */}
      <div className="footer__bottom">
        <p className="footer__copy">© 2025 SYORA. All rights reserved.</p>
        <div className="footer__payments">
          {['VISA', 'MC', 'UPI', 'GPAY', 'COD'].map(p => (
            <span key={p} className="payment-badge">{p}</span>
          ))}
        </div>
      </div>
      {activeService && (
        <div className="service-modal__backdrop" onMouseDown={(event) => event.target === event.currentTarget && setActiveService(null)}>
          <section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
            <button type="button" className="service-modal__close" onClick={() => setActiveService(null)} aria-label="Close">×</button>
            <p className="service-modal__eyebrow">SYORA CUSTOMER SERVICE</p>
            <h2 id="service-modal-title">{activeService}</h2>
            <div className="service-modal__content">{renderServiceContent()}</div>
          </section>
        </div>
      )}
    </footer>
  );
}
