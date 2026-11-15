"use client";

// src/components/ShowMore/ShowMore.tsx
import * as React from "react";
import { cn, domId, omit, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { onFontsLoaded } from "../../internal/fontsLoaded.js";
import { useSettings } from "../../internal/provider.js";
import { Button } from "../Button/Button.js";
import { en as words } from "./labels.js";
var OWN = { lines: 1, expanded: 1, defaultExpanded: 1, onExpandedChange: 1, className: 1, children: 1 };
var ShowMore = /* @__PURE__ */ component("ShowMore", function ShowMore2(props, ref) {
  const rest = omit(props, OWN);
  const L = useSettings(words).labels;
  const base = domId("dk-sm", React.useId());
  const lines = Math.min(6, Math.max(1, Math.floor(Number(props.lines)) || 3));
  const controlled = props.expanded !== void 0;
  const [own, setOwn] = React.useState(!!props.defaultExpanded);
  const open = controlled ? !!props.expanded : own;
  const content = React.useRef(null);
  const [cut, setCut] = React.useState(false);
  useIsoLayoutEffect(() => {
    const n = content.current;
    if (!n || open) return;
    const measure = () => {
      if (!window.matchMedia?.("print").matches) setCut(n.scrollHeight > n.clientHeight + 1);
    };
    measure();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (ro) ro.observe(n);
    const stop = onFontsLoaded(measure);
    return () => {
      if (ro) ro.disconnect();
      stop();
    };
  }, [open, lines, props.children]);
  const toggle = () => {
    if (!controlled) setOwn(!open);
    if (props.onExpandedChange) props.onExpandedChange(!open);
  };
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cn("dk-show-more", props.className), "data-component": "show-more", "data-expanded": open ? "" : void 0 }, /* @__PURE__ */ React.createElement(
    "div",
    {
      id: base + "-text",
      ref: content,
      className: cn("dk-show-more__text", !open && "dk-show-more__text--cut"),
      "data-lines": open ? void 0 : lines
    },
    props.children
  ), open || cut ? /* @__PURE__ */ React.createElement(Button, { variant: "link", size: "sm", className: "dk-show-more__toggle", "aria-expanded": open, "aria-controls": base + "-text", onClick: toggle }, open ? L.showLess : L.showMore) : null);
});
export {
  ShowMore
};
//# sourceMappingURL=ShowMore.js.map
