import * as React from 'react';
import { useIsoLayoutEffect } from './cn';
import { onFontsLoaded } from './fontsLoaded';

/* Whether a text label is cut with an ellipsis, for the title that then shows it in full on hover (Button, Badge,
   SidebarItem). Checked when it renders, when the label's box changes size, and when a font finishes loading: a
   web font that swaps in after the first paint, or a font change, makes the text wider in a box that keeps its
   size, which a ResizeObserver doesn't see.
   Every label shares one ResizeObserver and one font listener (GR242: one of each per Button, Badge and SidebarItem
   was thousands on a busy page), made on first use. */
// module state: browser only. Labels are watched from a layout effect, which a server render never runs, so a
// request never adds to or reads these.
const checks = new Map<Element, () => void>();
let ro: ResizeObserver | null | undefined;
let fontsHeard = false;
function watch(l: HTMLElement, check: () => void): () => void {
  if (ro === undefined) ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver((entries) => entries.forEach((e) => checks.get(e.target)?.())) : null;
  if (!fontsHeard) { fontsHeard = true; onFontsLoaded(() => checks.forEach((check) => check())); }
  checks.set(l, check);
  if (ro) ro.observe(l);
  return () => { if (checks.get(l) === check) { checks.delete(l); if (ro) ro.unobserve(l); } };
}

export function useCut(on: boolean, text: string, label: () => HTMLElement | null | undefined): boolean {
  const [cut, setCut] = React.useState(false);
  useIsoLayoutEffect(() => {
    const l = label();
    if (!on || !l) { setCut(false); return; }
    const check = () => setCut(l.scrollWidth > l.clientWidth);
    check();
    return watch(l, check);
  }, [on, text]);
  return cut;
}
