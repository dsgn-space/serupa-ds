'use client';
import * as React from 'react';
import { cn, oneOf, omit, setRef } from '../../internal/cn';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { useScrolls } from '../../internal/useScrolls';
import { en as words } from './labels';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which way it scrolls: "vertical" (the default), "horizontal" or "both". Give it a height (style maxHeight or
   *  height) to scroll down, and its content a width past its own to scroll sideways. */
  orientation?: 'vertical' | 'horizontal' | 'both' | undefined;
  /** Fades the content at an edge while there's more past it, as a hint that it scrolls. Default: false. */
  fade?: boolean | undefined;
  /** Its name while it scrolls, as a region. Default: the scrollArea label ("Scrolling content"). */
  'aria-label'?: string | undefined;
}

const OWN = { orientation: 1, fade: 1, className: 1, children: 1, onScroll: 1, 'aria-label': 1, 'aria-labelledby': 1 } as const;
type Edges = { start: boolean; end: boolean };

/* ScrollArea: a box whose content scrolls inside it, with thin scrollbars in the theme's colors (the browser's own
   scrollbars, styled: they keep their keyboard, touch, screen reader and forced-colors behavior). While its
   content overflows it is a Tab stop, so the keyboard can scroll it (WCAG 2.1.1), and so a region with a name;
   when everything fits it's a plain div that Tab passes. With fade, the content fades at an edge while there's
   more past it. Table, CodeBlock and Timeline do the same for their own boxes. */
/** A box whose content scrolls inside it, with themed thin scrollbars; focusable and named only while it scrolls.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const ScrollArea = /* @__PURE__ */ component<HTMLDivElement, ScrollAreaProps>('ScrollArea', function ScrollArea(props, ref) {
  const rest = omit(props, OWN);
  const L = useSettings(words).labels;
  const box = React.useRef<HTMLDivElement | null>(null);
  const orientation = oneOf(['vertical', 'horizontal', 'both'] as const, props.orientation, 'vertical');
  const across = orientation === 'horizontal';
  const [edges, setEdges] = React.useState<Edges>({ start: true, end: true });
  // Which edges have more past them: read on scroll, and again whenever it starts or stops scrolling.
  const read = React.useCallback(() => {
    const el = box.current;
    if (!el) return;
    const pos = across ? Math.abs(el.scrollLeft) : el.scrollTop;
    const room = across ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    const next = { start: pos <= 1, end: pos >= room - 1 };
    setEdges((e) => (e.start === next.start && e.end === next.end ? e : next));
  }, [across]);
  // ...and whenever the box or its content changes size (rows added, a line that wraps once a font loads).
  const scrolls = useScrolls(box, props.fade ? read : undefined);
  React.useLayoutEffect(() => { if (props.fade) read(); }, [props.fade, scrolls, read]);

  const name = props['aria-labelledby'] ? { 'aria-labelledby': props['aria-labelledby'] } : { 'aria-label': props['aria-label'] || L.scrollArea };
  return (
    <div {...rest} {...(scrolls ? { tabIndex: 0, role: 'region', ...name } : {})}
      ref={(n) => { box.current = n; setRef(ref, n); }}
      onScroll={(e) => { if (props.fade) read(); props.onScroll?.(e); }}
      className={cn('dk-scroll-area', 'dk-scroll-area--' + orientation, props.fade && scrolls && !edges.start && 'dk-scroll-area--more-start',
        props.fade && scrolls && !edges.end && 'dk-scroll-area--more-end', props.className)}
      data-component="scroll-area">
      {props.children}
    </div>
  );
});
