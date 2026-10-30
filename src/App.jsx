import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import './index.css';
import './App.css';
import './shopify.css';
import MultiverseEntry from './components/MultiverseEntry';
import CartDrawer from './components/CartDrawer';

// Route-level chunks keep product and legacy-shop code out of the homepage load.
const UniversePage = lazy(() => import('./components/UniversePage'));
const ProductPage = lazy(() => import('./components/ProductPage'));
const OrderConfirmation = lazy(() => import('./components/OrderConfirmation'));
const LegacyHome = lazy(() => import('./components/LegacyHome'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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

          {/* ── Legacy Shop / Home ── */}
          <Route path="/home" element={<LegacyHome />} />
          <Route path="/shop" element={<LegacyHome />} />

          {/* ── Order Confirmation (Shopify checkout return) ── */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
