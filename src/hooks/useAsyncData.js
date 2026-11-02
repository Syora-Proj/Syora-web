/**
 * SYORA — tiny data hook: runs `fetcher` when `enabled` and returns { data, loading, error }.
 * Re-runs when `deps` change; ignores results that arrive after unmount / a newer request.
 */
import { useEffect, useState } from 'react';

export function useAsyncData(fetcher, deps = [], enabled = true) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fetcher)
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((err) => { if (!cancelled) setState({ data: null, loading: false, error: err?.message || 'Could not load.' }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return state;
}
