import * as React from 'react';
import { useIsoLayoutEffect } from './cn';

/** Whether the element's content is taller or wider than it, so it scrolls. Kept up to date as the element or
 *  its content resizes, or content is added or replaced. A scrolling area needs Tab focus to be scrolled from the
 *  keyboard (outside Chromium, which scrolls the area under focus anyway), so callers make it focusable, a region
 *  and named while this is true (Table, CodeBlock, Timeline). Takes the element, or a ref to one that's rendered
 *  from the first render on. Measured before paint, so a box that scrolls from the start is never drawn without it.
 *  onMeasure runs on every measure, for a caller whose own state depends on the sizes too (ScrollArea's fades: more
 *  content past the end while it already scrolls changes no boolean here). */
export function useScrolls(target: HTMLElement | null | React.RefObject<HTMLElement | null>, onMeasure?: () => void): boolean {
  const [scrolls, setScrolls] = React.useState(false);
  const measured = React.useRef(onMeasure);
  // every render: keeps the latest callback (often a new function each render), before the measuring effect below runs.
  useIsoLayoutEffect(() => { measured.current = onMeasure; });
  useIsoLayoutEffect(() => {
    const el = target && 'current' in target ? target.current : target;
    if (!el) return;
    const check = () => { setScrolls(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1); measured.current?.(); };
    if (typeof ResizeObserver === 'undefined') { check(); return () => setScrolls(false); }
    const ro = new ResizeObserver(check);
    const watch = () => { ro.disconnect(); ro.observe(el); for (const c of Array.from(el.children)) ro.observe(c); check(); };
    const mo = typeof MutationObserver === 'undefined' ? null : new MutationObserver(watch);
    if (mo) mo.observe(el, { childList: true });
    watch();
    return () => { ro.disconnect(); if (mo) mo.disconnect(); setScrolls(false); };
  }, [target]);
  return scrolls;
}
