/**
 * SYORA — local wishlist
 *
 * A device-local wishlist (localStorage, keyed by product handle). There is no
 * account or backend wishlist yet, so this only remembers the heart toggle between
 * pages and visits on the same browser. All storage access is guarded: private
 * browsing and blocked storage must never break the page.
 */
import { useCallback, useEffect, useState } from 'react';

const KEY = 'syora_wishlist';
const EVENT = 'syora:wishlist';

function read() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — the in-page toggle still works via the event below */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** @returns {[boolean, () => void]} whether `handle` is wishlisted, and a toggle. */
export function useWishlisted(handle) {
  const [wishlisted, setWishlisted] = useState(() => (handle ? read().includes(handle) : false));

  useEffect(() => {
    if (!handle) return undefined;
    const sync = () => setWishlisted(read().includes(handle));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [handle]);

  const toggle = useCallback(() => {
    if (!handle) return;
    const list = read();
    write(list.includes(handle) ? list.filter((h) => h !== handle) : [...list, handle]);
  }, [handle]);

  return [wishlisted, toggle];
}

/** @returns {string[]} every wishlisted product handle on this device (live-updating). */
export function useWishlistHandles() {
  const [list, setList] = useState(() => read());
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return list;
}
