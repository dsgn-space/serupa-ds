'use client';
import * as React from 'react';
import { cn, useIsoLayoutEffect, useLatest, useMergedRef } from '../../internal/cn';
import { named } from '../../internal/component';
import { onFontsLoaded } from '../../internal/fontsLoaded';
import { graphemes } from '../../internal/graphemes';
import { middleCutAt } from '../../internal/middleCut';
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
  /** Where one line is cut: 'end' (default) or 'middle', which keeps the end in view ("quarterly-rep…2026.pdf"), for
   *  file names, ids and addresses told apart by their ends. Screen readers and copy still get the whole text once.
   *  With lines (2 or more) it's cut at the end. */
  mode?: 'end' | 'middle' | undefined;
}

// A control around the text that takes focus itself: the text adds no tab stop of its own inside one.
const CONTROL = 'a[href], button, summary, [role="button"], [role="link"], [role="tab"], [role="option"], [role="menuitem"], [role="treeitem"], [tabindex="0"]';

function TruncatedTextRender({ ref, ...props }: TruncatedTextProps & React.RefAttributes<HTMLElement>) {
  const { children, lines, as, placement, mode, className, onPointerDown, onClick, ...rest } = props;
  const clamp = lines != null && lines >= 2 ? Math.min(6, Math.floor(lines)) : 0;
  const middle = mode === 'middle' && !clamp;
  const el = React.useRef<HTMLElement | null>(null);
  const [cut, setCut] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [inside, setInside] = React.useState(false);
  const isCut = useLatest(cut);

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
    // A web font that swaps in later changes the text's width in a box that keeps its size (WebKit sends no
    // "loadingdone": onFontsLoaded waits for its fonts another way).
    const stop = onFontsLoaded(measure);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (ro) ro.observe(e);
    return () => {
      if (ro) ro.disconnect();
      stop();
    };
  }, [children, clamp, middle]);

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
  // so whether it was showing is read before that. Inside a control the tap is the control's (a picker opening, a
  // link followed): the whole text would cover what it opens.
  const press = React.useRef({ touch: false, open: false });
  const refs = useMergedRef(ref, (n) => { el.current = n; });
  // Cut in the middle: the whole text stays in one run that shrinks to an ellipsis, so screen readers, find-in-page
  // and a copy get all of it once, and its last few characters are drawn again after it (CSS generated content, which
  // screen readers skip and a copy leaves out). The run never shows as far as them: it's cut only when the whole text
  // doesn't fit. The end is cut on grapheme boundaries, and dir="auto" lays it out in the text's own direction, so a
  // right-to-left name keeps its end on the left.
  const chars = middle && cut ? graphemes(children) : [];
  const at = chars.length ? middleCutAt(children, chars) : 0;
  const content = at > 0 ? <span className="dk-truncated-text__start">{children}</span> : children;
  const Tag = as === 'p' || as === 'div' ? as : 'span';
  const attrs = {
    ...rest,
    'data-component': 'truncated-text',
    'data-truncated': cut ? '' : undefined,
    // The count goes in an attribute the CSS reads, not a style attribute, so it holds under a strict CSP too.
    'data-lines': clamp || undefined,
    'data-end': at > 0 ? chars.slice(at).join('') : undefined,
    dir: middle ? rest.dir || 'auto' : rest.dir,
    tabIndex: cut && !inside ? 0 : rest.tabIndex,
    className: cn('dk-truncated-text', clamp && 'dk-truncated-text--clamp', at > 0 && 'dk-truncated-text--middle', className),
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => { press.current = { touch: e.pointerType !== 'mouse', open }; if (onPointerDown) onPointerDown(e); },
    onClick: (e: React.MouseEvent<HTMLElement>) => { if (onClick) onClick(e); if (cut && !inside && press.current.touch && !press.current.open) setOpen(true); },
  };
  // JSX rather than createElement: the compiler takes a ref passed to a function as read during render (ADR-0017).
  const text = <Tag {...attrs} ref={refs}>{content}</Tag>;
  return <Tooltip visual content={children} open={open} onOpenChange={setOpen} disabled={!cut} placement={placement}>{text}</Tooltip>;
}

/* TruncatedText: text that may not fit its space, cut with an ellipsis, with the full text one hover, focus or tap
   away, and only while it's cut. It measures itself (and again when its box, its text or the fonts change): text that
   fits is plain text, with no tab stop and no tooltip. Cut, it takes keyboard focus (tabindex="0"), so what the
   pointer can reveal the keyboard can too (WCAG 2.1.1), unless a link or button around it already takes focus:
   then that control's keyboard focus shows the full text. The tooltip repeats what the element holds, so it is
   hidden from screen readers, which read the whole text from the element. */
/** Text cut with an ellipsis when it doesn't fit, with the full text on hover, keyboard focus and tap.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const TruncatedText = /* @__PURE__ */ named('TruncatedText', TruncatedTextRender);
