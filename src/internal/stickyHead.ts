import * as React from 'react';

/* A sticky header covers the top of its scrolling frame: measure it into a CSS variable on the frame, so what the
   keyboard focuses scrolls in below it (the CSS sets scroll-padding-top from the variable, WCAG 2.4.11). Firefox
   leaves scroll-padding out when it decides whether a focused control needs scrolling, so one partly under the
   header stays there: after the browser's own focus scroll, the frame moves by what's still covered. Used by Table
   and DataGrid. */
export function useStickyHead(frame: React.RefObject<HTMLElement | null>, sticky: boolean, headSelector: string, cssVar: string): void {
  React.useEffect(() => {
    const el = frame.current, head = el && el.querySelector<HTMLElement>(headSelector);
    if (!el || !sticky || !head || typeof ResizeObserver === 'undefined') return;
    const set = () => el.style.setProperty(cssVar, head.getBoundingClientRect().height + 'px');
    const ro = new ResizeObserver(set);
    ro.observe(head);
    set();
    let raf = 0;
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t === el || head.contains(t)) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const covered = el.getBoundingClientRect().top + el.clientTop + head.getBoundingClientRect().height - t.getBoundingClientRect().top;
        if (covered > 0) el.scrollTop -= covered;
      });
    };
    el.addEventListener('focusin', onFocus);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); el.removeEventListener('focusin', onFocus); el.style.removeProperty(cssVar); };
  }, [frame, sticky, headSelector, cssVar]);
}
