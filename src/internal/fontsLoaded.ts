/** Calls `fn` when web fonts finish loading, from now on, so it can measure the text laid out in them: a font that
 *  swaps in after the first paint makes text wider or narrower in boxes that keep their size, which a
 *  ResizeObserver doesn't see. On "loadingdone" where the browser sends it; WebKit sends only "loading", and its
 *  `ready` may still be the last load's, already settled, so from "loading" it waits, a frame at a time, for the
 *  set's status to read "loaded" (for ten seconds at most). Returns the function that stops it. Browser only: call
 *  it from an effect. */
export function onFontsLoaded(fn: () => void): () => void {
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
  if (!fonts || !fonts.addEventListener) return () => {};
  let live = true, frame = 0;
  const done = () => { if (live) fn(); };
  const loading = () => {
    let n = 0;
    const wait = () => { if (!live) return; if (fonts.status === 'loaded') fn(); else if (n++ < 600) frame = requestAnimationFrame(wait); };
    cancelAnimationFrame(frame); frame = requestAnimationFrame(wait);
  };
  fonts.addEventListener('loading', loading);
  fonts.addEventListener('loadingdone', done);
  return () => { live = false; cancelAnimationFrame(frame); fonts.removeEventListener('loading', loading); fonts.removeEventListener('loadingdone', done); };
}
