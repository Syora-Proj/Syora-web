import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import './index.css';
import './styles/tokens.css';
import './styles/ds.css';
import './shopify.css';
import Home from './pages/Home';
import CartDrawer from './components/CartDrawer';

// Route-level chunks keep product and legacy-shop code out of the homepage load.
const Pages = () => import('./pages/CollectionPages');
const UniversePage = lazy(() => Pages().then((m) => ({ default: m.UniversePage })));
const CategoryPage = lazy(() => Pages().then((m) => ({ default: m.CategoryPage })));
const ShopPage = lazy(() => Pages().then((m) => ({ default: m.ShopPage })));
const SearchPage = lazy(() => Pages().then((m) => ({ default: m.SearchPage })));
const ProductPage = lazy(() => import('./components/ProductPage'));
const OrderConfirmation = lazy(() => import('./components/OrderConfirmation'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
  return (
    <>
      <CartDrawer />
      <ScrollToTop />
      <Suspense fallback={<div className="route-loading" role="status" aria-label="Loading page" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/universe/icon"     element={<UniversePage universe="icon" />} />
          <Route path="/universe/heritage" element={<UniversePage universe="heritage" />} />
          <Route path="/universe/everyday" element={<UniversePage universe="everyday" />} />
          <Route path="/universe/motion"   element={<UniversePage universe="motion" />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:category" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:handle" element={<ProductPageWrapper />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
