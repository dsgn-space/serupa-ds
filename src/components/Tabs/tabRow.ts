'use client';
import * as React from 'react';
import { useIsoLayoutEffect } from '../../internal/cn';

/* The row of tabs that Tabs' TabList and TabNav share: when the tabs don't fit, it scrolls with no scrollbar; the edge
   with more tabs past it fades out, so it's plain there's more; the selected tab is scrolled into view whenever it
   changes; and its line or fill slides from the tab selected before (Tabs.css, EG1). */

const FROM = ['--dk-tabs-from-shift', '--dk-tabs-from-scale', '--dk-tabs-span-l', '--dk-tabs-span-r', '--dk-tabs-span-t', '--dk-tabs-span-b', '--dk-tabs-from-l', '--dk-tabs-from-r', '--dk-tabs-from-t', '--dk-tabs-from-b'];

/* Where the selected tab's line or fill is now, as a tab-sized box in the list: the tab's own box at rest, or, mid-slide,
   where the slide has got to. The line: the tab's box moved by its translate and stretched by its scale (from its top
   left). The fill: the box its clip-path leaves showing, out of the span it covers (place sets the span). */
const shown = (on: HTMLElement) => {
  const nums = (v: string) => (v.match(/-?[\d.]+(?:e-?\d+)?/g) || []).map(Number);
  let x = on.offsetLeft, y = on.offsetTop, w = on.offsetWidth, h = on.offsetHeight;
  const line = getComputedStyle(on, '::after'), fill = getComputedStyle(on, '::before');
  if (line.translate && line.translate !== 'none') { const [dx = 0, dy = 0] = nums(line.translate); x += dx; y += dy; }
  if (line.scale && line.scale !== 'none') { const [sx = 1, sy = sx] = nums(line.scale); w *= sx; h *= sy; }
  if (/^inset\(/.test(fill.clipPath)) {
    const [t = 0, r = t, b = t, l = r] = nums(fill.clipPath.split(' round')[0]);
    const span = (k: string) => parseFloat(on.style.getPropertyValue('--dk-tabs-span-' + k)) || 0;
    const left = x - span('l') + l, top = y - span('t') + t;
    w = x + w + span('r') - r - left; h = y + h + span('b') - b - top; x = left; y = top;
  }
  return { x, y, w, h };
};

/** Runs the row. tab and on are selectors for the tabs and the selected one; value is what's selected, so the row
 *  scrolls it into view when it changes. Returns the ref for the list, which of its edges fade, and place: called
 *  with true just before the selection changes, a slide still running turns back from where it has got to (EH1). */
export function useTabRow<E extends HTMLElement>(tab: string, on: string, vertical: boolean, value: unknown): [React.RefObject<E | null>, { before: boolean; after: boolean }, (now?: boolean) => void] {
  const list = React.useRef<E | null>(null);
  const [fade, setFade] = React.useState<{ before: boolean; after: boolean }>({ before: false, after: false });
  // Where the row itself scrolled the list to show the selected tab as it mounted, before anything else scrolled it.
  const own = React.useRef<number | null>(null);
  // Each tab carries where the selected tab's line (or fill) is, from where it sits: when it's selected next, its own
  // line starts there and slides into place (Tabs.css, EG1). It's set ahead of time, on every tab, because a line
  // starts from the style its tab had just before it was selected. Refreshed on each change (reveal measures) and as the tabs resize.
  // With now, from where the line or fill is at this moment (shown) rather than from the selected tab's box: just
  // before the selection changes, so picking another tab mid-slide starts there (EH1).
  const place = React.useCallback((now?: boolean) => {
    const el = list.current;
    if (!el) return;
    const tabs = Array.from(el.querySelectorAll<HTMLElement>(tab));
    const sel = el.querySelector<HTMLElement>(on);
    const b = sel && (now ? shown(sel) : { x: sel.offsetLeft, y: sel.offsetTop, w: sel.offsetWidth, h: sel.offsetHeight });
    for (const t of tabs) {
      // The selected tab keeps the pill's span it was selected with (below), so its slide runs to the end.
      if (t === sel) continue;
      if (!b || !t.offsetWidth || !t.offsetHeight) { for (const k of FROM) t.style.removeProperty(k); continue; }
      const dx = b.x - t.offsetLeft, dy = b.y - t.offsetTop, w = t.offsetWidth, h = t.offsetHeight;
      t.style.setProperty('--dk-tabs-from-shift', dx + 'px ' + dy + 'px');
      t.style.setProperty('--dk-tabs-from-scale', b.w / w + ' ' + b.h / h);
      // The pill's fill (GO1) spans this tab and the selected one, cut to this tab; it starts cut to the selected one.
      const l = Math.max(0, -dx), r = Math.max(0, dx + b.w - w), u = Math.max(0, -dy), d = Math.max(0, dy + b.h - h);
      const set = (k: string, n: number) => t.style.setProperty(k, n + 'px');
      set('--dk-tabs-span-l', l); set('--dk-tabs-span-r', r); set('--dk-tabs-span-t', u); set('--dk-tabs-span-b', d);
      set('--dk-tabs-from-l', l + dx); set('--dk-tabs-from-r', w + r - dx - b.w); set('--dk-tabs-from-t', u + dy); set('--dk-tabs-from-b', h + d - dy - b.h);
    }
  }, [tab, on]);
  // Which ends have tabs past them: before is the left (or top) edge, after the right (or bottom). In RTL,
  // scrollLeft runs from 0 down to minus the overflow.
  const measure = React.useCallback(() => {
    const el = list.current;
    if (!el) return;
    place();
    const max = vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
    let at = vertical ? el.scrollTop : el.scrollLeft;
    if (!vertical && getComputedStyle(el).direction === 'rtl') at = max + at;
    const next = { before: max > 1 && at > 1, after: max > 1 && at < max - 1 };
    setFade((f) => (f.before === next.before && f.after === next.after ? f : next));
  }, [vertical, place]);
  useIsoLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    measure();
    // The fades ease only once the list has been scrolled (Tabs.css): one that's there from the first frame is just there.
    // The row's own scroll to the selected tab as it mounts doesn't count: Firefox fires its scroll event late enough
    // that a fade measured after it would ease in on the first frame.
    const scrolled = () => { if ((vertical ? el.scrollTop : el.scrollLeft) !== own.current) el.setAttribute('data-scrolled', ''); measure(); };
    el.addEventListener('scroll', scrolled, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (ro) { ro.observe(el); Array.from(el.children).forEach((c) => ro.observe(c)); }
    return () => { el.removeEventListener('scroll', scrolled); if (ro) ro.disconnect(); };
  }, [measure]);
  // The selected tab, scrolled into view inside the list only (the page doesn't move), with the fade's room to spare.
  const reveal = React.useCallback((first?: boolean) => {
    const el = list.current;
    const sel = el && value != null ? el.querySelector<HTMLElement>(on) : null;
    if (!el || !sel) return;
    const room = parseFloat(getComputedStyle(el).getPropertyValue('--dk-tabs-fade')) || 0;
    const box = el.getBoundingClientRect(), t = sel.getBoundingClientRect();
    if (vertical) {
      if (t.top < box.top + room) el.scrollTop -= box.top + room - t.top;
      else if (t.bottom > box.bottom - room) el.scrollTop += t.bottom - (box.bottom - room);
    } else if (t.left < box.left + room) el.scrollLeft -= box.left + room - t.left;
    else if (t.right > box.right - room) el.scrollLeft += t.right - (box.right - room);
    if (first && !el.hasAttribute('data-scrolled')) own.current = vertical ? el.scrollTop : el.scrollLeft;
    measure();
  }, [value, on, vertical, measure]);
  const mounting = React.useRef(true);
  useIsoLayoutEffect(() => { reveal(mounting.current); mounting.current = false; }, [reveal]);
  // Again once the web fonts have loaded: tabs drawn first in a fallback font change width when the real one
  // arrives, which can leave the selected tab part way past the end.
  React.useEffect(() => {
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (!fonts || fonts.status === 'loaded') return;
    let live = true;
    // fonts.ready only ever resolves (CSS Font Loading), so it needs no rejection handler.
    void fonts.ready.then(() => { if (live) reveal(true); });
    return () => { live = false; };
  }, [reveal]);
  return [list, fade, place];
}
