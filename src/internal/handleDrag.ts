import * as React from 'react';

/** A press on a drag handle: where it started (sx, sy), where the pointer is now (x, y), where on its row it was
    taken (gx, gy, from the row's top left), and whether it has moved far enough to be a drag. */
export interface HandlePointer { id: number; key: string | number; sx: number; sy: number; x: number; y: number; gx: number; gy: number; moved: boolean }

interface DragHandlers {
  /** Which way a press has to move before it's a drag: along the list's axis only, or any way (a board). */
  axis: 'x' | 'y' | 'both';
  /** Places the dragged row under the pointer: on each move, and after a scroll. */
  place: (p: HandlePointer) => void;
  /** Scrolls what's under the pointer near its edge, once a frame while dragging; true when anything scrolled. */
  scroll: (p: HandlePointer) => boolean;
  /** Let go (or canceled) after a drag, with the pointer where it was let go. */
  end: (p: HandlePointer, cancel: boolean) => void;
}

const EDGE = 48;   // px from a scrolling edge where a drag starts scrolling
const STEP = 16;   // px per frame at the very edge
const SLOP = 4;    // px a press moves before it counts as a drag

/** Scrolls box along one axis when `at` is near its edge (lo to hi), faster the closer it is; true when it moved. */
export function edgeScroll(box: Element, horizontal: boolean, at: number, lo: number, hi: number): boolean {
  const edge = Math.min(EDGE, (hi - lo) / 4);
  const by = at < lo + edge ? -Math.ceil((lo + edge - at) / edge * STEP) : at > hi - edge ? Math.ceil((at - hi + edge) / edge * STEP) : 0;
  if (!by) return false;
  const before = horizontal ? box.scrollLeft : box.scrollTop;
  if (horizontal) box.scrollLeft = before + by; else box.scrollTop = before + by;
  return (horizontal ? box.scrollLeft : box.scrollTop) !== before;
}

/* The pointer half of a reorderable list's drag handles (SortableList, Kanban): a press that moves a few pixels is a
   drag, followed on the window (the row moves in the DOM as the order changes, which would drop a pointer capture),
   scrolling near an edge once a frame, until it's let go or canceled. draggedRef is true from the first move until
   the click that ends it, so that click doesn't also pick the row up; pointerRef is the press while it lasts. */
export function useHandleDrag() {
  const pointerRef = React.useRef<HandlePointer | null>(null);
  const draggedRef = React.useRef(false);
  const stop = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => { if (stop.current) stop.current(); }, []);
  const begin = (key: string | number, e: React.PointerEvent<HTMLElement>, row: Element, h: DragHandlers) => {
    const b = row.getBoundingClientRect();
    pointerRef.current = { id: e.pointerId, key, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, gx: e.clientX - b.left, gy: e.clientY - b.top, moved: false };
    let frame = 0;
    const tick = () => {
      frame = 0;
      const p = pointerRef.current;
      if (!p || !p.moved) return;
      if (h.scroll(p)) h.place(p);
      frame = requestAnimationFrame(tick);
    };
    const move = (ev: PointerEvent) => {
      const p = pointerRef.current;
      if (!p || p.id !== ev.pointerId) return;
      p.x = ev.clientX; p.y = ev.clientY;
      const far = h.axis === 'x' ? Math.abs(p.x - p.sx) : h.axis === 'y' ? Math.abs(p.y - p.sy) : Math.hypot(p.x - p.sx, p.y - p.sy);
      if (!p.moved && far < SLOP) return;
      p.moved = true;
      draggedRef.current = true;
      ev.preventDefault();
      h.place(p);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const end = (cancel: boolean) => (ev: PointerEvent) => {
      const p = pointerRef.current;
      if (!p || p.id !== ev.pointerId) return;
      off();
      if (!p.moved) return;
      setTimeout(() => { draggedRef.current = false; });   // no click came after it (let go off the handle)
      // Placed where it's let go, not where the last render put it: a release right after a move comes before that
      // move's render.
      p.x = ev.clientX; p.y = ev.clientY;
      h.end(p, cancel);
    };
    const up = end(false), cancel = end(true);
    const off = () => {
      pointerRef.current = null; stop.current = null;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel);
    };
    if (stop.current) stop.current();
    stop.current = off;
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cancel);
  };
  return { pointerRef, draggedRef, begin };
}
