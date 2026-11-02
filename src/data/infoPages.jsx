/**
 * SYORA — help & information pages
 *
 * One entry per page reachable from the footer (Customer Service + About).
 * The wording comes from the policies that were previously shown in the footer pop-ups:
 * only the presentation changed. Edit the text here.
 */
export const SUPPORT_EMAIL = 'support@syora.co.in';

export const INFO_GROUPS = [
  { id: 'service', title: 'Customer Service' },
  { id: 'about', title: 'About' },
];

const SIZES = [[35, 2, 5, '22.5'], [36, 3, 6, '23'], [37, 4, 7, '24'], [38, 5, 8, '24.5'], [39, 6, 9, '25'], [40, 7, 10, '25.5'], [41, 8, 11, '26'], [42, 9, 12, '26.5']];

export const INFO_PAGES = [
  {
    slug: 'exchanges', group: 'service', title: 'Exchanges',
    intro: 'Size or colour exchanges within 48 hours of delivery, and quick help if something arrives wrong.',
    steps: [
      { n: '01', h: 'Size or colour exchange', p: 'Contact SYORA within 48 hours of delivery. Items must be unworn and sent back with their original packaging and tags. Exchanges are subject to availability.' },
      { n: '02', h: 'Damaged or wrong item', p: 'If your order arrives damaged or you receive the wrong item, contact us within 48 hours with your order number and clear photos so we can arrange an appropriate resolution.' },
      { n: '03', h: 'Exchanges only', p: 'SYORA offers exchanges only. Change-of-mind returns are not offered. This does not limit remedies required by applicable consumer law.' },
    ],
  },
  {
    slug: 'shipping-delivery', group: 'service', title: 'Shipping & Delivery',
    intro: 'We ship across India to serviceable PIN codes.',
    facts: [
      { big: '3–7', small: 'business days', label: 'Estimated delivery' },
      { big: 'India', small: 'wide', label: 'Serviceable PIN codes' },
      { big: 'COD', small: 'available', label: 'Where the PIN code and courier are serviceable' },
    ],
  },
  {
    slug: 'size-guide', group: 'service', title: 'Size Guide',
    intro: 'Find your fit from your foot length.',
    sizes: SIZES,
    measure: 'Measure from the tip of your longest toe to the back of your heel.',
  },
  {
    slug: 'faqs', group: 'service', title: 'FAQs',
    intro: 'Quick answers about delivery, payment and exchanges.',
    faqs: [
      { group: 'Delivery & payment', items: [
        { q: 'How long does delivery take?', a: 'Estimated delivery is 3–7 business days to serviceable PIN codes.' },
        { q: 'Do you deliver across India?', a: 'We ship across India to serviceable PIN codes.' },
        { q: 'Can I pay by Cash on Delivery?', a: 'COD is available where the PIN code and courier are serviceable.' },
        { q: 'Can I cancel my order?', a: 'To request cancellation before dispatch, email us as soon as possible. Cancellation cannot be guaranteed after dispatch.', mail: true },
      ] },
      { group: 'Exchanges', items: [
        { q: 'How do I request an exchange?', a: 'Contact SYORA within 48 hours of delivery. Items must be unworn, with original packaging and tags. Exchanges are subject to availability.', link: { to: '/info/exchanges', label: 'Read the exchange policy' } },
        { q: 'Do you accept returns?', a: 'SYORA offers exchanges only, and change-of-mind returns are not offered. This does not limit remedies required by applicable consumer law.' },
        { q: 'What if my order arrives damaged or I receive the wrong item?', a: 'Contact us within 48 hours with your order number and clear photos, and we will arrange an appropriate resolution.', mail: true },
      ] },
      { group: 'Sizes & products', items: [
        { q: 'How do I find my size?', a: 'Measure from the tip of your longest toe to the back of your heel, then match your foot length in the size guide.', link: { to: '/info/size-guide', label: 'Open the size guide' } },
        { q: 'Will the colour match the photos?', a: 'We make reasonable efforts to show colours and images accurately, but colours may appear differently depending on your screen.' },
        { q: 'Is every size always available?', a: 'Availability may change and quantities may be limited.' },
      ] },
      { group: 'Help', items: [
        { q: 'How can I contact SYORA?', a: 'Email us with your question and, if it is about an order, your order number.', mail: true },
      ] },
    ],
  },
  {
    slug: 'payments', group: 'service', title: 'Payments',
    intro: 'Cards, UPI and Cash on Delivery, paid securely at checkout.',
    facts: [
      { big: 'Cards', small: '& UPI', label: 'Paid on our secure checkout' },
      { big: 'COD', small: 'available', label: 'Where the PIN code and courier are serviceable' },
      { big: '₹', small: 'INR', label: 'Prices in Indian Rupees, taxes shown at checkout' },
    ],
    sections: [
      { h: 'Ways to pay', p: ['You can pay by card or UPI at checkout. Cash on Delivery is available where the PIN code and courier are serviceable. The payment options offered for your order are shown at checkout before you place it.'] },
      { h: 'Secure checkout', p: ['When you choose Checkout, you continue to our secure checkout, powered by Shopify. Card and UPI details are entered there and handled by the payment provider; SYORA does not collect them on this website.'] },
      { h: 'Prices, taxes and delivery charges', p: ['Prices are shown in Indian Rupees. Applicable taxes and any delivery charges are shown at checkout before you place your order, so you always see the final amount first.'] },
      { h: 'If a payment does not go through', p: ['You can go back to your bag and try again, or choose another available payment option. If an amount was deducted but you did not receive an order confirmation, write to us with your order number or payment details and we will help.'] },
      { h: 'Exchanges and refunds', p: ['SYORA offers exchanges only; change-of-mind returns are not offered. If your order arrives damaged or you receive the wrong item, contact us within 48 hours. See Exchanges for the full steps.'] },
    ],
  },
  {
    slug: 'contact-us', group: 'service', title: 'Contact Us',
    intro: 'Questions about an order, a size or anything else — we are happy to help.',
    contact: true,
  },
  {
    slug: 'sustainability', group: 'about', title: 'Sustainability',
    intro: 'Thoughtful design includes care for the people and resources behind each product.',
    lead: 'We are working to make responsible choices across our products, packaging, and operations.',
    bullets: [
      'Choose durable designs and materials where product requirements and supplier availability allow.',
      'Work with suppliers to understand how products are made and improve visibility into sourcing and production.',
      'Avoid unnecessary packaging and assess lower-impact packaging options.',
      'Reduce avoidable operational waste and handle exchanged or damaged products responsibly.',
      'Make specific claims about materials or environmental benefits only when we have information to support them.',
    ],
    closing: 'Our approach will continue to develop as we learn more about our supply chain and the impact of our products. We will update this page as our practices and measurable commitments become clearer.',
  },
  {
    slug: 'terms-conditions', group: 'about', title: 'Terms & Conditions',
    intro: 'The terms that apply when you visit the SYORA website or place an order.',
    lead: 'These Terms & Conditions apply when you visit the SYORA website or place an order. By using the website or placing an order, you agree to these terms.',
    sections: [
      { h: 'Products and availability', p: ['We make reasonable efforts to display products, colours, sizes, and images accurately. Colours may appear differently depending on your screen. Availability may change, and quantities may be limited.'] },
      { h: 'Prices and payment', p: ['Prices are shown in Indian Rupees. Applicable taxes, delivery charges, and other order charges will be shown at checkout before you place your order. Orders are subject to payment authorisation and confirmation.'] },
      { h: 'Orders and cancellations', p: [{ mail: true, before: 'We may contact you to verify order or delivery details. If we cannot accept or fulfil an order, we will notify you and arrange any refund due for amounts already paid. To request cancellation before dispatch, email ', after: ' as soon as possible. Cancellation cannot be guaranteed after dispatch. This does not limit rights or remedies available under applicable law.' }] },
      { h: 'Delivery and exchanges', p: ['Our Shipping & Delivery and Exchanges policies form part of these Terms & Conditions.'] },
      { h: 'Website use and intellectual property', p: ['Website content, including SYORA names, designs, text, images, and graphics, belongs to SYORA or its licensors. It may not be copied or used commercially without permission. You agree not to misuse the website, interfere with its operation, or submit unlawful or misleading information.'] },
      { h: 'Consumer rights and liability', p: ['Nothing in these terms excludes or limits a consumer right or remedy that cannot legally be excluded or limited. To the extent permitted by law, SYORA is not responsible for indirect or unforeseeable losses arising from use of the website.'] },
      { h: 'Changes and governing law', p: ['We may update these terms by publishing a revised version on the website. The version in effect when you place an order applies to that order, subject to applicable law. These terms are governed by the laws of India, and disputes will be handled by the appropriate forums under applicable law.'] },
      { h: 'Contact and complaints', p: [{ mail: true, before: 'For order questions or complaints, email ', after: '.' }] },
    ],
  },
  {
    slug: 'privacy-policy', group: 'about', title: 'Privacy Policy',
    intro: 'How information may be collected, used, and shared when you visit or order from SYORA.',
    lead: 'SYORA respects your privacy. This policy explains how information may be collected, used, and shared when you visit our website, contact us, or place an order.',
    sections: [
      { h: 'Information we may collect', p: ['Depending on how you use the website, this may include your name, email address, phone number, shipping address, order and transaction details, customer service correspondence, and device or website interaction information where cookies or similar technologies are enabled.'] },
      { h: 'How we use information', p: ['We use information to process and deliver orders and payments, handle exchanges and order cancellations, send order updates, respond to questions, maintain and protect the website, improve our services, and meet legal, accounting, security, and fraud-prevention obligations. We send marketing messages where permitted; you can opt out.'] },
      { h: 'Shopify and service providers', p: ['SYORA uses Shopify to support its online store and checkout. Relevant information may be shared with Shopify, payment processors, delivery partners, and service providers when needed to complete an order, support the website, or meet legal obligations. Payment providers handle payment information as part of checkout.'] },
      { h: 'Cookies and security', p: ['The website may use cookies or similar technologies for essential functions such as remembering a cart or supporting checkout. We use reasonable safeguards designed to protect information, but no online system can be guaranteed completely secure.'] },
      { h: 'Retention and your requests', p: ['We keep information as long as needed for the purposes above, including order servicing, legal obligations, and resolving disputes. You can contact us to request access to, correction of, or deletion of personal information, withdraw consent where processing is based on consent, or ask a privacy question. Some information may need to be retained for legal, order, or accounting records.'] },
      { h: 'Contact and updates', p: [{ mail: true, before: 'For a privacy request or question, email ', after: '. We may update this policy and will publish the current version here.' }] },
    ],
  },
];

export const getInfoPage = (slug) => INFO_PAGES.find((p) => p.slug === slug);
export const infoPath = (slug) => `/info/${slug}`;
