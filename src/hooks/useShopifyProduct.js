/**
 * SYORA — useShopifyProduct hook
 *
 * Fetches a single Shopify product by handle for the PDP.
 * Returns loading/error states and the normalised product object.
 *
 * Usage:
 *   const { product, loading, error } = useShopifyProduct('rosalie-kitten-heels');
 */

import { useState, useEffect, useCallback } from 'react';
import { getProductByHandle } from '../lib/shopify/products';

/**
 * @param {string} handle - Shopify product handle (slug)
 * @returns {{ product: Object|null, loading: boolean, error: string|null }}
 */
export function useShopifyProduct(handle) {
  const [requestId, setRequestId] = useState(0);
  const [result, setResult] = useState({ requestId: -1, product: null, error: null });

  const retry = useCallback(() => setRequestId((current) => current + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!handle) return () => { cancelled = true; };

    async function fetchData() {
      try {
        const p = await getProductByHandle(handle);
        if (!cancelled) setResult({ requestId, product: p, error: null });
      } catch (err) {
        if (!cancelled) setResult({ requestId, product: null, error: err.message || 'Could not load product.' });
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [handle, requestId]);

  const isCurrentResult = result.requestId === requestId;
  const product = isCurrentResult ? result.product : null;
  const error = handle
    ? (isCurrentResult ? result.error : null)
    : 'No Shopify product handle was provided.';
  const loading = Boolean(handle) && !isCurrentResult;

  return { product, loading, error, retry };
}
