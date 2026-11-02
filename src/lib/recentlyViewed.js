/**
 * SYORA — "recently viewed" (device-local, localStorage). No account/backend involved.
 * Every storage access is guarded: private browsing must never break the page.
 */
import { useEffect, useState } from 'react';

const KEY = 'syora_recently_viewed';
const MAX = 8;

function read() {
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter((p) => p && p.handle) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}

/** Records `product` as viewed and returns the OTHER recently viewed products (newest first). */
export function useRecentlyViewed(product) {
  const [others, setOthers] = useState([]);
  const handle = product?.handle;
  const name = product?.name;
  const img = product?.images?.[0] || '';
  const price = product?.price || 0;

  useEffect(() => {
    if (!handle) return;
    const previous = read();
    setOthers(previous.filter((p) => p.handle !== handle).slice(0, 6));
    write([{ handle, name, img, price }, ...previous.filter((p) => p.handle !== handle)].slice(0, MAX));
  }, [handle, name, img, price]);

  return others;
}
