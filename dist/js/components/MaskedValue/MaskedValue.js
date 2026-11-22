"use client";

// src/components/MaskedValue/MaskedValue.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit, useLatest } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { IconButton } from "../IconButton/IconButton.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { useControllable } from "../../internal/controllable.js";
var DOTS = "\u2022\u2022\u2022\u2022";
function MaskedValueRender(t0) {
  const $ = _c(35);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const rest = omit(props, {
    value: 1,
    label: 1,
    end: 1,
    start: 1,
    revealable: 1,
    revealed: 1,
    defaultRevealed: 1,
    onRevealedChange: 1,
    className: 1
  });
  const [revealed, setOwn, controlled] = useControllable(props.revealed, !!props.defaultRevealed, "MaskedValue", "revealed");
  const shown = !!props.revealable && !!revealed;
  let t1;
  if ($[0] !== controlled || $[1] !== props || $[2] !== setOwn) {
    t1 = (v) => {
      if (!controlled) {
        setOwn(v);
      }
      if (props.onRevealedChange) {
        props.onRevealedChange(v);
      }
    };
    $[0] = controlled;
    $[1] = props;
    $[2] = setOwn;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const set = useLatest(t1);
  let t2;
  let t3;
  if ($[4] !== set || $[5] !== shown) {
    t2 = () => {
      if (!shown) {
        return;
      }
      const hide = () => {
        if (document.visibilityState === "hidden") {
          set.current?.(false);
        }
      };
      document.addEventListener("visibilitychange", hide);
      return () => document.removeEventListener("visibilitychange", hide);
    };
    t3 = [shown, set];
    $[4] = set;
    $[5] = shown;
    $[6] = t2;
    $[7] = t3;
  } else {
    t2 = $[6];
    t3 = $[7];
  }
  React.useEffect(t2, t3);
  let masked;
  let t4;
  if ($[8] !== props.end || $[9] !== props.label || $[10] !== props.start || $[11] !== props.value || $[12] !== sds.labels) {
    const {
      masked: t52,
      kept
    } = mask(props.value, props.start, props.end);
    masked = t52;
    t4 = kept ? sds.labels.maskedEnding(props.label, kept) : sds.labels.maskedHidden(props.label);
    $[8] = props.end;
    $[9] = props.label;
    $[10] = props.start;
    $[11] = props.value;
    $[12] = sds.labels;
    $[13] = masked;
    $[14] = t4;
  } else {
    masked = $[13];
    t4 = $[14];
  }
  const said = t4;
  const t5 = shown && "srp-masked-value--revealed";
  let t6;
  if ($[15] !== props.className || $[16] !== t5) {
    t6 = cn("srp-masked-value", t5, props.className);
    $[15] = props.className;
    $[16] = t5;
    $[17] = t6;
  } else {
    t6 = $[17];
  }
  let t7;
  if ($[18] !== props.label || $[19] !== props.revealable || $[20] !== sds.labels || $[21] !== set || $[22] !== shown) {
    t7 = props.revealable ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-masked-value__toggle", icon: shown ? icons.VisibilityOff : icons.Visibility, label: sds.labels.showValue(props.label), hideTitle: true, size: "sm", variant: "ghost", "aria-pressed": shown, onClick: () => set.current?.(!shown) }) : null;
    $[18] = props.label;
    $[19] = props.revealable;
    $[20] = sds.labels;
    $[21] = set;
    $[22] = shown;
    $[23] = t7;
  } else {
    t7 = $[23];
  }
  let t8;
  if ($[24] !== masked || $[25] !== props.value || $[26] !== said || $[27] !== shown) {
    t8 = shown ? /* @__PURE__ */ React.createElement("span", { className: "srp-masked-value__text" }, props.value) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "srp-masked-value__text", "aria-hidden": true }, masked), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, said));
    $[24] = masked;
    $[25] = props.value;
    $[26] = said;
    $[27] = shown;
    $[28] = t8;
  } else {
    t8 = $[28];
  }
  let t9;
  if ($[29] !== ref || $[30] !== rest || $[31] !== t6 || $[32] !== t7 || $[33] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("span", { ...rest, ref, className: t6, "data-component": "masked-value" }, t7, t8);
    $[29] = ref;
    $[30] = rest;
    $[31] = t6;
    $[32] = t7;
    $[33] = t8;
    $[34] = t9;
  } else {
    t9 = $[34];
  }
  return t9;
}
var MaskedValue = /* @__PURE__ */ named("MaskedValue", MaskedValueRender);
function maskValue(value, start = 0, end = 4) {
  return mask(value, start, end).masked;
}
function mask(value, start, end) {
  const chars = Array.from(String(value ?? ""));
  const whole = (n, d) => typeof n === "number" && isFinite(n) && n > 0 ? Math.floor(n) : n === 0 ? 0 : d;
  let s = whole(start, 0), e = whole(end, 4);
  if (s + e > chars.length / 2) {
    s = 0;
    e = 0;
  }
  const head = chars.slice(0, s).join(""), tail = e ? chars.slice(chars.length - e).join("") : "";
  return {
    masked: head + DOTS + (tail ? " " + tail : ""),
    kept: tail
  };
}
export {
  MaskedValue,
  maskValue
};
//# sourceMappingURL=MaskedValue.js.map
