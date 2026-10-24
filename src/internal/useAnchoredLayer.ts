import * as React from "react";
import { useIsoLayoutEffect } from "./cn";
import { cssLength, hideLayer, placeLayer, showLayer, type Placement } from "./position";

type Ref = React.RefObject<HTMLElement | null>;

export interface AnchoredLayerOptions {
  /** Where the layer goes; an unknown or missing value becomes `fallback`. */
  placement?: Placement;
  /** The placement when `placement` is missing (default "bottom"). */
  fallback?: Placement;
  /** The custom property holding the gap between anchor and layer, such as "--dk-menu-offset". */
  offsetVar: string;
  /** Called on a press outside the layer and `inside`. */
  onOutside?: () => void;
  /** An element a press on doesn't count as outside, such as the button that opens the layer. */
  inside?: Ref;
  /** Keeps the layer at least as wide as the anchor, as a list under its field. */
  matchWidth?: boolean;
  /** A value that changes the layer's size when it changes (a tooltip's text): it is placed again. */
  watch?: unknown;
}

/** Shows `layer` in the top layer next to `anchor` while open, following scrolls, resizes and size changes;
    a press outside the layer (and `inside`) calls onOutside. Focus is the caller's: do it in a layout effect
    declared after this hook, which runs once the layer is shown and placed. */
export function useAnchoredLayer(open: boolean, layer: Ref, anchor: Ref, opts: AnchoredLayerOptions): void {
  const { placement, fallback = "bottom", offsetVar, inside, matchWidth, watch } = opts;
  const outside = React.useRef(opts.onOutside);
  useIsoLayoutEffect(() => { outside.current = opts.onOutside; });
  useIsoLayoutEffect(() => {
    const p = layer.current, a = anchor.current;
    if (!p) return;
    if (!open || !a) { hideLayer(p); return; }
    showLayer(p);
    const update = () => {
      if (matchWidth) p.style.minWidth = a.offsetWidth + "px";
      placeLayer(p, a, placement, cssLength(p, offsetVar), fallback);
    };
    // Scrolling inside the layer doesn't move it.
    const scrolled = (e: Event) => { if (!(e.target instanceof Node && p.contains(e.target))) update(); };
    update();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    if (ro) { ro.observe(p); ro.observe(a); }
    window.addEventListener("scroll", scrolled, true); window.addEventListener("resize", update);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("scroll", scrolled, true); window.removeEventListener("resize", update); };
  }, [open, layer, anchor, placement, fallback, offsetVar, matchWidth, watch]);
  React.useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      for (const r of [layer, inside]) if (r && r.current && r.current.contains(t)) return;
      if (outside.current) outside.current();
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open, layer, inside]);
}
