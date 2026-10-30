/**
 * SYORA — catalogue hooks.
 * Thin state wrappers over src/lib/shopify/catalog.js.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNewIn, fetchRecommendations, fetchCategories } from '../lib/shopify/catalog';

/**
 * Paged feed with cursor pagination.
 * `load(after)` returns { items, hasMore, cursor, filters, collection, total }.
 * The feed resets whenever `key` changes (collection, sort, filters, query).
 */
export function useFeed(load, key) {
  const loadRef = useRef(load);
  loadRef.current = load;
  const [s, setS] = useState({ status: 'loading', items: [], hasMore: false, cursor: null, filters: [], collection: null, total: null, error: null, more: false });

  useEffect(() => {
    let cancelled = false;
    setS((p) => ({ ...p, status: 'loading', items: [], error: null, hasMore: false }));
    loadRef.current(null)
      .then((page) => { if (!cancelled) setS({ status: 'ready', more: false, error: null, total: page.total ?? null, ...page }); })
      .catch((err) => { if (!cancelled) setS((p) => ({ ...p, status: 'error', error: err.message || 'Could not load products.' })); });
    return () => { cancelled = true; };
  }, [key]);

  const loadMore = useCallback(async () => {
    if (!s.hasMore || s.more) return;
    setS((p) => ({ ...p, more: true }));
    try {
      const page = await loadRef.current(s.cursor);
      setS((p) => ({ ...p, items: [...p.items, ...page.items], hasMore: page.hasMore, cursor: page.cursor, more: false }));
    } catch {
      setS((p) => ({ ...p, more: false }));
    }
  }, [s.hasMore, s.more, s.cursor]);

  return { ...s, loading: s.status === 'loading', failed: s.status === 'error', loadMore };
}

function useAsync(fn, deps, initial) {
  const [state, setState] = useState({ data: initial, status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    setState((p) => ({ ...p, status: 'loading' }));
    fn()
      .then((data) => { if (!cancelled) setState({ data, status: 'ready' }); })
      .catch(() => { if (!cancelled) setState({ data: initial, status: 'error' }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data: state.data, loading: state.status === 'loading', failed: state.status === 'error' };
}

export const useNewIn = (count = 8) => useAsync(() => fetchNewIn(count), [count], []);
export const useRecommendations = (productId) => useAsync(() => fetchRecommendations(productId), [productId], []);
export const useCategories = (categories) => useAsync(() => fetchCategories(categories), [categories.map((c) => c.handle).join(',')], []);
