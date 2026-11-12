/* Media queries read without React: one shared MediaQueryList per query, for the hooks in media.ts and for code that
   reads a query once (an effect about to animate). */
// module state: one MediaQueryList per query text, so reading a query on every render doesn't build a new one each
// time. It holds only how the visitor's screen answers a query, never a request's data, and the server never fills it.
const lists = new Map<string, MediaQueryList>();
/** The one MediaQueryList for a query, or null on the server (and where matchMedia is missing). */
export function mediaList(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  let m = lists.get(query);
  if (!m) {
    if (lists.size > 100) lists.clear();
    m = window.matchMedia(query);
    lists.set(query, m);
  }
  return m;
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
export const REDUCE_ATTR = '[data-motion="reduce"]';
/** Whether less motion is asked for right now, read once, for an effect that is about to animate: the system asks
 *  (`prefers-reduced-motion: reduce`), or the app's own setting does (`data-motion="reduce"` on `<html>`, or on a
 *  section around `el`). False on the server. */
export function reducedMotion(el?: Element | null): boolean {
  if (typeof document === 'undefined') return false;
  const m = mediaList(REDUCED_MOTION);
  if (m && m.matches) return true;
  const at = el && el.isConnected ? el : document.documentElement;
  return !!(at && at.closest(REDUCE_ATTR));
}

