/** SYORA — recent searches (this device only, localStorage; every access is guarded). */
const KEY = 'syora_recent_searches';
const MAX = 5;

export function readRecentSearches() {
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter((s) => typeof s === 'string' && s.trim()).slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(term) {
  const t = String(term || '').trim();
  if (t.length < 2) return;
  try {
    const next = [t, ...readRecentSearches().filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* storage unavailable */ }
}

export function clearRecentSearches() {
  try { window.localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}
