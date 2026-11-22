"use client";

// src/components/ShowMore/ShowMore.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { onFontsLoaded } from "../../internal/fontsLoaded.js";
import { useSettings } from "../../internal/provider.js";
import { Button } from "../Button/Button.js";
import { en as words } from "./labels.js";
import { useControllable } from "../../internal/controllable.js";
var OWN = {
  lines: 1,
  expanded: 1,
  defaultExpanded: 1,
  onExpandedChange: 1,
  className: 1,
  children: 1
};
function ShowMoreRender(t0) {
  const $ = _c(22);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, OWN);
  const L = useSettings(words).labels;
  const base = domId("srp-sm", React.useId());
  const lines = Math.min(6, Math.max(1, Math.floor(Number(props.lines)) || 3));
  const [expanded, setOwn, controlled] = useControllable(props.expanded, !!props.defaultExpanded, "ShowMore", "expanded");
  const open = !!expanded;
  const content = React.useRef(null);
  const [cut, setCut] = React.useState(false);
  let t1;
  if ($[0] !== open) {
    t1 = () => {
      const n = content.current;
      if (!n || open) {
        return;
      }
      const measure = () => {
        if (!window.matchMedia?.("print").matches) {
          setCut(n.scrollHeight > n.clientHeight + 1);
        }
      };
      measure();
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
      if (ro) {
        ro.observe(n);
      }
      const stop = onFontsLoaded(measure);
      return () => {
        if (ro) {
          ro.disconnect();
        }
        stop();
      };
    };
    $[0] = open;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  useIsoLayoutEffect(t1, [open, lines, props.children]);
  const toggle = () => {
    if (!controlled) {
      setOwn(!open);
    }
    if (props.onExpandedChange) {
      props.onExpandedChange(!open);
    }
  };
  const t2 = cn("srp-show-more", props.className);
  const t3 = open ? "" : void 0;
  const t4 = base + "-text";
  const t5 = !open && "srp-show-more__text--cut";
  let t6;
  if ($[2] !== t5) {
    t6 = cn("srp-show-more__text", t5);
    $[2] = t5;
    $[3] = t6;
  } else {
    t6 = $[3];
  }
  const t7 = open ? void 0 : lines;
  let t8;
  if ($[4] !== props.children || $[5] !== t4 || $[6] !== t6 || $[7] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("div", { id: t4, ref: content, className: t6, "data-lines": t7 }, props.children);
    $[4] = props.children;
    $[5] = t4;
    $[6] = t6;
    $[7] = t7;
    $[8] = t8;
  } else {
    t8 = $[8];
  }
  let t9;
  if ($[9] !== L || $[10] !== base || $[11] !== cut || $[12] !== open || $[13] !== toggle) {
    t9 = open || cut ? /* @__PURE__ */ React.createElement(Button, { variant: "link", size: "sm", className: "srp-show-more__toggle", "aria-expanded": open, "aria-controls": base + "-text", onClick: toggle }, open ? L.showLess : L.showMore) : null;
    $[9] = L;
    $[10] = base;
    $[11] = cut;
    $[12] = open;
    $[13] = toggle;
    $[14] = t9;
  } else {
    t9 = $[14];
  }
  let t10;
  if ($[15] !== ref || $[16] !== rest || $[17] !== t2 || $[18] !== t3 || $[19] !== t8 || $[20] !== t9) {
    t10 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t2, "data-component": "show-more", "data-expanded": t3 }, t8, t9);
    $[15] = ref;
    $[16] = rest;
    $[17] = t2;
    $[18] = t3;
    $[19] = t8;
    $[20] = t9;
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  return t10;
}
var ShowMore = /* @__PURE__ */ named("ShowMore", ShowMoreRender);
export {
  ShowMore
};
//# sourceMappingURL=ShowMore.js.map
