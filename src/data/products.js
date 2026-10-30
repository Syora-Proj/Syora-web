/**
 * SYORA — Product Data (v2 — PDP spec compliant)
 * All fields needed for the new PDP to build itself.
 * Images are pulled from /public or imported assets.
 */

import juttiSig from '../assets/jutti_signature.png';
import juttiEmb from '../assets/jutti_embroidered.png';
import juttiEvy from '../assets/jutti_everyday.png';
import heelsImg from '../assets/heels_strappy.png';
import productHeel from '../assets/product_heel_1.png';
import productHero from '../assets/product_hero.png';

export const PRODUCTS = {

  /* ── ICON Universe ── */
  'icon-1': {
    id: 'icon-1',
    universeId: 'icon',
    universeName: 'THE ICON EDIT',
    name: 'Rosalie Kitten Heels',
    category: 'Heels',
    subCategory: 'Kitten Heels',
    price: 1299,
    originalPrice: 2599,
    discountPercent: 50,
    rating: 4.8,
    reviewCount: 226,
    isBestseller: true,
    badge: 'BESTSELLER',

    /* Offer */
    offerBanner: 'Buy 2, get an extra 10% off',

    /* Colours */
    colours: [
      { name: 'Nude', hex: '#D4A882' },
      { name: 'Black', hex: '#1a1a1a' },
    ],

    /* Sizes — EU */
    sizes: [36, 37, 38, 39, 40],
    stockPerSize: { 36: 4, 37: 8, 38: 12, 39: 5, 40: 2 },

    /* Construction */
    material: 'Premium faux leather upper',
    heelHeight: '2.5 inches',
    closureType: 'Slip-on with ankle strap',
    soleType: 'Anti-slip rubber',

    /* Comfort profile */
    comfortProfile: {
      cushioning: 'Medium',
      stability: 'High',
      bestForHours: '4–6 hours',
    },

    /* Fit */
    fitNote: 'Runs true to size',

    /* Hook + benefits */
    oneLineHook: 'The heel that goes everywhere — office, dinner, weekend.',
    benefits: [
      { icon: '✦', text: 'Cushioned footbed for all-day comfort' },
      { icon: '◎', text: 'Kitten heel that never wobbles' },
      { icon: '♡', text: 'Goes with jeans, sarees, and everything between' },
      { icon: '★', text: 'Premium faux-leather that ages beautifully' },
    ],
    bestForOccasion: 'Office, evening dinners, festive events',
    stylingNote: 'Pair with high-waisted trousers or a midi dress for an effortless elevated look.',

    /* Media */
    images: [heelsImg, productHeel, heelsImg, productHeel, heelsImg],
    videos: [],
    detailImages: [heelsImg, productHeel, heelsImg],

    /* Reviews */
    reviews: [
      {
        id: 'r1', author: 'Priya M.', rating: 5, date: '2026-09-15',
        text: 'Wore these to a wedding and got so many compliments. Super comfortable even after 5 hours!',
        fitFeedback: 'True to size',
        verified: true,
      },
      {
        id: 'r2', author: 'Anjali S.', rating: 5, date: '2026-08-30',
        text: 'The nude colour is exactly as shown. These are my everyday office heels now.',
        fitFeedback: 'True to size',
        verified: true,
      },
      {
        id: 'r3', author: 'Meena R.', rating: 4, date: '2026-08-10',
        text: 'Beautiful quality. Slightly narrow at the toe but breaks in well after 2 wears.',
        fitFeedback: 'Runs slightly narrow',
        verified: true,
      },
    ],
    customerPhotos: [],

    /* Delivery / returns */
    deliveryDaysEstimate: '3–5 business days',
    returnWindowDays: 7,
    exchangeWindowDays: 15,
    codAvailable: true,

    /* FAQ */
    productSpecificQuestions: [
      { q: 'Can I wear these on uneven surfaces like cobblestones?', a: 'Yes — the wide kitten heel base gives good stability even on uneven ground.' },
      { q: 'Does the ankle strap adjust?', a: 'The strap has a 3-position buckle for a secure custom fit.' },
      { q: 'How do I clean these?', a: 'Wipe gently with a dry or lightly damp cloth. Avoid submerging in water.' },
    ],

    /* Related */
    relatedProducts: ['icon-2', 'her-1', 'evr-1'],

    /* Accordion (kept for editorial sections) */
    accordion: [
      { title: 'MATERIALS & CARE', content: 'Upper: Premium faux leather. Sole: Anti-slip rubber. Footbed: Memory foam cushion. Wipe gently with a dry cloth. Avoid prolonged exposure to moisture.' },
      { title: 'SHIPPING & RETURNS', content: 'Free shipping on orders above ₹999. 7-day exchange on size issues, no questions asked. Full policy linked below.' },
      { title: 'FIT & SIZE', content: 'True to size. We recommend ordering your regular EU size. Refer to the size guide for foot-length measurements.' },
    ],

    /* Complete the look */
    completeTheLook: [
      { img: productHero, label: 'Silk Drape Top', price: '₹2,100' },
      { img: juttiEvy,   label: 'Embroidered Clutch', price: '₹1,800' },
      { img: juttiSig,   label: 'Gold Drop Earrings', price: '₹1,200' },
      { img: juttiEmb,   label: 'Organza Dupatta', price: '₹1,500' },
    ],

    /* SEO */
    pageTitle: 'Rosalie Kitten Heels — SYORA',
    pageDescription: 'Shop the Rosalie Kitten Heels — cushioned, elegant 2.5" kitten heels available in Nude and Black. True to size. COD available.',

    /* Editorial */
    editorialTagline: 'DIFFERENT WORLDS.\nSAME YOU.',
    editorialBg: '/hero-icon.jpg',
  },

  'icon-2': {
    id: 'icon-2',
    universeId: 'icon',
    universeName: 'THE ICON EDIT',
    name: 'Vienna Block Heels',
    category: 'Heels',
    subCategory: 'Block Heels',
    price: 1499,
    originalPrice: 2999,
    discountPercent: 50,
    rating: 4.6,
    reviewCount: 142,
    isBestseller: false,
    badge: null,
    offerBanner: 'Buy 2, get an extra 10% off',
    colours: [
      { name: 'Cognac', hex: '#8b4513' },
      { name: 'Ivory', hex: '#f5ece4' },
      { name: 'Noir', hex: '#1a1a1a' },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    stockPerSize: { 36: 6, 37: 10, 38: 14, 39: 8, 40: 4, 41: 2 },
    material: 'Hand-buffed faux calfskin',
    heelHeight: '3 inches',
    closureType: 'Back zip',
    soleType: 'Anti-slip rubber',
    comfortProfile: {
      cushioning: 'High',
      stability: 'Very high',
      bestForHours: '6–8 hours',
    },
    fitNote: 'True to size',
    oneLineHook: 'The foundation heel — wide base, all-day stability, zero compromise.',
    benefits: [
      { icon: '✦', text: 'Wide block base — no wobble, ever' },
      { icon: '◎', text: 'Deep foam cushion for 8-hour wear' },
      { icon: '♡', text: 'Pairs perfectly with every office outfit' },
      { icon: '★', text: 'Hand-buffed finish that improves with time' },
    ],
    bestForOccasion: 'Office, long events, travel',
    stylingNote: 'Try with tailored trousers for a boardroom-ready look or a flowing midi skirt for evenings.',
    images: [productHeel, heelsImg, productHeel, heelsImg, productHeel],
    videos: [],
    detailImages: [productHeel, heelsImg, productHeel],
    reviews: [
      {
        id: 'r1', author: 'Ritu K.', rating: 5, date: '2026-09-02',
        text: 'Wore these for a 9-hour conference day. My feet were totally fine. Cannot believe it.',
        fitFeedback: 'True to size',
        verified: true,
      },
      {
        id: 'r2', author: 'Shreya P.', rating: 4, date: '2026-08-18',
        text: 'The cognac is a beautiful warm brown. Slightly heavier than expected but extremely sturdy.',
        fitFeedback: 'True to size',
        verified: true,
      },
    ],
    customerPhotos: [],
    deliveryDaysEstimate: '3–5 business days',
    returnWindowDays: 7,
    exchangeWindowDays: 15,
    codAvailable: true,
    productSpecificQuestions: [
      { q: 'Is the zip easy to operate?', a: 'Yes — the back zip runs smoothly and has a fabric tab for easy grip.' },
      { q: 'Are these suitable for wide feet?', a: 'The wide block base accommodates most foot widths comfortably.' },
    ],
    relatedProducts: ['icon-1', 'her-1', 'evr-1'],
    accordion: [
      { title: 'MATERIALS & CARE', content: 'Upper: Hand-buffed faux calfskin. Sole: Anti-slip rubber. Wipe clean with a damp cloth.' },
      { title: 'SHIPPING & RETURNS', content: 'Free shipping on orders above ₹999. 7-day exchange on size issues.' },
      { title: 'FIT & SIZE', content: 'True to size. Refer to our size guide for precise EU measurements.' },
    ],
    completeTheLook: [
      { img: productHero, label: 'Tailored Blazer', price: '₹3,500' },
      { img: juttiEvy,    label: 'Structured Tote', price: '₹2,200' },
      { img: juttiSig,    label: 'Gold Hoops', price: '₹900' },
      { img: juttiEmb,    label: 'Silk Scarf', price: '₹1,200' },
    ],
    pageTitle: 'Vienna Block Heels — SYORA',
    pageDescription: 'Shop the Vienna Block Heels — wide-base 3" block heels in Cognac, Ivory & Noir. True to size. COD available.',
    editorialTagline: 'DIFFERENT WORLDS.\nSAME YOU.',
    editorialBg: '/hero-icon.jpg',
  },

  /* ── HERITAGE Universe ── */
  'her-1': {
    id: 'her-1',
    universeId: 'heritage',
    universeName: 'THE HERITAGE EDIT',
    name: 'Rangrez Juttis',
    category: 'Juttis',
    subCategory: 'Embroidered Juttis',
    price: 1499,
    originalPrice: 3490,
    discountPercent: 57,
    rating: 4.8,
    reviewCount: 226,
    isBestseller: true,
    badge: 'BESTSELLER',
    offerBanner: 'Buy 2, get an extra 10% off',
    colours: [
      { name: 'Maroon', hex: '#800020' },
      { name: 'Bottle Green', hex: '#1f4f2e' },
      { name: 'Ivory', hex: '#f5ede0' },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    stockPerSize: { 36: 3, 37: 7, 38: 11, 39: 6, 40: 3, 41: 1 },
    material: 'Hand-embroidered velvet with resham & zardozi work',
    heelHeight: 'Flat',
    closureType: 'Slip-on',
    soleType: 'Cushioned jute with leather lining',
    comfortProfile: {
      cushioning: 'Medium',
      stability: 'High',
      bestForHours: '4–6 hours',
    },
    fitNote: 'Runs slightly narrow — we recommend sizing up if you have a wider foot',
    oneLineHook: 'Hand-embroidered artisan juttis that carry centuries of craft.',
    benefits: [
      { icon: '✦', text: 'Each pair is hand-embroidered by artisans in Rajasthan' },
      { icon: '◎', text: 'Cushioned jute sole — light yet supportive' },
      { icon: '♡', text: 'Perfect with anarkalis, lehengas, or casual kurtas' },
      { icon: '★', text: 'Resham & zardozi work that catches the light beautifully' },
    ],
    bestForOccasion: 'Festive events, weddings, ethnic occasions',
    stylingNote: 'The Maroon pairs beautifully with ivory or gold outfits. Bottle Green works with deep pink and purple.',
    images: [juttiSig, juttiEmb, juttiEvy, juttiSig, juttiEmb],
    videos: [],
    detailImages: [juttiEmb, juttiSig, juttiEvy],
    reviews: [
      {
        id: 'r1', author: 'Divya N.', rating: 5, date: '2026-09-20',
        text: 'Wore to my cousin\'s wedding. So many people asked where I got them! The craftsmanship is stunning.',
        fitFeedback: 'Sized up, fits perfectly',
        verified: true,
      },
      {
        id: 'r2', author: 'Kavya T.', rating: 5, date: '2026-09-01',
        text: 'True artisan quality. The embroidery is intricate and everything is neat — no loose threads.',
        fitFeedback: 'True to size',
        verified: true,
      },
      {
        id: 'r3', author: 'Sunita R.', rating: 4, date: '2026-08-15',
        text: 'Gorgeous pair! Slightly tight initially, but perfectly comfortable after 2–3 wears.',
        fitFeedback: 'Recommend sizing up',
        verified: true,
      },
    ],
    customerPhotos: [],
    deliveryDaysEstimate: '3–5 business days',
    returnWindowDays: 7,
    exchangeWindowDays: 15,
    codAvailable: true,
    productSpecificQuestions: [
      { q: 'Will the embroidery fade after washing?', a: 'Spot clean only with a damp cloth. The zardozi work is best kept away from water.' },
      { q: 'Can I wear these on outdoor venues like farmhouses?', a: 'Yes — the leather-lined jute sole handles outdoor use well. Avoid heavy rain.' },
      { q: 'Are these vegan?', a: 'The upper is velvet (vegan). The inner sole uses a leather-like lining. Please check our materials page for full details.' },
    ],
    relatedProducts: ['her-2', 'her-3', 'icon-1'],
    accordion: [
      { title: 'MATERIALS & CARE', content: 'Upper: Hand-embroidered velvet with resham & zardozi work. Sole: Cushioned jute. Inner: Leather lining. Spot clean only. Store in dust bag.' },
      { title: 'SHIPPING & RETURNS', content: 'Free shipping on orders above ₹999. 7-day exchange on size issues, no questions asked.' },
      { title: 'FIT & SIZE', content: 'Runs slightly narrow. We recommend sizing up if you have a wider foot. Refer to our size guide.' },
    ],
    completeTheLook: [
      { img: productHero, label: 'Anarkali Suit', price: '₹4,500' },
      { img: juttiEvy,   label: 'Potli Bag', price: '₹1,800' },
      { img: productHeel, label: 'Kundan Earrings', price: '₹1,500' },
      { img: juttiEmb,   label: 'Banarasi Dupatta', price: '₹2,200' },
    ],
    pageTitle: 'Rangrez Juttis — SYORA Heritage',
    pageDescription: 'Shop the Rangrez hand-embroidered juttis — resham & zardozi work on velvet. Perfect for weddings & festivals. COD available.',
    editorialTagline: 'DIFFERENT WORLDS.\nSAME YOU.',
    editorialBg: '/hero-heritage.jpg',
  },

  'her-2': {
    id: 'her-2',
    universeId: 'heritage',
    universeName: 'THE HERITAGE EDIT',
    name: 'Basant Embroidered Juttis',
    category: 'Juttis',
    subCategory: 'Embroidered Juttis',
    price: 1299,
    originalPrice: 2799,
    discountPercent: 54,
    rating: 4.7,
    reviewCount: 178,
    isBestseller: false,
    badge: 'NEW',
    offerBanner: 'Buy 2, get an extra 10% off',
    colours: [
      { name: 'Rose Gold', hex: '#b76e79' },
      { name: 'Peacock', hex: '#1a3f4a' },
      { name: 'Saffron', hex: '#c8701a' },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    stockPerSize: { 36: 5, 37: 9, 38: 13, 39: 7, 40: 3, 41: 1 },
    material: 'Hand-embroidered silk with metallic threadwork',
    heelHeight: 'Flat',
    closureType: 'Slip-on',
    soleType: 'Padded suede',
    comfortProfile: {
      cushioning: 'Medium-high',
      stability: 'High',
      bestForHours: '5–7 hours',
    },
    fitNote: 'True to size',
    oneLineHook: 'Floral silk embroidery that blooms with every step.',
    benefits: [
      { icon: '✦', text: 'Delicate floral motifs hand-embroidered on pure silk' },
      { icon: '◎', text: 'Padded suede sole for all-day comfort' },
      { icon: '♡', text: 'Light enough for a full wedding day' },
      { icon: '★', text: 'Three wedding-perfect colour options' },
    ],
    bestForOccasion: 'Weddings, mehendi, sangeet, festive occasions',
    stylingNote: 'Saffron pairs beautifully with green and gold outfits. Rose Gold works with ivory, blush, and champagne.',
    images: [juttiEmb, juttiSig, juttiEvy, juttiEmb, juttiSig],
    videos: [],
    detailImages: [juttiEmb, juttiSig, juttiEvy],
    reviews: [
      {
        id: 'r1', author: 'Aisha K.', rating: 5, date: '2026-09-10',
        text: 'Wore these to a sangeet and danced for 3 hours. Still felt comfortable. Lovely quality.',
        fitFeedback: 'True to size',
        verified: true,
      },
    ],
    customerPhotos: [],
    deliveryDaysEstimate: '3–5 business days',
    returnWindowDays: 7,
    exchangeWindowDays: 15,
    codAvailable: true,
    productSpecificQuestions: [
      { q: 'Is the silk lining durable?', a: 'The silk is tightly woven and handles regular wear well. We recommend spot cleaning only.' },
      { q: 'Do these work for mehendi and sangeet events?', a: 'Absolutely — these are designed for long festive events with full dance-friendly comfort.' },
    ],
    relatedProducts: ['her-1', 'her-3', 'icon-1'],
    accordion: [
      { title: 'MATERIALS & CARE', content: 'Upper: Hand-embroidered silk with metallic threadwork. Sole: Padded suede. Store in dust bag.' },
      { title: 'SHIPPING & RETURNS', content: 'Free shipping on orders above ₹999. 7-day exchange on size issues.' },
      { title: 'FIT & SIZE', content: 'True to size. Refer to our size guide for precise measurements.' },
    ],
    completeTheLook: [
      { img: productHero, label: 'Silk Lehenga', price: '₹6,500' },
      { img: juttiEvy,   label: 'Embroidered Clutch', price: '₹1,800' },
      { img: productHeel, label: 'Polki Earrings', price: '₹2,200' },
      { img: juttiSig,   label: 'Net Dupatta', price: '₹1,500' },
    ],
    pageTitle: 'Basant Embroidered Juttis — SYORA Heritage',
    pageDescription: 'Shop the Basant hand-embroidered silk juttis — metallic threadwork, padded sole. Perfect for weddings & sangeet. COD available.',
    editorialTagline: 'DIFFERENT WORLDS.\nSAME YOU.',
    editorialBg: '/hero-heritage.jpg',
  },

  'her-3': {
    id: 'her-3',
    universeId: 'heritage',
    universeName: 'THE HERITAGE EDIT',
    name: 'Mitti Everyday Juttis',
    category: 'Juttis',
    subCategory: 'Everyday Juttis',
    price: 999,
    originalPrice: 2299,
    discountPercent: 57,
    rating: 4.5,
    reviewCount: 312,
    isBestseller: false,
    badge: null,
    offerBanner: 'Buy 2, get an extra 10% off',
    colours: [
      { name: 'Earthy Brown', hex: '#6b3d1e' },
      { name: 'Off-White', hex: '#f0e8d8' },
      { name: 'Navy', hex: '#1a2040' },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    stockPerSize: { 36: 8, 37: 12, 38: 15, 39: 10, 40: 6, 41: 3 },
    material: 'Block-printed cotton upper',
    heelHeight: 'Flat',
    closureType: 'Slip-on',
    soleType: 'Cushioned leather sole',
    comfortProfile: {
      cushioning: 'High',
      stability: 'Very high',
      bestForHours: '8+ hours',
    },
    fitNote: 'True to size',
    oneLineHook: 'The jutti you\'ll wear every single day — and never want to take off.',
    benefits: [
      { icon: '✦', text: 'Block-printed cotton — breathable and light' },
      { icon: '◎', text: 'Thick cushioned sole for 8+ hour comfort' },
      { icon: '♡', text: 'Works with kurtas, jeans, or casual dresses' },
      { icon: '★', text: 'Neutral colours that match everything in your wardrobe' },
    ],
    bestForOccasion: 'Daily wear, casual outings, travel',
    stylingNote: 'The Earthy Brown pairs with everything. Navy is great for kurta sets. Off-White elevates casual outfits instantly.',
    images: [juttiEvy, juttiSig, juttiEmb, juttiEvy, juttiSig],
    videos: [],
    detailImages: [juttiEvy, juttiEmb, juttiSig],
    reviews: [
      {
        id: 'r1', author: 'Pooja L.', rating: 5, date: '2026-09-25',
        text: 'My go-to everyday shoes! I\'ve worn these 40+ times and they still look great.',
        fitFeedback: 'True to size',
        verified: true,
      },
      {
        id: 'r2', author: 'Nandini S.', rating: 4, date: '2026-09-05',
        text: 'Very comfortable. The block print is subtle and pretty. Great value.',
        fitFeedback: 'True to size',
        verified: true,
      },
    ],
    customerPhotos: [],
    deliveryDaysEstimate: '3–5 business days',
    returnWindowDays: 7,
    exchangeWindowDays: 15,
    codAvailable: true,
    productSpecificQuestions: [
      { q: 'Are these washable?', a: 'Wipe clean with a dry cloth. The cotton upper can handle light spot cleaning.' },
      { q: 'Are they good for long walks?', a: 'Yes — the thick cushioned sole is specifically designed for long-wear comfort.' },
    ],
    relatedProducts: ['her-1', 'her-2', 'evr-1'],
    accordion: [
      { title: 'MATERIALS & CARE', content: 'Upper: Block-printed cotton. Sole: Cushioned leather. Wipe clean with a dry cloth.' },
      { title: 'SHIPPING & RETURNS', content: 'Free shipping on orders above ₹999. 7-day exchange on size issues.' },
      { title: 'FIT & SIZE', content: 'True to size. Refer to our size guide.' },
    ],
    completeTheLook: [
      { img: productHero, label: 'Kurta Set', price: '₹2,200' },
      { img: juttiEmb,   label: 'Jute Tote', price: '₹900' },
      { img: productHeel, label: 'Silver Jhumkas', price: '₹800' },
      { img: juttiSig,   label: 'Block Print Dupatta', price: '₹1,100' },
    ],
    pageTitle: 'Mitti Everyday Juttis — SYORA Heritage',
    pageDescription: 'Shop the Mitti block-printed cotton juttis — thick cushioned sole, 8+ hour comfort. Daily wear craftsmanship. COD available.',
    editorialTagline: 'DIFFERENT WORLDS.\nSAME YOU.',
    editorialBg: '/hero-heritage.jpg',
  },

  /* ── EVERYDAY Universe ── */
  'evr-1': {
    id: 'evr-1',
    universeId: 'everyday',
    universeName: 'THE EVERYDAY EDIT',
    name: 'Luna Everyday Flats',
    category: 'Flats',
    subCategory: 'Jutti Flats',
    price: 999,
    originalPrice: 2299,
    discountPercent: 57,
    rating: 4.6,
    reviewCount: 198,
    isBestseller: false,
    badge: null,
    offerBanner: 'Buy 2, get an extra 10% off',
    colours: [
      { name: 'Sand', hex: '#c8a882' },
      { name: 'Cream', hex: '#f0e8d8' },
      { name: 'Blush', hex: '#c9a0a0' },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    stockPerSize: { 36: 6, 37: 10, 38: 14, 39: 9, 40: 5, 41: 2 },
    material: 'Soft leather upper',
    heelHeight: 'Flat',
    closureType: 'Slip-on',
    soleType: 'Memory foam insole with rubber outsole',
    comfortProfile: {
      cushioning: 'Very high',
      stability: 'High',
      bestForHours: '8+ hours',
    },
    fitNote: 'True to size',
    oneLineHook: 'The flat that goes from 9 AM meetings to evening plans without asking for a break.',
    benefits: [
      { icon: '✦', text: 'Memory foam insole for cloud-like comfort' },
      { icon: '◎', text: 'Soft leather that molds to your foot shape' },
      { icon: '♡', text: 'From workday to weekend without changing shoes' },
      { icon: '★', text: 'Three minimal, versatile colours' },
    ],
    bestForOccasion: 'Office, casual outings, travel, all-day wear',
    stylingNote: 'Sand is the most versatile — pairs with everything. Blush is perfect for feminine, soft looks.',
    images: [juttiEvy, juttiSig, juttiEmb, juttiEvy, juttiSig],
    videos: [],
    detailImages: [juttiEvy, juttiEmb, juttiSig],
    reviews: [
      {
        id: 'r1', author: 'Sakshi M.', rating: 5, date: '2026-09-18',
        text: 'I wore these for a full day of meetings and a dinner after. Zero discomfort. The memory foam is real!',
        fitFeedback: 'True to size',
        verified: true,
      },
      {
        id: 'r2', author: 'Tanya G.', rating: 5, date: '2026-09-03',
        text: 'The sand colour is exactly as shown — a warm neutral that works with everything I own.',
        fitFeedback: 'True to size',
        verified: true,
      },
    ],
    customerPhotos: [],
    deliveryDaysEstimate: '3–5 business days',
    returnWindowDays: 7,
    exchangeWindowDays: 15,
    codAvailable: true,
    productSpecificQuestions: [
      { q: 'Is the leather real or faux?', a: 'Real soft leather upper with a full memory foam insole.' },
      { q: 'Are these water-resistant?', a: 'They handle light rain fine. We recommend drying naturally if they get wet — avoid direct heat.' },
    ],
    relatedProducts: ['her-3', 'icon-1', 'her-1'],
    accordion: [
      { title: 'MATERIALS & CARE', content: 'Upper: Soft real leather. Insole: Memory foam. Outsole: Rubber. Wipe with a damp cloth and air dry.' },
      { title: 'SHIPPING & RETURNS', content: 'Free shipping on orders above ₹999. 7-day exchange on size issues.' },
      { title: 'FIT & SIZE', content: 'True to size. Refer to our size guide for precise measurements.' },
    ],
    completeTheLook: [
      { img: productHero, label: 'Linen Trousers', price: '₹1,800' },
      { img: heelsImg,   label: 'Canvas Tote', price: '₹900' },
      { img: productHeel, label: 'Dainty Gold Ring', price: '₹600' },
      { img: juttiEmb,   label: 'Linen Shirt', price: '₹1,500' },
    ],
    pageTitle: 'Luna Everyday Flats — SYORA',
    pageDescription: 'Shop the Luna Everyday Flats — memory foam insole, soft leather, 8+ hours of comfort. Office to evening. COD available.',
    editorialTagline: 'DIFFERENT WORLDS.\nSAME YOU.',
    editorialBg: '/hero-everyday.jpg',
  },
};

export function getProduct(id) {
  return PRODUCTS[id] || null;
}
