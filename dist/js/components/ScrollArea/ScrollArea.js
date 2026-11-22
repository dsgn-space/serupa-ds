"use client";

// src/components/ScrollArea/ScrollArea.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit, setRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useScrolls } from "../../internal/useScrolls.js";
import { en as words } from "./labels.js";
var OWN = {
  orientation: 1,
  fade: 1,
  className: 1,
  children: 1,
  onScroll: 1,
  "aria-label": 1,
  "aria-labelledby": 1
};
function ScrollAreaRender(t0) {
  const $ = _c(12);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, OWN);
  const L = useSettings(words).labels;
  const box = React.useRef(null);
  const orientation = oneOf(["vertical", "horizontal", "both"], props.orientation, "vertical");
  const across = orientation === "horizontal";
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      start: true,
      end: true
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const [edges, setEdges] = React.useState(t1);
  let t2;
  if ($[1] !== across) {
    t2 = () => {
      const el = box.current;
      if (!el) {
        return;
      }
      const pos = across ? Math.abs(el.scrollLeft) : el.scrollTop;
      const room = across ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
      const next = {
        start: pos <= 1,
        end: pos >= room - 1
      };
      setEdges((e) => e.start === next.start && e.end === next.end ? e : next);
    };
    $[1] = across;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const read = t2;
  const scrolls = useScrolls(box, props.fade ? read : void 0);
  React.useLayoutEffect(() => {
    if (props.fade) {
      read();
    }
  }, [props.fade, scrolls, read]);
  const name = props["aria-labelledby"] ? {
    "aria-labelledby": props["aria-labelledby"]
  } : {
    "aria-label": props["aria-label"] || L.scrollArea
  };
  const t3 = scrolls ? {
    tabIndex: 0,
    role: "region",
    ...name
  } : {};
  let t4;
  if ($[3] !== ref) {
    t4 = (n) => {
      box.current = n;
      setRef(ref, n);
    };
    $[3] = ref;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  const t5 = (e_0) => {
    if (props.fade) {
      read();
    }
    props.onScroll?.(e_0);
  };
  const t6 = cn("srp-scroll-area", "srp-scroll-area--" + orientation, props.fade && scrolls && !edges.start && "srp-scroll-area--more-start", props.fade && scrolls && !edges.end && "srp-scroll-area--more-end", props.className);
  let t7;
  if ($[5] !== props.children || $[6] !== rest || $[7] !== t3 || $[8] !== t4 || $[9] !== t5 || $[10] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("div", { ...rest, ...t3, ref: t4, onScroll: t5, className: t6, "data-component": "scroll-area" }, props.children);
    $[5] = props.children;
    $[6] = rest;
    $[7] = t3;
    $[8] = t4;
    $[9] = t5;
    $[10] = t6;
    $[11] = t7;
  } else {
    t7 = $[11];
  }
  return t7;
}
var ScrollArea = /* @__PURE__ */ named("ScrollArea", ScrollAreaRender);
export {
  ScrollArea
};
//# sourceMappingURL=ScrollArea.js.map
