"use client";

// src/components/MaskedValue/MaskedValue.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { IconButton } from "../IconButton/IconButton.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { useControllable } from "../../internal/controllable.js";
var DOTS = "\u2022\u2022\u2022\u2022";
var MaskedValue = /* @__PURE__ */ component("MaskedValue", function MaskedValue2(props, ref) {
  const sds = useSettings(words);
  const rest = omit(props, { value: 1, label: 1, end: 1, start: 1, revealable: 1, revealed: 1, defaultRevealed: 1, onRevealedChange: 1, className: 1 });
  const [revealed, setOwn, controlled] = useControllable(props.revealed, !!props.defaultRevealed, "MaskedValue", "revealed");
  const shown = !!props.revealable && !!revealed;
  const set = React.useRef(null);
  set.current = (v) => {
    if (!controlled) setOwn(v);
    if (props.onRevealedChange) props.onRevealedChange(v);
  };
  React.useEffect(() => {
    if (!shown) return;
    const hide = () => {
      if (document.visibilityState === "hidden") set.current?.(false);
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [shown]);
  const { masked, kept } = mask(props.value, props.start, props.end);
  const said = kept ? sds.labels.maskedEnding(props.label, kept) : sds.labels.maskedHidden(props.label);
  return /* @__PURE__ */ React.createElement("span", { ...rest, ref, className: cn("dk-masked-value", shown && "dk-masked-value--revealed", props.className), "data-component": "masked-value" }, shown ? /* @__PURE__ */ React.createElement("span", { className: "dk-masked-value__text" }, props.value) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "dk-masked-value__text", "aria-hidden": true }, masked), /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, said)), props.revealable ? /* @__PURE__ */ React.createElement(
    IconButton,
    {
      className: "dk-masked-value__toggle",
      icon: shown ? icons.VisibilityOff : icons.Visibility,
      label: sds.labels.showValue(props.label),
      hideTitle: true,
      size: "sm",
      variant: "ghost",
      "aria-pressed": shown,
      onClick: () => set.current?.(!shown)
    }
  ) : null);
});
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
  return { masked: head + DOTS + (tail ? " " + tail : ""), kept: tail };
}
export {
  MaskedValue,
  maskValue
};
//# sourceMappingURL=MaskedValue.js.map
