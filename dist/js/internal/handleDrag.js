// src/internal/handleDrag.ts
import * as React from "react";
var EDGE = 48;
var STEP = 16;
var SLOP = 4;
function edgeScroll(box, horizontal, at, lo, hi) {
  const edge = Math.min(EDGE, (hi - lo) / 4);
  const by = at < lo + edge ? -Math.ceil((lo + edge - at) / edge * STEP) : at > hi - edge ? Math.ceil((at - hi + edge) / edge * STEP) : 0;
  if (!by) return false;
  const before = horizontal ? box.scrollLeft : box.scrollTop;
  if (horizontal) box.scrollLeft = before + by;
  else box.scrollTop = before + by;
  return (horizontal ? box.scrollLeft : box.scrollTop) !== before;
}
function useHandleDrag() {
  const pointerRef = React.useRef(null);
  const draggedRef = React.useRef(false);
  const stop = React.useRef(null);
  React.useEffect(() => () => {
    if (stop.current) stop.current();
  }, []);
  const begin = (key, e, row, h) => {
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
    const move = (ev) => {
      const p = pointerRef.current;
      if (!p || p.id !== ev.pointerId) return;
      p.x = ev.clientX;
      p.y = ev.clientY;
      const far = h.axis === "x" ? Math.abs(p.x - p.sx) : h.axis === "y" ? Math.abs(p.y - p.sy) : Math.hypot(p.x - p.sx, p.y - p.sy);
      if (!p.moved && far < SLOP) return;
      p.moved = true;
      draggedRef.current = true;
      ev.preventDefault();
      h.place(p);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const end = (cancel2) => (ev) => {
      const p = pointerRef.current;
      if (!p || p.id !== ev.pointerId) return;
      off();
      if (!p.moved) return;
      setTimeout(() => {
        draggedRef.current = false;
      });
      p.x = ev.clientX;
      p.y = ev.clientY;
      h.end(p, cancel2);
    };
    const up = end(false), cancel = end(true);
    const off = () => {
      pointerRef.current = null;
      stop.current = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
    if (stop.current) stop.current();
    stop.current = off;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  };
  return { pointerRef, draggedRef, begin };
}
export {
  edgeScroll,
  useHandleDrag
};
//# sourceMappingURL=handleDrag.js.map
