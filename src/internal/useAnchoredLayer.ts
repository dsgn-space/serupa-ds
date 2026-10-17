import * as React from "react";
import { useIsoLayoutEffect } from "./cn";
import { cssLength, hideLayer, place, showLayer, type Placement } from "./position";

/** Shows `layer` in the top layer next to `anchor` while open, following scrolls, resizes and size changes;
    a press outside both (and `inside`, such as the button that opens it) calls onOutside. */
export function useAnchoredLayer(open: boolean, layer: React.RefObject<HTMLElement | null>, anchor: React.RefObject<HTMLElement | null>, opts: { placement: Placement; offsetVar: string; onOutside: () => void; inside?: React.RefObject<HTMLElement | null> }): void {
  const outside = React.useRef(opts.onOutside); outside.current = opts.onOutside;
  useIsoLayoutEffect(() => {
    const p = layer.current, a = anchor.current;
    if (!p) return;
    if (!open || !a) { hideLayer(p); return; }
    showLayer(p);
    const update = () => {
      const r = place(a.getBoundingClientRect(), { width: p.offsetWidth, height: p.offsetHeight }, opts.placement, cssLength(p, opts.offsetVar), "bottom");
      p.style.left = r.x + "px"; p.style.top = r.y + "px"; p.dataset.side = r.side;
    };
    update();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    if (ro) { ro.observe(p); ro.observe(a); }
    window.addEventListener("scroll", update, true); window.addEventListener("resize", update);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (layer.current && layer.current.contains(t)) return;
      if (opts.inside && opts.inside.current && opts.inside.current.contains(t)) return;
      outside.current();
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open]);
}
