'use client';
import * as React from 'react';
import { cn, oneOf, useIsoLayoutEffect, useMergedRef } from '../../internal/cn';
import { component } from '../../internal/component';
import type { Placement } from '../../internal/position';
import { Tooltip } from '../Tooltip/Tooltip';

export interface TruncatedTextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** The text, as a string: a file name, an email address, a title. All of it stays in the page, so screen readers
   *  and find-in-page get the whole text whether or not it's cut. */
  children: string;
  /** How many lines it may take before it's cut with an ellipsis: 1 (default) to 6. */
  lines?: number | undefined;
  /** The element: 'span' (default), 'p' or 'div'. Whichever it is, it's a block as wide as its container. */
  as?: 'span' | 'p' | 'div' | undefined;
  /** Where the full text shows: 'top' (default), 'bottom', 'left', 'right', or with '-start' / '-end'. It flips when
   *  there's no room. */
  placement?: Placement | undefined;
}

const TAGS = ['span', 'p', 'div'] as const;
// A control around the text that takes focus itself: the text adds no tab stop of its own inside one.
const CONTROL = 'a[href], button, summary, [role="button"], [role="link"], [role="tab"], [role="option"], [role="menuitem"], [role="treeitem"], [tabindex="0"]';

/* TruncatedText: text that may not fit its space, cut with an ellipsis, with the full text one hover, focus or tap
   away, and only while it's cut. It measures itself (and again when its box, its text or the fonts change): text that
   fits is plain text, with no tab stop and no tooltip. Cut, it takes keyboard focus (tabindex="0"), so what the
   pointer can reveal the keyboard can too (WCAG 2.1.1), unless a link or button around it already takes focus:
   then that control's keyboard focus shows the full text. The tooltip repeats what the element holds, so it is
   hidden from screen readers, which read the whole text from the element. */
/** Text cut with an ellipsis when it doesn't fit, with the full text on hover, keyboard focus and tap.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const TruncatedText = /* @__PURE__ */ component<HTMLElement, TruncatedTextProps>('TruncatedText', function TruncatedText(props, ref) {
  const { children, lines, as, placement, className, onPointerDown, onClick, ...rest } = props;
  const clamp = lines != null && lines >= 2 ? Math.min(6, Math.floor(lines)) : 0;
  const el = React.useRef<HTMLElement | null>(null);
  const [cut, setCut] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [inside, setInside] = React.useState(false);
  const isCut = React.useRef(cut); isCut.current = cut;

  useIsoLayoutEffect(() => {
    const e = el.current;
    if (!e) return;
    const measure = () => {
      // One line: the text's own width against the box's, in fractions of a pixel (scrollWidth rounds, and says a
      // line that fits to the half pixel is cut). Several lines: the lines past the clamp still count in scrollHeight.
      let over = e.scrollHeight > e.clientHeight;
      if (!over && !clamp) {
        const r = document.createRange();
        r.selectNodeContents(e);
        over = r.getBoundingClientRect().width > e.getBoundingClientRect().width + 0.5;
      }
      setCut(over);
      if (!over) setOpen(false);
    };
    measure();
    const fonts = document.fonts;
    if (fonts && fonts.addEventListener) fonts.addEventListener('loadingdone', measure);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (ro) ro.observe(e);
    return () => {
      if (ro) ro.disconnect();
      if (fonts && fonts.removeEventListener) fonts.removeEventListener('loadingdone', measure);
    };
  }, [children, clamp]);

  // Inside a link, a button or another element that takes focus, that control's keyboard focus shows the full text.
  useIsoLayoutEffect(() => {
    const e = el.current, control = e && e.parentElement ? e.parentElement.closest<HTMLElement>(CONTROL) : null;
    setInside(!!control);
    if (!control) return;
    const focus = () => { if (isCut.current && control.matches(':focus-visible')) setOpen(true); };
    const blur = () => setOpen(false);
    control.addEventListener('focus', focus);
    control.addEventListener('blur', blur);
    return () => { control.removeEventListener('focus', focus); control.removeEventListener('blur', blur); };
  }, []);

  // A tap (touch or pen) shows it and the next tap hides it; a mouse has its hover. The Tooltip hides on the press,
  // so whether it was showing is read before that.
  const press = React.useRef({ touch: false, open: false });
  const refs = useMergedRef(ref, (n) => { el.current = n; });
  const text = React.createElement(oneOf(TAGS, as, 'span'), {
    ...rest,
    ref: refs,
    'data-component': 'truncated-text',
    'data-truncated': cut ? '' : undefined,
    // The count goes in an attribute the CSS reads, not a style attribute, so it holds under a strict CSP too.
    'data-lines': clamp || undefined,
    tabIndex: cut && !inside ? 0 : rest.tabIndex,
    className: cn('dk-truncated-text', clamp && 'dk-truncated-text--clamp', className),
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => { press.current = { touch: e.pointerType !== 'mouse', open }; if (onPointerDown) onPointerDown(e); },
    onClick: (e: React.MouseEvent<HTMLElement>) => { if (onClick) onClick(e); if (cut && press.current.touch && !press.current.open) setOpen(true); },
  }, children);
  return <Tooltip visual content={children} open={open} onOpenChange={setOpen} disabled={!cut} placement={placement}>{text}</Tooltip>;
});
