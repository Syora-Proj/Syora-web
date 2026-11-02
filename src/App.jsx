import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';
import './App.css';
import './shopify.css';
import MultiverseEntry from './components/MultiverseEntry';
import CartDrawer from './components/CartDrawer';

// Route-level chunks keep product and legacy-shop code out of the homepage load.
const UniversePage = lazy(() => import('./components/UniversePage'));
const ShopAllPage = lazy(() => import('./components/ShopAllPage'));
const SearchPage = lazy(() => import('./components/SearchPage'));
const CartPage = lazy(() => import('./components/CartPage'));
const WishlistPage = lazy(() => import('./components/WishlistPage'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const ProductPage = lazy(() => import('./components/ProductPage'));
const OrderConfirmation = lazy(() => import('./components/OrderConfirmation'));
const LegacyHome = lazy(() => import('./components/LegacyHome'));
const InfoPage = lazy(() => import('./components/InfoPage'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function ProductPageWrapper() {
  const { handle } = useParams();
  return <ProductPage handle={handle} />;
}

export default function App() {
  useLayoutEffect(() => {
    document.getElementById('initial-hero')?.remove();
  }, []);

  return (
    <>
      <CartDrawer />
      <ScrollToTop />
      <Suspense fallback={<div className="route-loading" role="status" aria-label="Loading page" />}>
        <Routes>
          {/* ── Multiverse Entry ── */}
          <Route path="/" element={<MultiverseEntry />} />

          {/* ── Universe Pages ── */}
          <Route path="/universe/icon"     element={<UniversePage universe="icon" />} />
          <Route path="/universe/heritage" element={<UniversePage universe="heritage" />} />
          <Route path="/universe/everyday" element={<UniversePage universe="everyday" />} />
          <Route path="/universe/motion"   element={<UniversePage universe="motion" />} />
          {/* ── Product Detail Pages ── */}
          <Route path="/product/:handle" element={<ProductPageWrapper />} />

          {/* ── Help & information pages (footer links) ── */}
          <Route path="/info/:slug" element={<InfoPage />} />

          {/* ── Legacy Shop / Home ── */}
          <Route path="/home" element={<LegacyHome />} />
          <Route path="/shop" element={<ShopAllPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* ── Order Confirmation (Shopify checkout return) ── */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />

          {/* ── Fallback ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <SpeedInsights />
    </>
  );
}
