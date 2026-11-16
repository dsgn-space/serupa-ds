"use client";

// src/components/TruncatedText/TruncatedText.tsx
import * as React from "react";
import { cn, oneOf, useIsoLayoutEffect, useMergedRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
var TAGS = ["span", "p", "div"];
var CONTROL = 'a[href], button, summary, [role="button"], [role="link"], [role="tab"], [role="option"], [role="menuitem"], [role="treeitem"], [tabindex="0"]';
var TruncatedText = /* @__PURE__ */ component("TruncatedText", function TruncatedText2(props, ref) {
  const { children, lines, as, placement, className, onPointerDown, onClick, ...rest } = props;
  const clamp = lines != null && lines >= 2 ? Math.min(6, Math.floor(lines)) : 0;
  const el = React.useRef(null);
  const [cut, setCut] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [inside, setInside] = React.useState(false);
  const isCut = React.useRef(cut);
  isCut.current = cut;
  useIsoLayoutEffect(() => {
    const e = el.current;
    if (!e) return;
    const measure = () => {
      let over = e.scrollHeight > e.clientHeight;
      if (!over && !clamp) {
        const r = document.createRange();
        r.selectNodeContents(e);
        over = r.getBoundingClientRect().width > e.getBoundingClientRect().width + 0.5;
      }
      setCut(over);
      if (!over) setOpen(false);
    };
    measure();
    const fonts = document.fonts;
    if (fonts && fonts.addEventListener) fonts.addEventListener("loadingdone", measure);
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (ro) ro.observe(e);
    return () => {
      if (ro) ro.disconnect();
      if (fonts && fonts.removeEventListener) fonts.removeEventListener("loadingdone", measure);
    };
  }, [children, clamp]);
  useIsoLayoutEffect(() => {
    const e = el.current, control = e && e.parentElement ? e.parentElement.closest(CONTROL) : null;
    setInside(!!control);
    if (!control) return;
    const focus = () => {
      if (isCut.current && control.matches(":focus-visible")) setOpen(true);
    };
    const blur = () => setOpen(false);
    control.addEventListener("focus", focus);
    control.addEventListener("blur", blur);
    return () => {
      control.removeEventListener("focus", focus);
      control.removeEventListener("blur", blur);
    };
  }, []);
  const press = React.useRef({ touch: false, open: false });
  const refs = useMergedRef(ref, (n) => {
    el.current = n;
  });
  const text = React.createElement(oneOf(TAGS, as, "span"), {
    ...rest,
    ref: refs,
    "data-component": "truncated-text",
    "data-truncated": cut ? "" : void 0,
    // The count goes in an attribute the CSS reads, not a style attribute, so it holds under a strict CSP too.
    "data-lines": clamp || void 0,
    tabIndex: cut && !inside ? 0 : rest.tabIndex,
    className: cn("dk-truncated-text", clamp && "dk-truncated-text--clamp", className),
    onPointerDown: (e) => {
      press.current = { touch: e.pointerType !== "mouse", open };
      if (onPointerDown) onPointerDown(e);
    },
    onClick: (e) => {
      if (onClick) onClick(e);
      if (cut && !inside && press.current.touch && !press.current.open) setOpen(true);
    }
  }, children);
  return /* @__PURE__ */ React.createElement(Tooltip, { visual: true, content: children, open, onOpenChange: setOpen, disabled: !cut, placement }, text);
});
export {
  TruncatedText
};
//# sourceMappingURL=TruncatedText.js.map
