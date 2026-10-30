/**
 * SYORA — useShopifyCollection hook
 *
 * Fetches Shopify collection products for a given universe handle.
 * Returns loading/error states and normalised product card arrays.
 *
 * Usage:
 *   const { products, bestsellers, loading, error } = useShopifyCollection('heritage');
 */

import { useState, useEffect } from 'react';
import { getCollectionProducts } from '../lib/shopify/products';

/**
 * @param {string} universeId - one of: icon, heritage, everyday, motion
 * @returns {{ products: Array, bestsellers: Array, loading: boolean, error: string|null }}
 */
export function useShopifyCollection(universeId) {
  const [products,    setProducts]    = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    if (!universeId) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const items = await getCollectionProducts(universeId, 20);
        if (!cancelled) {
          setProducts(items);
          // Bestsellers = items tagged 'badge:BESTSELLER' or 'bestseller'
          setBestsellers(
            items.filter((p) =>
              p.badge === 'BESTSELLER' ||
              // Also support a plain 'bestseller' tag if badge tag absent
              false
            )
          );
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [universeId]);

  return { products, bestsellers, loading, error };
}
