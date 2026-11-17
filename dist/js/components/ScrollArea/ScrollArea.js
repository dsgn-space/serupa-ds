"use client";

// src/components/ScrollArea/ScrollArea.tsx
import * as React from "react";
import { cn, oneOf, omit, setRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useScrolls } from "../../internal/useScrolls.js";
import { en as words } from "./labels.js";
var OWN = { orientation: 1, fade: 1, className: 1, children: 1, onScroll: 1, "aria-label": 1, "aria-labelledby": 1 };
var ScrollArea = /* @__PURE__ */ component("ScrollArea", function ScrollArea2(props, ref) {
  const rest = omit(props, OWN);
  const L = useSettings(words).labels;
  const box = React.useRef(null);
  const orientation = oneOf(["vertical", "horizontal", "both"], props.orientation, "vertical");
  const across = orientation === "horizontal";
  const [edges, setEdges] = React.useState({ start: true, end: true });
  const read = React.useCallback(() => {
    const el = box.current;
    if (!el) return;
    const pos = across ? Math.abs(el.scrollLeft) : el.scrollTop;
    const room = across ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    const next = { start: pos <= 1, end: pos >= room - 1 };
    setEdges((e) => e.start === next.start && e.end === next.end ? e : next);
  }, [across]);
  const scrolls = useScrolls(box, props.fade ? read : void 0);
  React.useLayoutEffect(() => {
    if (props.fade) read();
  }, [props.fade, scrolls, read]);
  const name = props["aria-labelledby"] ? { "aria-labelledby": props["aria-labelledby"] } : { "aria-label": props["aria-label"] || L.scrollArea };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ...scrolls ? { tabIndex: 0, role: "region", ...name } : {},
      ref: (n) => {
        box.current = n;
        setRef(ref, n);
      },
      onScroll: (e) => {
        if (props.fade) read();
        props.onScroll?.(e);
      },
      className: cn(
        "dk-scroll-area",
        "dk-scroll-area--" + orientation,
        props.fade && scrolls && !edges.start && "dk-scroll-area--more-start",
        props.fade && scrolls && !edges.end && "dk-scroll-area--more-end",
        props.className
      ),
      "data-component": "scroll-area"
    },
    props.children
  );
});
export {
  ScrollArea
};
//# sourceMappingURL=ScrollArea.js.map
