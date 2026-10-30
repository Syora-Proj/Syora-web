/**
 * SYORA — Cart Context
 *
 * Provides cart state and operations to the entire app via React Context.
 * Wrap <App /> with <CartProvider> in main.jsx.
 *
 * Exposes:
 *   cart           — the current normalised cart object (or null)
 *   cartLoading    — true while any cart operation is in flight
 *   cartError      — error string from the last failed operation (or null)
 *   addToCart      — async (variantId, quantity?) → updated cart
 *   updateCartLine — async (lineId, quantity) → updated cart
 *   removeFromCart — async (lineId) → updated cart
 *   goToCheckout   — redirects the browser to Shopify-hosted checkout
 *   cartOpen       — controls the cart drawer visibility
 *   openCart       — opens the cart drawer
 *   closeCart      — closes the cart drawer
 *   totalQuantity  — convenience integer for the nav cart badge
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getCart     as shopifyGetCart,
  addToCart   as shopifyAddToCart,
  updateCartLine as shopifyUpdateCartLine,
  removeFromCart as shopifyRemoveFromCart,
} from '../lib/shopify/cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart,        setCart]        = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError,   setCartError]   = useState(null);
  const [cartOpen,    setCartOpen]    = useState(false);

  // Prevent duplicate in-flight mutations
  const inflightRef = useRef(false);

  /* ── Load cart on mount ── */
  useEffect(() => {
    let cancelled = false;
    shopifyGetCart()
      .then((c) => { if (!cancelled) setCart(c); })
      .catch(() => { /* no stored cart or expired — start fresh on first add */ });
    return () => { cancelled = true; };
  }, []);

  /* ── Generic operation wrapper ── */
  async function runOperation(operationFn) {
    if (inflightRef.current) return; // debounce rapid taps
    inflightRef.current = true;
    setCartLoading(true);
    setCartError(null);
    try {
      const updatedCart = await operationFn();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setCartError(err.message || 'Something went wrong. Please try again.');
      return null;
    } finally {
      setCartLoading(false);
      inflightRef.current = false;
    }
  }

  /* ── Public operations ── */
  const addToCart = useCallback(async (variantId, quantity = 1) => {
    const updated = await runOperation(() => shopifyAddToCart(variantId, quantity));
    if (updated) setCartOpen(true); // open cart drawer after successful add
    return updated;
  }, []);

  const updateCartLine = useCallback(async (lineId, quantity) => {
    return runOperation(() => shopifyUpdateCartLine(lineId, quantity));
  }, []);

  const removeFromCart = useCallback(async (lineId) => {
    return runOperation(() => shopifyRemoveFromCart(lineId));
  }, []);

  const goToCheckout = useCallback(() => {
    if (!cart?.checkoutUrl) {
      setCartError('No checkout URL available. Please add items to your bag first.');
      return;
    }
    // Shopify handles payment, validation, shipping, taxes — we just redirect.
    window.location.href = cart.checkoutUrl;
  }, [cart]);

  const openCart  = useCallback(() => setCartOpen(true),  []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const totalQuantity = cart?.totalQuantity || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        cartError,
        addToCart,
        updateCartLine,
        removeFromCart,
        goToCheckout,
        cartOpen,
        openCart,
        closeCart,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/** Hook — throws if used outside CartProvider. */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
