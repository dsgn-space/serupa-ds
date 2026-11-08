import * as React from 'react';
import { useIsoLayoutEffect } from './cn';

/* Whether a text label is cut with an ellipsis, for the title that then shows it in full on hover (Button, Badge,
   SidebarItem). Checked when it renders, when the label's box changes size, and when a font finishes loading: a
   web font that swaps in after the first paint, or a font change, makes the text wider in a box that keeps its
   size, which a ResizeObserver doesn't see. */
export function useCut(on: boolean, text: string, label: () => HTMLElement | null | undefined): boolean {
  const [cut, setCut] = React.useState(false);
  useIsoLayoutEffect(() => {
    const l = label();
    if (!on || !l) { setCut(false); return; }
    const check = () => setCut(l.scrollWidth > l.clientWidth);
    check();
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (fonts && fonts.addEventListener) fonts.addEventListener('loadingdone', check);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    if (ro) ro.observe(l);
    return () => { if (ro) ro.disconnect(); if (fonts && fonts.removeEventListener) fonts.removeEventListener('loadingdone', check); };
  }, [on, text]);
  return cut;
}
