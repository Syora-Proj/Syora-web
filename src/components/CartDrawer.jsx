/**
 * SYORA — Cart Drawer
 *
 * A slide-in cart panel that matches the existing SYORA design language.
 * Opens when the user adds to cart or clicks the bag icon in the navbar.
 *
 * All prices and totals are sourced from Shopify — never from client state.
 * "Go to Checkout" redirects to Shopify-hosted checkout.
 */

import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/shopify/products';
import { trackViewCart, trackBeginCheckout } from '../lib/analytics';

export default function CartDrawer() {
  const {
    cart,
    cartLoading,
    cartError,
    cartOpen,
    closeCart,
    goToCheckout,
    updateCartLine,
    removeFromCart,
  } = useCart();

  const lines = cart?.lines || [];

  // Fire view_cart when drawer opens
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (cartOpen && !prevOpenRef.current && cart) {
      trackViewCart(cart);
    }
    prevOpenRef.current = cartOpen;
  }, [cartOpen, cart]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`cart-backdrop ${cartOpen ? 'cart-backdrop--open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* ── Drawer panel ── */}
      <aside
        className={`cart-drawer ${cartOpen ? 'cart-drawer--open' : ''}`}
        aria-label="Shopping bag"
        aria-modal="true"
        role="dialog"
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            YOUR BAG
            {cart?.totalQuantity > 0 && (
              <span className="cart-drawer__count"> ({cart.totalQuantity})</span>
            )}
          </h2>
          <button
            className="cart-drawer__close"
            onClick={closeCart}
            aria-label="Close bag"
          >
            ✕
          </button>
        </div>

        {/* Error banner */}
        {cartError && (
          <div className="cart-error-banner" role="alert">
            {cartError}
          </div>
        )}

        {/* Body */}
        <div className="cart-drawer__body">
          {cartLoading && lines.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-spinner" />
              <p>Loading your bag…</p>
            </div>
          ) : lines.length === 0 ? (
            <div className="cart-empty">
              <p className="cart-empty__icon">🛍</p>
              <p className="cart-empty__title">Your bag is empty.</p>
              <p className="cart-empty__sub">Add a pair to get started.</p>
              <button className="cart-empty__cta" onClick={closeCart}>
                EXPLORE UNIVERSES →
              </button>
            </div>
          ) : (
            <ul className="cart-lines">
              {lines.map((line) => {
                const sizeOpt = line.variant?.selectedOptions?.find(
                  (o) => o.name.toLowerCase() === 'size'
                );
                const isUpdating = cartLoading;

                return (
                  <li key={line.id} className="cart-line">
                    {/* Product image */}
                    <div className="cart-line__img-wrap">
                      {line.variant?.product?.image?.url ? (
                        <img
                          src={line.variant.product.image.url}
                          alt={line.variant.product.image.altText || line.variant.product.title}
                          className="cart-line__img"
                        />
                      ) : (
                        <div className="cart-line__img-placeholder" />
                      )}
                    </div>

                    {/* Line info */}
                    <div className="cart-line__info">
                      <p className="cart-line__name">{line.variant?.product?.title}</p>
                      {sizeOpt && (
                        <p className="cart-line__size">Size: {sizeOpt.value}</p>
                      )}
                      <p className="cart-line__price">
                        {formatMoney(line.variant?.price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="cart-line__qty-row">
                        <button
                          className="cart-line__qty-btn"
                          disabled={isUpdating || line.quantity <= 1}
                          onClick={() => updateCartLine(line.id, line.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="cart-line__qty">{line.quantity}</span>
                        <button
                          className="cart-line__qty-btn"
                          disabled={isUpdating}
                          onClick={() => updateCartLine(line.id, line.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          className="cart-line__remove"
                          disabled={isUpdating}
                          onClick={() => removeFromCart(line.id)}
                          aria-label={`Remove ${line.variant?.product?.title} from bag`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <p className="cart-line__total">
                      {formatMoney(line.total)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal-row">
              <span>Subtotal</span>
              <span className="cart-drawer__subtotal-amount">
                {formatMoney(cart?.subtotal)}
              </span>
            </div>
            <p className="cart-drawer__tax-note">Taxes and shipping calculated at checkout.</p>

            <button
              className="cart-drawer__checkout-btn"
              onClick={() => { trackBeginCheckout(cart); goToCheckout(); }}
              disabled={cartLoading}
            >
              {cartLoading ? 'UPDATING…' : 'GO TO CHECKOUT →'}
            </button>

            <button className="cart-drawer__continue" onClick={closeCart}>
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
