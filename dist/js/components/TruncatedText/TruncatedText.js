"use client";

// src/components/TruncatedText/TruncatedText.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, useIsoLayoutEffect, useLatest, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { onFontsLoaded } from "../../internal/fontsLoaded.js";
import { graphemes } from "../../internal/graphemes.js";
import { middleCutAt } from "../../internal/middleCut.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
var CONTROL = 'a[href], button, summary, [role="button"], [role="link"], [role="tab"], [role="option"], [role="menuitem"], [role="treeitem"], [tabindex="0"]';
function TruncatedTextRender(t0) {
  const $ = _c(39);
  const {
    ref,
    ...props
  } = t0;
  const {
    children,
    lines,
    as,
    placement,
    mode,
    className,
    onPointerDown,
    onClick,
    ...rest
  } = props;
  const clamp = lines != null && lines >= 2 ? Math.min(6, Math.floor(lines)) : 0;
  const middle = mode === "middle" && !clamp;
  const el = React.useRef(null);
  const [cut, setCut] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [inside, setInside] = React.useState(false);
  const isCut = useLatest(cut);
  let t1;
  if ($[0] !== clamp || $[1] !== setOpen) {
    t1 = () => {
      const e = el.current;
      if (!e) {
        return;
      }
      const measure = () => {
        let over = e.scrollHeight > e.clientHeight;
        if (!over && !clamp) {
          const r = document.createRange();
          r.selectNodeContents(e);
          over = r.getBoundingClientRect().width > e.getBoundingClientRect().width + 0.5;
        }
        setCut(over);
        if (!over) {
          setOpen(false);
        }
      };
      measure();
      const stop = onFontsLoaded(measure);
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
      if (ro) {
        ro.observe(e);
      }
      return () => {
        if (ro) {
          ro.disconnect();
        }
        stop();
      };
    };
    $[0] = clamp;
    $[1] = setOpen;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  useIsoLayoutEffect(t1, [children, clamp, middle]);
  let t2;
  if ($[3] !== isCut || $[4] !== setOpen) {
    t2 = () => {
      const e_0 = el.current;
      const control = e_0 && e_0.parentElement ? e_0.parentElement.closest(CONTROL) : null;
      setInside(!!control);
      if (!control) {
        return;
      }
      const focus = () => {
        if (isCut.current && control.matches(":focus-visible")) {
          setOpen(true);
        }
      };
      const blur = () => setOpen(false);
      control.addEventListener("focus", focus);
      control.addEventListener("blur", blur);
      return () => {
        control.removeEventListener("focus", focus);
        control.removeEventListener("blur", blur);
      };
    };
    $[3] = isCut;
    $[4] = setOpen;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = [];
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  useIsoLayoutEffect(t2, t3);
  let t4;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = {
      touch: false,
      open: false
    };
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  const press = React.useRef(t4);
  let t5;
  if ($[8] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = (n) => {
      el.current = n;
    };
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  const refs = useMergedRef(ref, t5);
  const chars = middle && cut ? graphemes(children) : [];
  const at = chars.length ? middleCutAt(children, chars) : 0;
  const content = at > 0 ? /* @__PURE__ */ React.createElement("span", { className: "srp-truncated-text__start" }, children) : children;
  const Tag = as === "p" || as === "div" ? as : "span";
  const t6 = "truncated-text";
  const t7 = cut ? "" : void 0;
  const t8 = clamp || void 0;
  const t9 = at > 0 ? chars.slice(at).join("") : void 0;
  const t10 = middle ? rest.dir || "auto" : rest.dir;
  const t11 = cut && !inside ? 0 : rest.tabIndex;
  const t12 = cn("srp-truncated-text", clamp && "srp-truncated-text--clamp", at > 0 && "srp-truncated-text--middle", className);
  let t13;
  if ($[9] !== onPointerDown || $[10] !== open) {
    t13 = (e_1) => {
      press.current = {
        touch: e_1.pointerType !== "mouse",
        open
      };
      if (onPointerDown) {
        onPointerDown(e_1);
      }
    };
    $[9] = onPointerDown;
    $[10] = open;
    $[11] = t13;
  } else {
    t13 = $[11];
  }
  let t14;
  if ($[12] !== cut || $[13] !== inside || $[14] !== onClick || $[15] !== setOpen) {
    t14 = (e_2) => {
      if (onClick) {
        onClick(e_2);
      }
      if (cut && !inside && press.current.touch && !press.current.open) {
        setOpen(true);
      }
    };
    $[12] = cut;
    $[13] = inside;
    $[14] = onClick;
    $[15] = setOpen;
    $[16] = t14;
  } else {
    t14 = $[16];
  }
  let t15;
  if ($[17] !== rest || $[18] !== t10 || $[19] !== t11 || $[20] !== t12 || $[21] !== t13 || $[22] !== t14 || $[23] !== t7 || $[24] !== t8 || $[25] !== t9) {
    t15 = {
      ...rest,
      "data-component": t6,
      "data-truncated": t7,
      "data-lines": t8,
      "data-end": t9,
      dir: t10,
      tabIndex: t11,
      className: t12,
      onPointerDown: t13,
      onClick: t14
    };
    $[17] = rest;
    $[18] = t10;
    $[19] = t11;
    $[20] = t12;
    $[21] = t13;
    $[22] = t14;
    $[23] = t7;
    $[24] = t8;
    $[25] = t9;
    $[26] = t15;
  } else {
    t15 = $[26];
  }
  const attrs = t15;
  let t16;
  if ($[27] !== Tag || $[28] !== attrs || $[29] !== content || $[30] !== refs) {
    t16 = /* @__PURE__ */ React.createElement(Tag, { ...attrs, ref: refs }, content);
    $[27] = Tag;
    $[28] = attrs;
    $[29] = content;
    $[30] = refs;
    $[31] = t16;
  } else {
    t16 = $[31];
  }
  const text = t16;
  const t17 = !cut;
  let t18;
  if ($[32] !== children || $[33] !== open || $[34] !== placement || $[35] !== setOpen || $[36] !== t17 || $[37] !== text) {
    t18 = /* @__PURE__ */ React.createElement(Tooltip, { visual: true, content: children, open, onOpenChange: setOpen, disabled: t17, placement }, text);
    $[32] = children;
    $[33] = open;
    $[34] = placement;
    $[35] = setOpen;
    $[36] = t17;
    $[37] = text;
    $[38] = t18;
  } else {
    t18 = $[38];
  }
  return t18;
}
var TruncatedText = /* @__PURE__ */ named("TruncatedText", TruncatedTextRender);
export {
  TruncatedText
};
//# sourceMappingURL=TruncatedText.js.map
