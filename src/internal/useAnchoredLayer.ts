import * as React from 'react';
import { useIsoLayoutEffect } from './cn';
import { onFontsLoaded } from './fontsLoaded';
import { markDismissal } from './layers';
import { anchorName, cssLength, firstSide, hideLayer, isRtl, placeLayer, showLayer, type Placement } from './position';

type Ref = React.RefObject<HTMLElement | null>;

// The anchor's ancestors that clip it (a scrolling list, a card with overflow hidden), nearest first. Up to the layer
// it sits in, if any (a submenu's item in its menu): that layer is in the top layer, drawn where it's placed, so what
// holds it in the page doesn't clip it.
const TOP = ':popover-open, :modal';
function clippers(a: HTMLElement): Element[] {
  const out: Element[] = [];
  for (let e = a.parentElement; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') out.push(e);
    if (inTopLayer(e)) break;
  }
  return out;
}
function inTopLayer(e: Element): boolean { try { return e.matches(TOP); } catch { return false; } }
/** True when nothing of the anchor can be seen: it has scrolled out of the window or out of a box that clips it. An
    anchor with no box (display: none) counts as seen, so its layer is placed as before. */
function anchorGone(a: HTMLElement, clips: Element[]): boolean {
  const r = a.getBoundingClientRect();
  if (!r.width && !r.height) return false;
  let top = 0, left = 0, bottom = window.innerHeight, right = window.innerWidth;
  for (const c of clips) { const b = c.getBoundingClientRect(); top = Math.max(top, b.top); left = Math.max(left, b.left); bottom = Math.min(bottom, b.bottom); right = Math.min(right, b.right); }
  return r.bottom <= top || r.top >= bottom || r.right <= left || r.left >= right;
}

export interface AnchoredLayerOptions {
  /** Where the layer goes; an unknown or missing value becomes `fallback`. */
  placement?: Placement;
  /** The placement when `placement` is missing (default "bottom"). */
  fallback?: Placement;
  /** The custom property holding the gap between anchor and layer, such as "--srp-menu-offset". */
  offsetVar: string;
  /** Called on a press outside the layer and `inside`, and when the <dialog> it sits in closes. On touch it waits
      for the tap's click, so a finger that starts a scroll outside doesn't close the layer. */
  onOutside?: () => void;
  /** Called when focus moves to an element outside the layer, the anchor and `inside` (Tab past the layer). */
  onFocusOutside?: () => void;
  /** An element a press on doesn't count as outside, such as the button that opens the layer. */
  inside?: Ref;
  /** Keeps the layer at least as wide as the anchor, as a list under its field. */
  matchWidth?: boolean;
  /** A value that changes the layer's size when it changes (a tooltip's text): it is placed again. */
  watch?: unknown;
  /** The layer's CSS places it (a popover shown as a sheet at the screen's foot): it is shown, not placed next to
      the anchor, and what placing set on it before is cleared. */
  docked?: boolean;
  /** Whether the system's close request (Android's Back gesture or button, Escape anywhere on the page) closes the
      layer, as Escape inside it does. Default true; a Tooltip, which closes by itself, says false. */
  closeRequest?: boolean;
}

// module state: whether the browser has anchor positioning, asked once.
let anchorable: boolean | undefined;
const canAnchor = (): boolean => (anchorable ??= typeof CSS !== 'undefined' && CSS.supports('top', 'anchor(--a top, 0px)'));

/** Shows `layer` in the top layer next to `anchor` while open, following scrolls, resizes and size changes;
    a press outside the layer (and `inside`) calls onOutside, as does the <dialog> it sits in closing, and focus
    moving outside them and the anchor calls onFocusOutside. Focus is the caller's: do it in a layout effect
    declared after this hook, which runs once the layer is shown and placed. */
export function useAnchoredLayer(open: boolean, layer: Ref, anchor: Ref, opts: AnchoredLayerOptions): void {
  const { placement, fallback = 'bottom', offsetVar, inside, matchWidth, watch, docked, closeRequest = true } = opts;
  const outside = React.useRef(opts.onOutside), focusOutside = React.useRef(opts.onFocusOutside);
  // every render: keeps the latest callbacks, so the listeners below needn't be added again when they change.
  useIsoLayoutEffect(() => { outside.current = opts.onOutside; focusOutside.current = opts.onFocusOutside; });
  useIsoLayoutEffect(() => {
    const p = layer.current, a = anchor.current;
    if (!p) return;
    if (!open || !a) { hideLayer(p); return; }
    if (docked) {
      for (const k of ['left', 'top', 'max-height', 'max-width', 'overflow-y', 'min-width', 'visibility']) p.style.removeProperty(k);
      p.setAttribute('data-side', 'bottom');
      showLayer(p);
      return;
    }
    // A first guess at the side before it shows: showing resolves the layer's first style, which is when an entry
    // from @starting-style keyed on data-side (Tooltip's slide) is fixed. placeLayer corrects it on a flip.
    firstSide(p, (placement || fallback || 'bottom').split('-')[0] ?? 'bottom');
    showLayer(p);
    // The gap and the anchor's direction are style reads: once, and again only when sizes change (a density or
    // theme switch), not on every scroll.
    let offset = 0, rtl = false, clips: Element[] = [];
    const measure = () => { offset = cssLength(p, offsetVar); rtl = isRtl(a); clips = clippers(a); };
    // Once its anchor has scrolled out of view the layer hides, rather than staying pinned to the window's edge with
    // nothing under it (over a sticky header), and shows again, placed, when the anchor comes back. Focus in it
    // leaves as it hides, which closes the layers that close when focus leaves (onFocusOutside).
    // The layer follows the anchor in CSS between the handlers below (anchor positioning); an anchor that isn't an
    // HTML element (an SVG's), or a browser without anchor() (Chrome before 125, which would drop the whole left and
    // top and leave the layer mid-screen), is placed in px, as before.
    const named = a instanceof HTMLElement && canAnchor() ? anchorName(a) : undefined, name = named && named[0];
    const update = () => {
      const gone = anchorGone(a, clips);
      p.style.visibility = gone ? 'hidden' : '';
      if (gone) return;
      if (matchWidth) p.style.minWidth = a.offsetWidth + 'px';
      placeLayer(p, a, placement, offset, fallback, rtl, name);
    };
    const resized = () => { measure(); update(); };
    // Scrolling inside the layer doesn't move it.
    const scrolled = (e: Event) => { if (!(e.target instanceof Node && p.contains(e.target))) update(); };
    resized();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(resized) : null;
    if (ro) { ro.observe(p); ro.observe(a); }
    window.addEventListener('scroll', scrolled, true); window.addEventListener('resize', resized);
    // A web font arriving moves text, and the anchor in it, without a resize a ResizeObserver sees: an inline
    // anchor (a Link in a sentence) has no box for one, and one further down only moves.
    const fontsOff = onFontsLoaded(resized);
    // A phone's keyboard opening, or pinch-zoom, moves the visual viewport without a window resize or scroll.
    const vv = window.visualViewport;
    if (vv) { vv.addEventListener('resize', resized); vv.addEventListener('scroll', update); }
    return () => {
      if (named) named[1]();
      if (ro) ro.disconnect(); window.removeEventListener('scroll', scrolled, true); window.removeEventListener('resize', resized);
      fontsOff();
      if (vv) { vv.removeEventListener('resize', resized); vv.removeEventListener('scroll', update); }
    };
  }, [open, layer, anchor, placement, fallback, offsetVar, matchWidth, watch, docked]);
  React.useEffect(() => {
    if (!open) return;
    const within = (t: EventTarget | null, refs: Array<Ref | undefined>) => refs.some((r) => !!r && !!r.current && t instanceof Node && r.current.contains(t));
    // A touch outside waits for its click: a finger that drags (a scroll) gets pointercancel and no click.
    let touch = false;
    const down = (e: PointerEvent) => {
      touch = false;
      if (within(e.target, [layer, inside])) return;
      if (e.pointerType === 'touch') touch = true;
      else if (outside.current) { markDismissal(e); outside.current(); }
    };
    const cancel = () => { touch = false; };
    const click = (e: MouseEvent) => {
      if (!touch) return;
      touch = false;
      if (!within(e.target, [layer, inside]) && outside.current) { markDismissal(e); outside.current(); }
    };
    const focus = (e: FocusEvent) => { if (focusOutside.current && !within(e.target, [layer, anchor, inside])) focusOutside.current(); };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('pointercancel', cancel, true);
    document.addEventListener('click', click, true);
    document.addEventListener('focusin', focus, true);
    // The <dialog> or Drawer it sits in closing (a close() from code, a form's method="dialog") hides it with them,
    // but it stayed open and was back, open, the next time they opened (L8E104).
    const box = layer.current && layer.current.parentElement && layer.current.parentElement.closest('dialog');
    const shut = () => { if (outside.current) outside.current(); };
    if (box) box.addEventListener('close', shut);
    // The phone's Back gesture: a modal <dialog> gets it from the browser, but a popover the layer opens doesn't, so
    // Back left the page with a Menu open. A CloseWatcher (where the browser has one) takes the system's close
    // request, innermost layer first, and closes the layer as Escape inside it does (focus back to where it was):
    // the Escape goes to the focused element when it is in the layer, its anchor or `inside`, otherwise to the layer.
    type Watcher = { onclose: (() => void) | null; destroy(): void };
    const W = closeRequest && typeof window !== 'undefined' ? Reflect.get(window, 'CloseWatcher') as (new () => Watcher) | undefined : undefined;
    let watcher: Watcher | null = null;
    try { watcher = W ? new W() : null; } catch { watcher = null; }
    if (watcher) {
      watcher.onclose = () => {
        // An Escape the layer let through closed it already (React commits it first): nothing more to close.
        if (!layer.current || layer.current.hidden) return;
        const f = document.activeElement, to = within(f, [layer, anchor, inside]) ? f as HTMLElement : layer.current;
        const esc = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true });
        if (to) to.dispatchEvent(esc);
        if (!esc.defaultPrevented && outside.current) outside.current();
      };
    }
    return () => {
      if (watcher) { watcher.onclose = null; watcher.destroy(); }
      if (box) box.removeEventListener('close', shut);
      document.removeEventListener('pointerdown', down, true); document.removeEventListener('pointercancel', cancel, true);
      document.removeEventListener('click', click, true); document.removeEventListener('focusin', focus, true);
    };
  }, [open, layer, anchor, inside, closeRequest]);
}
