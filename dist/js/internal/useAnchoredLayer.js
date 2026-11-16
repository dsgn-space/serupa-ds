// src/internal/useAnchoredLayer.ts
import * as React from "react";
import { useIsoLayoutEffect } from "./cn.js";
import { onFontsLoaded } from "./fontsLoaded.js";
import { markDismissal } from "./layers.js";
import { anchorName, cssLength, firstSide, hideLayer, isRtl, placeLayer, showLayer } from "./position.js";
var TOP = ":popover-open, :modal";
function clippers(a) {
  const out = [];
  for (let e = a.parentElement; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.overflowX !== "visible" || cs.overflowY !== "visible") out.push(e);
    if (inTopLayer(e)) break;
  }
  return out;
}
function inTopLayer(e) {
  try {
    return e.matches(TOP);
  } catch {
    return false;
  }
}
function anchorGone(a, clips) {
  const r = a.getBoundingClientRect();
  if (!r.width && !r.height) return false;
  let top = 0, left = 0, bottom = window.innerHeight, right = window.innerWidth;
  for (const c of clips) {
    const b = c.getBoundingClientRect();
    top = Math.max(top, b.top);
    left = Math.max(left, b.left);
    bottom = Math.min(bottom, b.bottom);
    right = Math.min(right, b.right);
  }
  return r.bottom <= top || r.top >= bottom || r.right <= left || r.left >= right;
}
var anchorable;
var canAnchor = () => anchorable ??= typeof CSS !== "undefined" && CSS.supports("top", "anchor(--a top, 0px)");
function useAnchoredLayer(open, layer, anchor, opts) {
  const { placement, fallback = "bottom", offsetVar, inside, matchWidth, watch, docked, closeRequest = true } = opts;
  const outside = React.useRef(opts.onOutside), focusOutside = React.useRef(opts.onFocusOutside);
  useIsoLayoutEffect(() => {
    outside.current = opts.onOutside;
    focusOutside.current = opts.onFocusOutside;
  });
  useIsoLayoutEffect(() => {
    const p = layer.current, a = anchor.current;
    if (!p) return;
    if (!open || !a) {
      hideLayer(p);
      return;
    }
    if (docked) {
      for (const k of ["left", "top", "max-height", "max-width", "overflow-y", "min-width", "visibility"]) p.style.removeProperty(k);
      p.setAttribute("data-side", "bottom");
      showLayer(p);
      return;
    }
    firstSide(p, (placement || fallback || "bottom").split("-")[0] ?? "bottom");
    showLayer(p);
    let offset = 0, rtl = false, clips = [];
    const measure = () => {
      offset = cssLength(p, offsetVar);
      rtl = isRtl(a);
      clips = clippers(a);
    };
    const named = a instanceof HTMLElement && canAnchor() ? anchorName(a) : void 0, name = named && named[0];
    const update = () => {
      const gone = anchorGone(a, clips);
      p.style.visibility = gone ? "hidden" : "";
      if (gone) return;
      if (matchWidth) p.style.minWidth = a.offsetWidth + "px";
      placeLayer(p, a, placement, offset, fallback, rtl, name);
    };
    const resized = () => {
      measure();
      update();
    };
    const scrolled = (e) => {
      if (!(e.target instanceof Node && p.contains(e.target))) update();
    };
    resized();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(resized) : null;
    if (ro) {
      ro.observe(p);
      ro.observe(a);
    }
    window.addEventListener("scroll", scrolled, true);
    window.addEventListener("resize", resized);
    const fontsOff = onFontsLoaded(resized);
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", resized);
      vv.addEventListener("scroll", update);
    }
    return () => {
      if (named) named[1]();
      if (ro) ro.disconnect();
      window.removeEventListener("scroll", scrolled, true);
      window.removeEventListener("resize", resized);
      fontsOff();
      if (vv) {
        vv.removeEventListener("resize", resized);
        vv.removeEventListener("scroll", update);
      }
    };
  }, [open, layer, anchor, placement, fallback, offsetVar, matchWidth, watch, docked]);
  React.useEffect(() => {
    if (!open) return;
    const within = (t, refs) => refs.some((r) => !!r && !!r.current && t instanceof Node && r.current.contains(t));
    let touch = false;
    const down = (e) => {
      touch = false;
      if (within(e.target, [layer, inside])) return;
      if (e.pointerType === "touch") touch = true;
      else if (outside.current) {
        markDismissal(e);
        outside.current();
      }
    };
    const cancel = () => {
      touch = false;
    };
    const click = (e) => {
      if (!touch) return;
      touch = false;
      if (!within(e.target, [layer, inside]) && outside.current) {
        markDismissal(e);
        outside.current();
      }
    };
    const focus = (e) => {
      if (focusOutside.current && !within(e.target, [layer, anchor, inside])) focusOutside.current();
    };
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("pointercancel", cancel, true);
    document.addEventListener("click", click, true);
    document.addEventListener("focusin", focus, true);
    const box = layer.current && layer.current.parentElement && layer.current.parentElement.closest("dialog");
    const shut = () => {
      if (outside.current) outside.current();
    };
    if (box) box.addEventListener("close", shut);
    const W = closeRequest && typeof window !== "undefined" ? Reflect.get(window, "CloseWatcher") : void 0;
    let watcher = null;
    try {
      watcher = W ? new W() : null;
    } catch {
      watcher = null;
    }
    if (watcher) {
      watcher.onclose = () => {
        if (!layer.current || layer.current.hidden) return;
        const f = document.activeElement, to = within(f, [layer, anchor, inside]) ? f : layer.current;
        const esc = new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true });
        if (to) to.dispatchEvent(esc);
        if (!esc.defaultPrevented && outside.current) outside.current();
      };
    }
    return () => {
      if (watcher) {
        watcher.onclose = null;
        watcher.destroy();
      }
      if (box) box.removeEventListener("close", shut);
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointercancel", cancel, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("focusin", focus, true);
    };
  }, [open, layer, anchor, inside, closeRequest]);
}
export {
  useAnchoredLayer
};
//# sourceMappingURL=useAnchoredLayer.js.map
