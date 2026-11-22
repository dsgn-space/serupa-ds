"use client";

// src/components/Splitter/Splitter.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { announce } from "../../internal/announce.js";
import { useMergedRef, cn, domId, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { useScrolls } from "../../internal/useScrolls.js";
import { warnOnce } from "../../internal/warn.js";
import { en as words } from "./labels.js";
import { clickAfterDrag } from "../../internal/timing.js";
import { activeIn } from "../../internal/root.js";
var clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
var read = (key) => {
  if (!key) return null;
  try {
    const n = parseFloat(window.localStorage.getItem(key) || "");
    return isFinite(n) ? n : null;
  } catch {
    return null;
  }
};
var never = () => () => {
};
var noSaved = () => null;
var save = (key, n) => {
  if (!key) return;
  try {
    window.localStorage.setItem(key, String(n));
  } catch {
  }
};
function SplitterRender(t0) {
  const $ = _c(64);
  const {
    ref,
    ...props
  } = t0;
  const {
    children,
    orientation: oriIn,
    size: sizeIn,
    defaultSize,
    onSizeChange,
    min: minIn,
    max: maxIn,
    step: stepIn,
    collapsible,
    storageKey,
    separatorLabel,
    className,
    ...rest
  } = props;
  const sds = useSettings(words);
  const styled = useServerStyles();
  const direction = oriIn === "vertical" ? "vertical" : "horizontal";
  const min = clamp(typeof minIn === "number" && isFinite(minIn) ? minIn : 10, 0, 100);
  const max = clamp(typeof maxIn === "number" && isFinite(maxIn) ? maxIn : 90, min, 100);
  const step = typeof stepIn === "number" && stepIn > 0 ? stepIn : 5;
  const fit = (n) => clamp(n, min, max);
  const controlled = sizeIn !== void 0;
  const [own, setOwn] = React.useState(() => defaultSize === 0 && collapsible ? 0 : fit(typeof defaultSize === "number" && isFinite(defaultSize) ? defaultSize : 50));
  const saved = React.useSyncExternalStore(never, () => read(storageKey), noSaved);
  const [movedUnder, setMovedUnder] = React.useState(null);
  const kept = saved != null && movedUnder !== storageKey ? saved === 0 && collapsible ? 0 : fit(saved) : own;
  const size = controlled ? sizeIn === 0 && collapsible ? 0 : fit(sizeIn) : kept;
  const [restore, setRestore] = React.useState(() => size || fit(50));
  if (size > 0 && size !== restore) {
    setRestore(size);
  }
  const root = React.useRef(null);
  const base = domId("srp-splitter", React.useId());
  const panes = React.Children.toArray(children);
  if (process.env.NODE_ENV !== "production" && panes.length !== 2) {
    warnOnce("splitter-two", "Splitter: give it exactly two children, the two panes (it got " + panes.length + ").");
  }
  const change = (n_0) => {
    setSlide(null);
    const next = Math.round(n_0 * 100) / 100;
    if (next === size) {
      return;
    }
    if (!controlled) {
      setOwn(next);
      setMovedUnder(storageKey);
      save(storageKey, next);
    }
    if (onSizeChange) {
      onSizeChange(next);
    }
  };
  const collapsed = size === 0;
  const rtl = _temp;
  const [slide, t1] = React.useState(null);
  const setSlide = t1;
  let t2;
  if ($[0] !== direction) {
    t2 = (n_1) => direction === "horizontal" ? n_1.offsetWidth : n_1.offsetHeight;
    $[0] = direction;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const extent = t2;
  const offset = () => {
    const h = handle.current;
    const t = h ? getComputedStyle(h).translate : "none";
    if (!h || !t || t === "none") {
      return 0;
    }
    const v = parseFloat(t.split(" ")[direction === "horizontal" ? 0 : 1] || "0") || 0;
    return direction === "horizontal" && rtl(h) ? -v : v;
  };
  const toggle = () => {
    if (!collapsible) {
      return;
    }
    const closing = size > 0;
    const at = slide ? offset() : 0;
    change(closing ? 0 : restore);
    const moves = paneB && parseFloat(getComputedStyle(paneB).transitionDuration) > 0;
    setSlide(moves ? {
      to: closing ? "closed" : "open",
      px: closing && paneA ? extent(paneA) : 0,
      at,
      run: false,
      back: direction === "horizontal" && root.current && rtl(root.current) ? -1 : 1
    } : null);
  };
  const onKeyDown = (e_0) => {
    if (e_0.altKey || e_0.ctrlKey || e_0.metaKey) {
      return;
    }
    const horizontal = direction === "horizontal";
    const back = horizontal ? rtl(e_0.currentTarget) ? "ArrowRight" : "ArrowLeft" : "ArrowUp";
    const on = horizontal ? rtl(e_0.currentTarget) ? "ArrowLeft" : "ArrowRight" : "ArrowDown";
    let to = null;
    if (e_0.key === back) {
      to = collapsed ? 0 : fit(size - step);
    } else {
      if (e_0.key === on) {
        to = collapsed ? min : fit(size + step);
      } else {
        if (e_0.key === "Home") {
          to = min;
        } else {
          if (e_0.key === "End") {
            to = max;
          } else {
            if (e_0.key === "Enter" && collapsible) {
              e_0.preventDefault();
              toggle();
              return;
            } else {
              if (e_0.key === "Escape" && placing) {
                e_0.preventDefault();
                e_0.stopPropagation();
                setPlacing(false);
                return;
              }
            }
          }
        }
      }
    }
    if (to == null) {
      return;
    }
    e_0.preventDefault();
    change(to);
  };
  const drag = React.useRef(null);
  const [t3, t4] = React.useState(false);
  const placing = t3;
  const setPlacing = t4;
  const handle = React.useRef(null);
  const reach = (e_1, r) => direction === "horizontal" ? rtl(root.current) ? r.right - e_1.clientX : e_1.clientX - r.left : e_1.clientY - r.top;
  const at_0 = (e_2, t5) => {
    const off = t5 === void 0 ? 0 : t5;
    const r_0 = root.current.getBoundingClientRect();
    return fit((reach(e_2, r_0) - off) / ((direction === "horizontal" ? r_0.width : r_0.height) || 1) * 100);
  };
  const onPointerDown = (e_3) => {
    if (e_3.button !== 0) {
      return;
    }
    e_3.preventDefault();
    e_3.currentTarget.focus();
    drag.current = {
      id: e_3.pointerId,
      x: e_3.clientX,
      y: e_3.clientY,
      moved: false,
      off: reach(e_3, e_3.currentTarget.getBoundingClientRect())
    };
    try {
      e_3.currentTarget.setPointerCapture(e_3.pointerId);
    } catch {
    }
  };
  const onPointerMove = (e_4) => {
    const d = drag.current;
    if (!d || d.id !== e_4.pointerId) {
      return;
    }
    if (!d.moved && Math.abs(e_4.clientX - d.x) + Math.abs(e_4.clientY - d.y) < 4) {
      return;
    }
    d.moved = true;
    setPlacing(false);
    change(at_0(e_4, d.off));
  };
  const onPointerUp = (e_5) => {
    const d_0 = drag.current;
    if (!d_0 || d_0.id !== e_5.pointerId) {
      return;
    }
    drag.current = null;
    if (d_0.moved || e_5.type === "pointercancel") {
      return;
    }
    if (!placing) {
      announce(sds.labels.splitterPlace);
    }
    setPlacing(!placing);
  };
  const onPlace = (e_6) => {
    if (rest.onPointerDownCapture) {
      rest.onPointerDownCapture(e_6);
    }
    if (!placing || e_6.button !== 0 || handle.current && handle.current.contains(e_6.target)) {
      return;
    }
    e_6.preventDefault();
    e_6.stopPropagation();
    const swallow = _temp2;
    window.addEventListener("click", swallow, {
      capture: true,
      once: true
    });
    setTimeout(() => window.removeEventListener("click", swallow, {
      capture: true
    }), clickAfterDrag);
    setPlacing(false);
    change(at_0(e_6));
    if (handle.current) {
      handle.current.focus();
    }
  };
  const first = base + "-first";
  const [t6, setPaneA] = React.useState(null);
  const paneA = t6;
  const [t7, setPaneB] = React.useState(null);
  const paneB = t7;
  const scrollsA = useScrolls(paneA);
  const scrollsB = useScrolls(paneB);
  const focusedIn = React.useRef(false);
  useIsoLayoutEffect(() => {
    if (!collapsed || !paneA || !handle.current) {
      return;
    }
    const active = activeIn(paneA);
    if (paneA.contains(active) || (!active || active === document.body) && focusedIn.current) {
      handle.current.focus();
    }
    focusedIn.current = false;
  }, [collapsed, paneA]);
  useIsoLayoutEffect(() => {
    if (!slide || slide.run) {
      return;
    }
    if (slide.to === "closed" !== collapsed) {
      setSlide(null);
      return;
    }
    if (!slide.px) {
      if (paneA && extent(paneA)) {
        setSlide({
          ...slide,
          px: extent(paneA)
        });
      } else {
        setSlide(null);
      }
      return;
    }
    let f = requestAnimationFrame(() => {
      f = requestAnimationFrame(() => setSlide({
        ...slide,
        run: true
      }));
    });
    return () => cancelAnimationFrame(f);
  });
  React.useEffect(() => {
    if (!slide || !slide.run || !paneB) {
      return;
    }
    const t_0 = window.setTimeout(() => setSlide(null), Math.max(...getComputedStyle(paneB).transitionDuration.split(",").map(_temp3)) + 100);
    return () => window.clearTimeout(t_0);
  }, [slide, paneB]);
  const sliding = slide && slide.px ? slide : null;
  let t8;
  if ($[2] !== direction) {
    t8 = (v_0) => direction === "horizontal" ? v_0 + "px 0" : "0 " + v_0 + "px";
    $[2] = direction;
    $[3] = t8;
  } else {
    t8 = $[3];
  }
  const along = t8;
  const back_0 = sliding ? sliding.back : 1;
  let t9;
  if ($[4] !== back_0 || $[5] !== direction) {
    t9 = (x) => direction === "vertical" ? "inset(0 0 " + x + " 0)" : back_0 < 0 ? "inset(0 0 0 " + x + ")" : "inset(0 " + x + " 0 0)";
    $[4] = back_0;
    $[5] = direction;
    $[6] = t9;
  } else {
    t9 = $[6];
  }
  const clip = t9;
  const left = sliding ? Math.max(0, Math.min(2 * sliding.px, sliding.to === "open" ? sliding.px - sliding.at : sliding.px + sliding.at)) : 0;
  const slideStyle = sliding ? {
    "--srp-splitter-from": along((sliding.to === "open" ? -left : left) * back_0),
    "--srp-splitter-px": sliding.px + "px",
    "--srp-splitter-shut": clip("100%"),
    "--srp-splitter-clip-from": clip(Math.max(0, sliding.to === "open" ? left : sliding.px - left) + "px")
  } : null;
  const mergedRef = useMergedRef(ref, (n_2) => {
    root.current = n_2;
    styled(n_2);
  });
  const t10 = slideStyle ? {
    ...rest.style,
    ...slideStyle
  } : rest.style;
  const t11 = cn("srp-splitter", "srp-splitter--" + direction, className);
  const t12 = placing || void 0;
  const t13 = sliding ? sliding.run ? "run" : "start" : void 0;
  const t14 = sliding ? sliding.to : void 0;
  const t15 = scrollsA ? 0 : void 0;
  const t16 = size + "%";
  let t17;
  if ($[7] !== t16) {
    t17 = {
      flexBasis: t16
    };
    $[7] = t16;
    $[8] = t17;
  } else {
    t17 = $[8];
  }
  const t18 = collapsed && !(sliding && sliding.to === "closed") || void 0;
  const t19 = collapsed && !!sliding || void 0;
  let t20;
  let t21;
  if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t20 = () => {
      focusedIn.current = true;
    };
    t21 = (e_7) => {
      if (!e_7.currentTarget.contains(e_7.relatedTarget) && e_7.relatedTarget) {
        focusedIn.current = false;
      }
    };
    $[9] = t20;
    $[10] = t21;
  } else {
    t20 = $[9];
    t21 = $[10];
  }
  let t22;
  if ($[11] !== first || $[12] !== panes[0] || $[13] !== setPaneA || $[14] !== t15 || $[15] !== t17 || $[16] !== t18 || $[17] !== t19) {
    t22 = /* @__PURE__ */ React.createElement("div", { ref: setPaneA, id: first, tabIndex: t15, className: "srp-splitter__pane srp-splitter__pane--first", style: t17, hidden: t18, inert: t19, onFocus: t20, onBlur: t21 }, panes[0]);
    $[11] = first;
    $[12] = panes[0];
    $[13] = setPaneA;
    $[14] = t15;
    $[15] = t17;
    $[16] = t18;
    $[17] = t19;
    $[18] = t22;
  } else {
    t22 = $[18];
  }
  const t23 = direction === "horizontal" ? "vertical" : "horizontal";
  let t24;
  if ($[19] !== size) {
    t24 = Math.round(size);
    $[19] = size;
    $[20] = t24;
  } else {
    t24 = $[20];
  }
  let t25;
  if ($[21] !== collapsible || $[22] !== min) {
    t25 = collapsible ? 0 : Math.round(min);
    $[21] = collapsible;
    $[22] = min;
    $[23] = t25;
  } else {
    t25 = $[23];
  }
  let t26;
  if ($[24] !== max) {
    t26 = Math.round(max);
    $[24] = max;
    $[25] = t26;
  } else {
    t26 = $[25];
  }
  const t27 = separatorLabel || sds.labels.resizePanes;
  const t28 = collapsed ? "collapsed" : void 0;
  let t29;
  if ($[26] !== setPlacing) {
    t29 = () => setPlacing(false);
    $[26] = setPlacing;
    $[27] = t29;
  } else {
    t29 = $[27];
  }
  let t30;
  if ($[28] !== first || $[29] !== handle || $[30] !== onKeyDown || $[31] !== onPointerDown || $[32] !== onPointerMove || $[33] !== onPointerUp || $[34] !== t23 || $[35] !== t24 || $[36] !== t25 || $[37] !== t26 || $[38] !== t27 || $[39] !== t28 || $[40] !== t29 || $[41] !== toggle) {
    t30 = /* @__PURE__ */ React.createElement("div", { ref: handle, role: "separator", tabIndex: 0, className: "srp-splitter__handle", "aria-orientation": t23, "aria-valuenow": t24, "aria-valuemin": t25, "aria-valuemax": t26, "aria-controls": first, "aria-label": t27, "data-state": t28, onKeyDown, onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onDoubleClick: toggle, onBlur: t29 });
    $[28] = first;
    $[29] = handle;
    $[30] = onKeyDown;
    $[31] = onPointerDown;
    $[32] = onPointerMove;
    $[33] = onPointerUp;
    $[34] = t23;
    $[35] = t24;
    $[36] = t25;
    $[37] = t26;
    $[38] = t27;
    $[39] = t28;
    $[40] = t29;
    $[41] = toggle;
    $[42] = t30;
  } else {
    t30 = $[42];
  }
  const t31 = scrollsB ? 0 : void 0;
  let t32;
  if ($[43] !== setSlide || $[44] !== slide) {
    t32 = (e_8) => {
      if (e_8.target === e_8.currentTarget && e_8.propertyName === "translate" && slide && slide.run) {
        setSlide(null);
      }
    };
    $[43] = setSlide;
    $[44] = slide;
    $[45] = t32;
  } else {
    t32 = $[45];
  }
  let t33;
  if ($[46] !== panes[1] || $[47] !== setPaneB || $[48] !== t31 || $[49] !== t32) {
    t33 = /* @__PURE__ */ React.createElement("div", { ref: setPaneB, tabIndex: t31, className: "srp-splitter__pane srp-splitter__pane--second", onTransitionEnd: t32 }, panes[1]);
    $[46] = panes[1];
    $[47] = setPaneB;
    $[48] = t31;
    $[49] = t32;
    $[50] = t33;
  } else {
    t33 = $[50];
  }
  let t34;
  if ($[51] !== direction || $[52] !== mergedRef || $[53] !== onPlace || $[54] !== rest || $[55] !== t10 || $[56] !== t11 || $[57] !== t12 || $[58] !== t13 || $[59] !== t14 || $[60] !== t22 || $[61] !== t30 || $[62] !== t33) {
    t34 = /* @__PURE__ */ React.createElement("div", { ...rest, style: t10, ref: mergedRef, className: t11, "data-component": "splitter", "data-direction": direction, "data-placing": t12, "data-slide": t13, "data-slide-to": t14, onPointerDownCapture: onPlace }, t22, t30, t33);
    $[51] = direction;
    $[52] = mergedRef;
    $[53] = onPlace;
    $[54] = rest;
    $[55] = t10;
    $[56] = t11;
    $[57] = t12;
    $[58] = t13;
    $[59] = t14;
    $[60] = t22;
    $[61] = t30;
    $[62] = t33;
    $[63] = t34;
  } else {
    t34 = $[63];
  }
  return t34;
}
function _temp3(d_1) {
  return parseFloat(d_1) * (d_1.trim().endsWith("ms") ? 1 : 1e3);
}
function _temp2(c) {
  c.preventDefault();
  c.stopPropagation();
}
function _temp(e) {
  return getComputedStyle(e).direction === "rtl";
}
var Splitter = /* @__PURE__ */ named("Splitter", SplitterRender);
export {
  Splitter
};
//# sourceMappingURL=Splitter.js.map
