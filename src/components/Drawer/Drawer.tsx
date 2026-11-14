'use client';
import * as React from 'react';
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { warnOnce } from '../../internal/warn';
import { IconButton } from '../IconButton/IconButton';
import { Discard } from '../Dialog/Dialog';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { modalClosed, modalOpened, modalOpening, wasDismissal } from '../../internal/layers';
import * as icons from '../../material/builtin';
import { useScrolls } from '../../internal/useScrolls';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { isComposing } from '../../internal/ime';
import { deepActive } from '../../internal/root';
import { isRtl } from '../../internal/position';
import type { OpenChangeDetails, OpenChangeReason } from '../../internal/openChange';
import { project, rubber, settleTime, speed, track, type Samples } from '../../internal/fling';
import { useServerStyles } from '../../internal/serverStyles';
import { en as words } from './labels';

/** Where a Drawer sits: a physical edge, or the edge the reading starts or ends at. */
export type DrawerPlacement = 'right' | 'left' | 'top' | 'bottom' | 'start' | 'end';

export interface DrawerProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'title' | 'open'> {
  /** Whether it's open. Controlled: close it yourself in onOpenChange. */
  open?: boolean | undefined;
  /** Open at first, then it closes itself (uncontrolled), for one shown on arrival. Default: false. */
  defaultOpen?: boolean | undefined;
  /** Called with false when people ask to close it, and why: { reason: 'escape' | 'close' (the ×) | 'outside' (the backdrop) | 'swipe' | 'api' (the browser closed it) }. */
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** The edge it slides in from: 'right' (default), 'left', 'top' or 'bottom', or 'start' and 'end', the edges
      the reading starts and ends at ('start' is the left in a left-to-right page and the right in a right-to-left one). */
  placement?: DrawerPlacement | undefined;
  /** The width of a left or right drawer: 'sm' 320px, 'md' 384px (default) or 'lg' 512px, at most the screen. Top and bottom drawers fit their content. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** The heading, which also names the drawer. */
  title?: React.ReactNode | undefined;
  /** A muted line under the title, read when it opens. */
  description?: React.ReactNode | undefined;
  /** Buttons pinned to the bottom, under a line: the main action last. */
  footer?: React.ReactNode | undefined;
  /** Shows the × in the corner. Default: true. */
  closeButton?: boolean | undefined;
  /** The × button's name. Default: 'Close'. */
  closeLabel?: string | undefined;
  /** Whether a click on the backdrop closes it. Default: true. */
  closeOnBackdrop?: boolean | undefined;
  /** false: a side panel next to the page instead of over it. No backdrop, the page stays usable and scrolls, and
      focus can leave it; Escape inside it and the × still close it. Default: true. */
  modal?: boolean | undefined;
  /** A touch drag toward its edge closes it (onOpenChange(false, { reason: 'swipe' })). Top and bottom drawers
      are dragged by the header or footer, so the body still scrolls. Default: true. */
  swipeToClose?: boolean | undefined;
  /** The element that takes focus when it opens, instead of the first that can (the ×) or one marked data-autofocus: the field people came to fill. */
  initialFocus?: React.RefObject<HTMLElement | null> | undefined;
  /** Where focus goes when it closes, instead of back to what had it before (taken when that's gone): the next row after the one it deleted, say. */
  finalFocus?: React.RefObject<HTMLElement | null> | undefined;
  /** There are changes that would be lost: Escape, the ×, the backdrop, a swipe or the browser closing it first ask "Discard changes?" (an alert dialog, Keep editing focused), and onOpenChange(false) comes only after Discard. Leaving the page asks too (beforeunload). Your own Cancel button closes it directly, so ask there yourself if it should. Default: false. */
  unsaved?: boolean | undefined;
  /** A bottom drawer as a sheet that stops at these heights, as shares of the screen's height from the shortest
      ([0.5, 0.9]): a drag on its handle or header moves it between them, a press on the handle goes to the next
      (back to the shortest from the tallest), and a drag down from the shortest closes it. Bottom drawers only. */
  snapPoints?: readonly number[] | undefined;
  /** Which snap point it's at, from 0 (controlled). Use with onSnapChange. */
  snap?: number | undefined;
  /** Which snap point it opens at, from 0 (uncontrolled). Default: 0, the shortest. */
  defaultSnap?: number | undefined;
  /** Called with the snap point it moves to, from a drag or the handle. */
  onSnapChange?: ((snap: number) => void) | undefined;
}

const FLICK = 0.2;   // px per ms over the last 100ms toward the edge: a let-go this fast closes it, however short (KW5a)
const INWARD = 24;   // px at most a drag away from the edge moves the panel, against growing resistance
const OWN = { open: 1, defaultOpen: 1, onOpenChange: 1, placement: 1, size: 1, title: 1, description: 1, footer: 1, closeButton: 1, closeLabel: 1, closeOnBackdrop: 1, modal: 1, swipeToClose: 1, initialFocus: 1, finalFocus: 1, unsaved: 1, snapPoints: 1, snap: 1, defaultSnap: 1, onSnapChange: 1, className: 1, children: 1 } as const;

/* Drawer: a modal panel that slides in from an edge of the screen, for navigation on small screens, filters,
   or details and edits without leaving the page. It's a native <dialog> (showModal) like Dialog: focus stays
   inside, the page behind is inert and doesn't scroll, Escape, the × and the backdrop ask to close
   (onOpenChange(false)), and focus goes back where it was. modal={false} shows it with show() instead: a side
   panel with no backdrop, beside a page that stays usable. unsaved puts Dialog's "Discard changes?" question between
   a request to close and onOpenChange(false). */
/** A modal panel that slides in from an edge: navigation, filters, details. */
export const Drawer = /* @__PURE__ */ component<HTMLDialogElement, DrawerProps>('Drawer', function Drawer(props, ref) {
  const nameRef = useNameCheck('Drawer', NAME_HOW.title);   // warns when it has no accessible name
  const sds = useSettings(words);
  const restyle = useServerStyles<HTMLDialogElement>();   // a sheet's height share, under a strict CSP
  const rest = omit(props, OWN);
  const base = domId('dk-drw', React.useId());
  const el = React.useRef<HTMLDialogElement | null>(null);
  const back = React.useRef<HTMLElement | null>(null);
  const side = oneOf(['right', 'left', 'top', 'bottom', 'start', 'end'] as const, props.placement, 'right');
  const size = oneOf(['sm', 'md', 'lg'] as const, props.size, 'md');
  const showClose = props.closeButton !== false;
  // snapPoints: the heights a bottom sheet stops at, shares of the screen from the shortest; none for other sides.
  const snaps = side === 'bottom' && props.snapPoints ? props.snapPoints.filter((n) => n > 0 && n <= 1).slice().sort((a, b) => a - b) : [];
  const [ownSnap, setOwnSnap] = React.useState(props.defaultSnap ?? 0);
  const snapAt = snaps.length ? Math.min(Math.max(0, Math.round(props.snap ?? ownSnap)), snaps.length - 1) : 0;
  const toSnap = (i: number) => { if (i === snapAt) return; if (props.snap === undefined) setOwnSnap(i); if (props.onSnapChange) props.onSnapChange(i); };
  const modal = props.modal !== false;
  const backdrop = modal && props.closeOnBackdrop !== false;
  const ask = React.useRef(props.onOpenChange); ask.current = props.onOpenChange;
  const initial = React.useRef(props.initialFocus); initial.current = props.initialFocus;
  const final = React.useRef(props.finalFocus); final.current = props.finalFocus;
  const isModal = React.useRef(modal); isModal.current = modal;
  const [inner, setInner] = React.useState(!!props.defaultOpen);
  const controlled = props.open !== undefined;
  const open = controlled ? !!props.open : inner;
  // Uncontrolled, each opening starts at defaultSnap.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) setOwnSnap(props.defaultSnap ?? 0); }
  const close = React.useCallback((reason: OpenChangeReason) => { if (!controlled) setInner(false); if (ask.current) ask.current(false, { reason }); }, [controlled]);
  // unsaved: a request to close asks "Discard changes?" first (Dialog's question), and remembers why it came.
  const unsaved = React.useRef(props.unsaved); unsaved.current = props.unsaved;
  const [asking, setAsking] = React.useState<OpenChangeReason | null>(null);
  // The app closing it while the question shows takes the question away too, so it can't come back stale (GR96).
  if (!open && asking) setAsking(null);
  const request = (reason: OpenChangeReason) => { if (unsaved.current) setAsking(reason); else close(reason); };
  React.useEffect(() => {
    if (!open || !props.unsaved) return;
    const stay = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', stay);
    return () => window.removeEventListener('beforeunload', stay);
  }, [open, props.unsaved]);
  const has = (n: React.ReactNode) => n != null && n !== false && n !== '';
  // Open on arrival: there from the first frame, so it doesn't slide in; it closes, and opens again, with motion.
  const arrived = React.useRef(open); if (!open) arrived.current = false;

  // Focus goes to finalFocus when it's still on the page, else back where it was. Unmounting keeps what's owed:
  // StrictMode mounts it again, open.
  const giveBack = (go: boolean, keep?: boolean) => {
    if (!back.current) return;   // never opened, or already given back
    const f = final.current && final.current.current, b = f && f.isConnected ? f : back.current;
    if (!keep) back.current = null;
    if (go && b && b.isConnected && typeof b.focus === 'function') b.focus();
  };
  // Bumped when the browser closed it while open was true: open again, unless the parent said false.
  const [reopened, reopen] = React.useState(0);
  useIsoLayoutEffect(() => {
    const d = el.current;
    if (!d) return;
    if (open && !d.open) {
      if (!back.current) back.current = deepActive() as HTMLElement | null;   // kept when it opens again (inside a shadow root, not its host)
      // It renders where it's placed: inside a page <form>, its own form nests in that one (Enter reloads the page) and
      // Enter in its field submits the page's form, as with Popover.
      if (process.env.NODE_ENV !== 'production' && d.parentElement?.closest('form') && d.querySelector('form, textarea, input:not([type=checkbox], [type=radio], [type=hidden])')) warnOnce('overlay-in-form', "Drawer: it's inside a <form> and holds a form or a field, so Enter there submits the page's form, or reloads the page. Place the Drawer after the form.", 'Drawer:overlay-in-form');
      // Non-modal: shown in place (not the top layer), so it isn't on the modal stack and the page stays usable.
      if (!modal) { if (typeof d.show === 'function') d.show(); else d.setAttribute('open', ''); }
      else {
        modalOpening();
        if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
        modalOpened(d);
      }
      // A child's autoFocus ran while the dialog was still hidden, and showModal() then focused the first focusable
      // (the ×). React doesn't write the autofocus attribute, so data-autofocus (or autofocus in plain HTML) marks it;
      // initialFocus, when it points inside, wins over both.
      const want = initial.current && initial.current.current;
      const own = want && d.contains(want) ? want : d.querySelector<HTMLElement>('[data-autofocus], [autofocus]');
      if (own && typeof own.focus === 'function') own.focus();
    } else if (open) {
      // Already open: StrictMode ran the unmount cleanup (which took it off the modal stack) and mounts it again.
      if (modal) modalOpened(d);
    } else {
      // Non-modal, focus may have moved on to the page: it goes back only from inside the drawer.
      const inside = modal || d.contains(deepActive());
      if (d.open) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }
      modalClosed(d);
      giveBack(inside);
    }
  }, [open, reopened]);
  // Closed while unmounting: give focus back too, unless it's non-modal and focus had moved on to the page (focus
  // that was inside it has fallen to <body> by now, the drawer gone from the page).
  React.useEffect(() => { const d = el.current; return () => { if (d) modalClosed(d); const a = deepActive(); giveBack(isModal.current || !a || a === document.body || !!d && d.contains(a), true); }; }, []);

  // React passes a nested dialog's cancel and close up to this one, though the browser doesn't bubble them: only
  // this dialog's own count, or Escape in a Dialog or Drawer opened from inside it would close this one too.
  // A non-modal dialog gets no cancel event from Escape: its own keydown does it, for focus anywhere inside.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (rest.onKeyDown) rest.onKeyDown(e);
    if (modal || e.defaultPrevented || e.key !== 'Escape' || isComposing(e)) return;
    if (e.target instanceof Element && e.target.closest('dialog') !== e.currentTarget) return;   // a dialog opened from inside it
    e.preventDefault(); request('escape');
  };
  const onCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => { if (rest.onCancel) rest.onCancel(e); if (e.target !== e.currentTarget) return; e.preventDefault(); request('escape'); };
  // The browser can close it on its own (dialog.close(), a form with method="dialog", an Escape it doesn't let us
  // cancel, such as Chromium's second Escape with no click in between): if open is still true, ask to close. A
  // parent that keeps open true gets it shown again, so open stays the truth.
  const openNow = React.useRef(open); openNow.current = open;
  const onClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    if (rest.onClose) rest.onClose(e);
    if (e.target !== e.currentTarget) return;
    if (!e.currentTarget.open) modalClosed(e.currentTarget);
    if (!openNow.current || e.currentTarget.open) return;
    // unsaved: show it again now, so the question opens on top of it, and ask.
    if (unsaved.current) {
      const d = e.currentTarget;
      if (!modal) { if (typeof d.show === 'function') d.show(); }
      else { modalOpening(); if (typeof d.showModal === 'function') d.showModal(); modalOpened(d); }
      setAsking('api');
      return;
    }
    close('api');
    reopen((n) => n + 1);
  };
  // A press that starts on the panel (selecting text, say) and ends on the backdrop clicks the <dialog> too: only a
  // press that starts and ends on the backdrop counts.
  const downOnBackdrop = React.useRef(false);
  const onPointerDown = (e: React.PointerEvent<HTMLDialogElement>) => { if (rest.onPointerDown) rest.onPointerDown(e); downOnBackdrop.current = e.target === e.currentTarget && !wasDismissal(e.nativeEvent); };
  // Swipe to close: a touch drag toward the drawer's edge moves the panel with the finger. Let go past a third of
  // its size, or flick it, and it asks to close; otherwise it goes back. A drag across instead (a scroll, a
  // carousel), or one that starts in a field, is left alone; top and bottom drawers start it outside the body.
  // The speed is the finger's over the last 100ms, so a slow drag that ends in a flick counts, and a flick back
  // keeps it open. Let go, the panel carries on from under the finger at the finger's speed (fling.ts): out past its
  // edge and then closed, or back (no motion when reduced).
  const swipe = props.swipeToClose !== false;
  const horiz = side !== 'top' && side !== 'bottom';
  const settling = React.useRef<(() => void) | null>(null);
  // away: 1 when its edge is the right or bottom one. start and end read the page's direction when a drag starts.
  const shift = (d: number, away: number) => horiz ? d * away + 'px 0' : '0 ' + d * away + 'px';
  const drag = React.useRef<{ id: number; x: number; y: number; d: number; at: number; on: boolean; s: Samples; away: number } | null>(null);
  const onSwipeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const t = e.target as Element;
    // swipeToClose={false} turns off closing by a drag, not a sheet's drag between its stops.
    if ((!swipe && !snaps.length) || e.pointerType !== 'touch' || !e.isPrimary || t.closest('input, textarea, select, [contenteditable]')) return;
    if (!horiz && t.closest('.dk-drawer__body')) return;
    const away = side === 'start' || side === 'end' ? ((side === 'end') !== isRtl(e.currentTarget) ? 1 : -1) : side === 'right' || side === 'bottom' ? 1 : -1;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, d: 0, at: 0, on: false, s: [{ t: e.timeStamp, p: 0 }], away };
  };
  // A sheet (snapPoints) follows the finger by its height between its shortest and tallest stops, past the tallest
  // with growing resistance, and below the shortest it slides down instead, toward closing. Let go, it goes on to the
  // stop nearest where its momentum would take it; dragged below the shortest, a flick or a third of it closes it.
  const sheetPx = (i: number) => snaps[i]! * (el.current ? el.current.clientHeight : window.innerHeight);
  const sheetMove = (p: HTMLElement, g: NonNullable<typeof drag.current>) => {
    const low = sheetPx(0), high = sheetPx(snaps.length - 1), h = sheetPx(snapAt) - g.d;
    g.at = h >= low ? 0 : swipe ? low - h : rubber(low - h, INWARD);   // without swipeToClose, it resists going down
    p.style.height = (h > high ? high - rubber(high - h, INWARD) : Math.max(h, low)) + 'px';
    p.style.translate = g.at ? shift(g.at, g.away) : '';
  };
  // Settling never animates height (that lays the page out each frame): the panel takes the taller of where it is
  // and where it's going, at once, and slides by translate so its top moves from one to the other. Then the stop's
  // own height takes over. at: how far below its height it shows now (a drag below the shortest stop).
  const glide = (p: HTMLElement, from: number, at: number, to: number, v: number, done: () => void) => {
    const tall = Math.max(from, to), dist = Math.abs(to - from) + at;
    p.style.transition = 'none';   // the start is placed at once: from the handle, no drag has turned transitions off
    p.style.height = tall + 'px';
    p.style.translate = shift(tall - from + at, 1);
    p.style.setProperty('--dk-drawer-settle', settleTime(dist, Math.abs(v)) + 'ms');
    void p.offsetHeight;   // the start, laid out before the transition's end is set
    p.style.transition = '';
    p.dataset.settling = '';
    const finish = () => { delete p.dataset.settling; p.style.height = ''; p.style.translate = ''; done(); };
    if (!dist || !parseFloat(getComputedStyle(p).transitionDuration)) { finish(); return; }
    const end = (ev: TransitionEvent) => { if (ev.target === p && ev.propertyName === 'translate') { stop(); finish(); } };
    const stop = () => { p.removeEventListener('transitionend', end); delete p.dataset.settling; settling.current = null; };
    p.addEventListener('transitionend', end);
    settling.current = stop;
    p.style.translate = tall - to ? shift(tall - to, 1) : '';
  };
  const sheetEnd = (p: HTMLElement, g: NonNullable<typeof drag.current>, v: number, released: boolean) => {
    const low = sheetPx(0), h = sheetPx(snapAt) - g.d, rest = h - (released ? project(v) : 0);
    // Only a drag that took it below its shortest stop can close it: a fast one down from a taller stop stops there.
    const out = swipe && released && h < low && (v > FLICK || rest < low * 2 / 3);
    if (!out) {
      let to = snapAt;
      snaps.forEach((_, i) => { if (Math.abs(sheetPx(i) - rest) < Math.abs(sheetPx(to) - rest)) to = i; });
      glide(p, p.offsetHeight, g.at, sheetPx(to), v, () => {});
      toSnap(to);
      return;
    }
    const done = () => {
      delete p.dataset.settling;
      if (unsaved.current) { p.style.height = ''; p.style.translate = ''; request('swipe'); return; }
      close('swipe'); requestAnimationFrame(() => requestAnimationFrame(() => { if (!drag.current) { p.style.height = ''; p.style.translate = ''; } }));
    };
    const dist = p.offsetHeight - g.at;
    p.style.setProperty('--dk-drawer-settle', settleTime(dist, Math.abs(v)) + 'ms');
    p.dataset.settling = '';
    if (!dist || !parseFloat(getComputedStyle(p).transitionDuration)) { done(); return; }
    const end = (ev: TransitionEvent) => { if (ev.target === p && ev.propertyName === 'translate') { stop(); done(); } };
    const stop = () => { p.removeEventListener('transitionend', end); delete p.dataset.settling; settling.current = null; };
    p.addEventListener('transitionend', end);
    settling.current = stop;
    p.style.translate = shift(p.offsetHeight, g.away);
  };
  // The handle: the next stop, gliding there as a let-go drag does.
  const panel = React.useRef<HTMLDivElement | null>(null);
  const onHandle = () => {
    const i = snapAt < snaps.length - 1 ? snapAt + 1 : 0, p = panel.current;
    if (p && props.snap === undefined) { if (settling.current) settling.current(); glide(p, p.offsetHeight, 0, sheetPx(i), 0, () => {}); }
    toSnap(i);
  };
  const onSwipeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g || e.pointerId !== g.id) return;
    const d = (horiz ? e.clientX - g.x : e.clientY - g.y) * g.away, across = Math.abs(horiz ? e.clientY - g.y : e.clientX - g.x);
    if (!g.on) {
      if (across > 10 && across > Math.abs(d)) { drag.current = null; return; }
      if (Math.abs(d) < 10) return;
      g.on = true;
      e.currentTarget.setAttribute('data-dragging', '');   // follows the finger, with no transition behind it
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* a pointer that already ended */ }
      // Caught while it settles: it stays under the finger, and that settle never finishes.
      if (settling.current) settling.current();
    }
    g.d = d;
    track(g.s, e.timeStamp, d);
    if (snaps.length) { sheetMove(e.currentTarget, g); return; }
    // Inward it gives a little and resists (KW5a), as Carousel's ends do, up to INWARD px; while it's inward
    // (data-inward), the panel's ::after (a copy of its background past its edge) fills the gap behind it.
    g.at = d >= 0 ? d : rubber(d, INWARD);
    e.currentTarget.style.translate = shift(g.at, g.away);
    e.currentTarget.toggleAttribute('data-inward', g.at < 0);
  };
  const onSwipeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g || e.pointerId !== g.id) return;
    drag.current = null;
    const p = e.currentTarget, size = horiz ? p.offsetWidth : p.offsetHeight;
    p.removeAttribute('data-dragging');
    if (!g.on) { p.style.translate = ''; delete p.dataset.inward; return; }
    const v = speed(g.s);   // px per ms, toward the edge
    if (snaps.length) { sheetEnd(p, g, v, e.type === 'pointerup'); return; }
    // Where it would come to rest with the momentum it was let go with (KW11), as a scroll would: past a third, it
    // closes, so a slow drag still moving that way goes on to close instead of springing back at its last pixel.
    const out = e.type === 'pointerup' && (v > FLICK || (g.d + project(v) > size / 3 && v > -0.1));
    const left = out ? size - g.at : Math.abs(g.at);
    const done = () => {
      delete p.dataset.settling;
      delete p.dataset.inward;
      if (!out) { p.style.translate = ''; return; }
      // unsaved: it comes back, and asks.
      if (unsaved.current) { p.style.translate = ''; request('swipe'); return; }
      close('swipe');
      // Back in place once it's closed (two frames: the close renders first), so it opens from the edge next time.
      requestAnimationFrame(() => requestAnimationFrame(() => { if (!drag.current) p.style.translate = ''; }));
    };
    // Carries on at the finger's speed when it was moving that way; from a stop or a flick back, briskly.
    p.style.setProperty('--dk-drawer-settle', settleTime(left, (out ? v : -v) > 0 ? v : 0) + 'ms');
    p.dataset.settling = '';
    if (!left || !parseFloat(getComputedStyle(p).transitionDuration)) { done(); return; }
    const end = (ev: TransitionEvent) => { if (ev.target === p && ev.propertyName === 'translate') { stop(); done(); } };
    const stop = () => { p.removeEventListener('transitionend', end); delete p.dataset.settling; settling.current = null; };
    p.addEventListener('transitionend', end);
    settling.current = stop;
    p.style.translate = out ? shift(size, g.away) : '';
  };
  const onClick = (e: React.MouseEvent<HTMLDialogElement>) => { if (rest.onClick) rest.onClick(e); if (backdrop && downOnBackdrop.current && e.target === e.currentTarget && !wasDismissal(e.nativeEvent)) request('outside'); downOnBackdrop.current = false; };
  // A body taller than the panel takes Tab focus, so it can be scrolled from the keyboard when nothing in it is
  // focusable (only Chromium scrolls it with focus on the ×). It's a region named like the drawer, as Table's frame is.
  const [body, setBody] = React.useState<HTMLDivElement | null>(null);
  const scrolls = useScrolls(body);
  const named = rest['aria-labelledby'] || (has(props.title) ? base + '-title' : undefined);
  const region = !scrolls ? {} : named ? { tabIndex: 0, role: 'region', 'aria-labelledby': named }
    : rest['aria-label'] ? { tabIndex: 0, role: 'region', 'aria-label': rest['aria-label'] } : { tabIndex: 0 };
  const mergedRef = useMergedRef(ref, (n) => { el.current = n; nameRef(n); restyle(n); });
  return (
    <dialog {...rest} ref={mergedRef}
      aria-modal={modal ? 'true' : undefined}
      aria-labelledby={rest['aria-labelledby'] || (has(props.title) ? base + '-title' : undefined)}
      aria-describedby={rest['aria-describedby'] || (has(props.description) ? base + '-desc' : undefined)}
      className={cn('dk-drawer', 'dk-drawer--' + side, 'dk-drawer--' + size, !modal && 'dk-drawer--nonmodal', snaps.length > 0 && 'dk-drawer--snaps', props.className)} data-component="drawer" data-state={open ? 'open' : 'closed'} data-side={side} data-size={size} data-instant={arrived.current ? '' : undefined}
      onKeyDown={onKeyDown} onCancel={onCancel} onClose={onClose} onPointerDown={onPointerDown} onClick={onClick}>
      <div ref={panel} className="dk-drawer__panel" data-snap={snaps.length ? snapAt : undefined} style={snaps.length ? { '--dk-drawer-snap': snaps[snapAt] } as React.CSSProperties : undefined} onPointerDown={onSwipeDown} onPointerMove={onSwipeMove} onPointerUp={onSwipeEnd} onPointerCancel={onSwipeEnd}>
        {snaps.length > 1 ? (
          <button type="button" className="dk-drawer__handle" aria-label={snapAt < snaps.length - 1 ? sds.labels.drawerExpand : sds.labels.drawerCollapse}
            onClick={onHandle}><span className="dk-drawer__grip" aria-hidden="true" /></button>
        ) : null}
        {has(props.title) || has(props.description) || showClose ? (
          <div className="dk-drawer__header">
            <div className="dk-drawer__heading">
              {has(props.title) ? <h2 className="dk-drawer__title" id={base + '-title'}>{props.title}</h2> : null}
              {has(props.description) ? <p className="dk-drawer__description" id={base + '-desc'}>{props.description}</p> : null}
            </div>
            {showClose ? <IconButton className="dk-drawer__close" icon={icons.Close} label={props.closeLabel || sds.labels.close} size="sm" hideTitle onClick={() => request('close')} /> : null}
          </div>
        ) : null}
        {has(props.children) ? <div {...region} ref={setBody} className="dk-drawer__body">{props.children}</div> : null}
        {has(props.footer) ? <div className="dk-drawer__footer">{props.footer}</div> : null}
      </div>
      {props.unsaved || asking ? <Discard open={!!asking && open} onKeep={() => setAsking(null)} onDiscard={() => { const why = asking || 'close'; setAsking(null); close(why); }} /> : null}
    </dialog>
  );
});
