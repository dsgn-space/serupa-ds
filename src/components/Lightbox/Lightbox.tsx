'use client';
import * as React from 'react';
import { cn, useIsoLayoutEffect } from '../../internal/cn';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { useFocusHandover } from '../../internal/focus';
import { useServerStyles } from '../../internal/serverStyles';
import { quickArrival } from '../../internal/timing';
import type { OpenChangeDetails } from '../../internal/openChange';
import { Dialog } from '../Dialog/Dialog';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import * as icons from '../../material/builtin';
import { en as words } from './labels';

/** One picture in a Lightbox. */
export interface LightboxItem {
  /** The full-size picture's address. */
  src: string;
  /** What it shows: the viewer's title while it's shown. Required; it names the picture for people who can't see it. */
  alt: string;
  /** A line under the picture, such as who took it or when. */
  caption?: React.ReactNode | undefined;
  /** Its size, so the stage has its shape before it loads. */
  width?: number | undefined;
  height?: number | undefined;
}

export interface LightboxProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title' | 'children'> {
  /** The pictures, in order. */
  items: readonly LightboxItem[];
  /** Whether it's open (controlled). */
  open?: boolean | undefined;
  /** Whether it's open at first (uncontrolled). Default: false. */
  defaultOpen?: boolean | undefined;
  /** Asked to open or close: Escape, the × or the backdrop. */
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** The picture shown (controlled), from 0. */
  index?: number | undefined;
  /** The picture shown at first (uncontrolled). Default: 0. */
  defaultIndex?: number | undefined;
  /** Another picture was asked for: the arrows, the arrow keys, Home and End, or a swipe. */
  onIndexChange?: ((index: number) => void) | undefined;
  /** After the last picture comes the first again, and before the first the last. Default: false. */
  loop?: boolean | undefined;
}

const SWIPE = 48;   // px a touch has to move sideways to turn the page

/* The stage: a muted fill with the picture's shape while it loads, a broken-image icon if it fails. The Dialog is
   titled with the alt text, so the picture itself has alt="" and isn't read twice. Keyed by src, so each picture
   starts loading afresh. */
function Stage({ item }: { item: LightboxItem }) {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [own, setOwn] = React.useState<[number, number] | null>(null);
  // A picture that arrives within quickArrival ms (cached, or a data: URL) just shows; one that takes longer fades in.
  const since = React.useRef(0);
  React.useEffect(() => { since.current = performance.now(); }, []);
  const [fades, setFades] = React.useState(false);
  const given: [number, number] | null = item.width && item.height ? [item.width, item.height] : null;
  const [w, h] = own || given || [4, 3];
  return (
    <span className="dk-lightbox__stage" data-state={state} data-fades={fades || undefined} style={{ '--dk-lightbox-ratio': w + ' / ' + h, '--dk-lightbox-w': own || given ? w + 'px' : '100%' } as React.CSSProperties}>
      {state === 'error'
        ? <span className="dk-lightbox__fallback" aria-hidden="true"><Icon icon={icons.BrokenImage} /></span>
        : <img src={item.src} alt="" className="dk-lightbox__img" decoding="async"
            onLoad={(e) => { const i = e.currentTarget; if (i.naturalWidth > 0) setOwn([i.naturalWidth, i.naturalHeight]); setFades(performance.now() - since.current > quickArrival); setState('loaded'); }}
            onError={() => setState('error')} />}
    </span>
  );
}

/* Lightbox: a set of pictures shown full size, one at a time, in a modal Dialog titled with the shown picture's alt
   text. The arrows (and the arrow keys, Home and End, which follow the reading direction, or a sideways swipe) move
   through them; "2 of 5" says where you are, and a change is announced. The next and previous pictures load ahead,
   so moving on is quick. Without loop, the arrows stop at the ends. */
/** A set of pictures shown full size one at a time, with arrows and a count, in a modal dialog. */
export const Lightbox = /* @__PURE__ */ component<HTMLDialogElement, LightboxProps>('Lightbox', function Lightbox(props, ref) {
  const { items, open: openProp, defaultOpen, onOpenChange, index: indexProp, defaultIndex, onIndexChange, loop, className, ...rest } = props;
  const sds = useSettings(words);
  const [ownOpen, setOwnOpen] = React.useState(!!defaultOpen);
  const [ownIndex, setOwnIndex] = React.useState(defaultIndex || 0);
  const open = openProp ?? ownOpen;
  const count = items.length;
  const index = Math.min(Math.max(0, indexProp ?? ownIndex), Math.max(0, count - 1));
  const item = items[index];
  const root = React.useRef<HTMLDivElement>(null);
  const restyle = useServerStyles(root);   // the stage's shape, under a strict Content Security Policy after hydrating

  const setOpen = (o: boolean, d: OpenChangeDetails) => { if (openProp === undefined) setOwnOpen(o); if (onOpenChange) onOpenChange(o, d); };
  const go = (to: number) => {
    const next = loop ? ((to % count) + count) % count : Math.min(Math.max(0, to), count - 1);
    if (next === index || !count) return;
    if (indexProp === undefined) setOwnIndex(next);
    if (onIndexChange) onIndexChange(next);
  };

  // Say the new picture when it changes while open; opening is said by the Dialog's title.
  const said = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!open || !item) { said.current = null; return; }
    if (said.current != null && said.current !== index) announce(item.alt + ', ' + sds.labels.imageOf(index + 1, count));
    said.current = index;
  }, [open, index, item, count, sds.labels]);

  // Load the pictures on either side, so the next one is there when it's asked for.
  React.useEffect(() => {
    if (!open || count < 2) return;
    for (const i of [index + 1, index - 1]) {
      const near = items[loop ? (i + count) % count : i];
      if (near && near !== item) { const img = new window.Image(); img.decoding = 'async'; img.src = near.src; }
    }
  }, [open, index, items, item, count, loop]);

  const rtl = () => !!root.current && getComputedStyle(root.current).direction === 'rtl';
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');
  // every render: an ancestor's dir can change without a render of ours; reading it is a style lookup, not a layout.
  useIsoLayoutEffect(() => { const d = rtl() ? 'rtl' : 'ltr'; if (d !== dir) setDir(d); });

  // On the dialog, so the keys work wherever focus is in it: the × it starts on, or the arrows.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (rest.onKeyDown) rest.onKeyDown(e);
    // With Alt, Ctrl or ⌘ the keys are the browser's (Alt+← goes back a page); in a field they move the caret.
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented || (e.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')) return;
    const back = rtl() ? 'ArrowRight' : 'ArrowLeft', fwd = rtl() ? 'ArrowLeft' : 'ArrowRight';
    if (e.key === back) go(index - 1);
    else if (e.key === fwd) go(index + 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(count - 1);
    else return;
    e.preventDefault();
  };

  // A sideways swipe with a finger or pen turns the page; a mouse drag doesn't (it selects, as on any page).
  const start = React.useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { start.current = e.pointerType === 'mouse' || !e.isPrimary ? null : { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * 2) return;
    const forward = dx < 0 !== rtl();   // a swipe to the left brings the next picture in left-to-right text
    go(index + (forward ? 1 : -1));
  };

  const first = !loop && index === 0, last = !loop && index === count - 1;
  // The arrow that reaches an end turns off under focus: focus goes to the other one, so it stays in the dialog.
  const handover = useFocusHandover();
  const prevNav = React.useRef<HTMLButtonElement | null>(null), nextNav = React.useRef<HTMLButtonElement | null>(null);
  const prevIcon = dir === 'rtl' ? icons.ChevronRight : icons.ChevronLeft, nextIcon = dir === 'rtl' ? icons.ChevronLeft : icons.ChevronRight;
  return (
    <Dialog {...rest} ref={ref} onKeyDown={onKeyDown} open={open && !!item} onOpenChange={setOpen} size="lg" title={item ? item.alt : undefined}
      description={count > 1 ? sds.labels.imageOf(index + 1, count) : undefined}
      className={cn('dk-lightbox', className)} data-component="lightbox">
      {item ? (
        <div ref={restyle} className="dk-lightbox__body" data-index={index} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { start.current = null; }}>
          <figure className="dk-lightbox__figure">
            <Stage key={item.src} item={item} />
            {item.caption != null ? <figcaption className="dk-lightbox__caption">{item.caption}</figcaption> : null}
          </figure>
          {count > 1 ? (
            <div className="dk-lightbox__nav">
              <IconButton icon={prevIcon} label={sds.labels.previousImage} variant="secondary" shape="round" ref={prevNav} disabled={first} onClick={(e) => { handover(e.currentTarget, () => nextNav.current); go(index - 1); }} />
              <span className="dk-lightbox__count" aria-hidden="true">{sds.labels.imageOf(index + 1, count)}</span>
              <IconButton icon={nextIcon} label={sds.labels.nextImage} variant="secondary" shape="round" ref={nextNav} disabled={last} onClick={(e) => { handover(e.currentTarget, () => prevNav.current); go(index + 1); }} />
            </div>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
});
