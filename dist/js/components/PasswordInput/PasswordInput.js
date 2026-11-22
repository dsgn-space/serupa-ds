"use client";

// src/components/PasswordInput/PasswordInput.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { announce } from "../../internal/announce.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { cn, domId, isInvalid, omit, oneOf, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { pressFocuses } from "../../internal/affix.js";
import { activeIn } from "../../internal/root.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var SIZES = ["sm", "md", "lg"];
var STOP = ["keydown", "pointerdown", "input"];
var msSince = (t) => performance.now() - t;
function PasswordInputRender(t0) {
  const $ = _c(42);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const nameRef = useNameCheck("PasswordInput", NAME_HOW.field);
  props = useFieldControl(props);
  const sds = useSettings(words);
  const rest = omit(props, {
    size: 1,
    invalid: 1,
    startIcon: 1,
    className: 1,
    style: 1,
    revealed: 1,
    defaultRevealed: 1,
    onRevealedChange: 1,
    toggleLabel: 1,
    capsLockHint: 1
  });
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) {
    rest["aria-invalid"] = true;
  }
  if (rest.autoComplete === void 0) {
    rest.autoComplete = "current-password";
  }
  const [revealed, setOwn, controlled] = useControllable(props.revealed, !!props.defaultRevealed, "PasswordInput", "revealed");
  const shown = !!revealed;
  const left = asIcon(props.startIcon);
  const [caps, setCaps] = React.useState(false);
  const capsId = domId("srp-pw-caps", React.useId());
  const hint = props.capsLockHint !== false;
  let t2;
  if ($[0] !== caps || $[1] !== hint || $[2] !== sds) {
    t2 = (e) => {
      if (!hint || typeof e.getModifierState !== "function") {
        return;
      }
      const on = e.getModifierState("CapsLock");
      if (on !== caps) {
        setCaps(on);
        if (on) {
          announce(sds.labels.capsLockOn);
        }
      }
    };
    $[0] = caps;
    $[1] = hint;
    $[2] = sds;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const sense = t2;
  const onKeyDown = rest.onKeyDown;
  const onKeyUp = rest.onKeyUp;
  const onBlur = rest.onBlur;
  rest.onKeyDown = (e_0) => {
    sense(e_0);
    if (onKeyDown) {
      onKeyDown(e_0);
    }
  };
  rest.onKeyUp = (e_1) => {
    sense(e_1);
    if (onKeyUp) {
      onKeyUp(e_1);
    }
  };
  rest.onBlur = (e_2) => {
    setCaps(false);
    if (onBlur) {
      onBlur(e_2);
    }
  };
  if (caps) {
    rest["aria-describedby"] = cn(rest["aria-describedby"], capsId);
  }
  const field = React.useRef(null);
  const caret = React.useRef(null);
  let t3;
  if ($[4] !== nameRef) {
    t3 = (n) => {
      field.current = n;
      nameRef(n);
    };
    $[4] = nameRef;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const fieldRef = useMergedRef(ref, t3);
  let t4;
  if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = () => {
      const f = field.current;
      const c = caret.current;
      caret.current = null;
      if (!f || !c) {
        return;
      }
      const put = () => {
        if (f.selectionStart === null) {
          return;
        }
        f.setSelectionRange(c[0], c[1], c[2]);
        const at = (c[2] === "backward" ? c[0] : c[1]) / Math.max(f.value.length, 1);
        f.scrollLeft = at * f.scrollWidth - (at * c[4] - c[3]);
      };
      put();
      const frame = requestAnimationFrame(put);
      const stop = () => {
        cancelAnimationFrame(frame);
        for (const t of STOP) {
          f.removeEventListener(t, stop);
        }
      };
      for (const t_0 of STOP) {
        f.addEventListener(t_0, stop);
      }
      return stop;
    };
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== shown) {
    t5 = [shown];
    $[7] = shown;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  useIsoLayoutEffect(t4, t5);
  const pressed = React.useRef(0);
  const seen = React.useRef(null);
  let t6;
  let t7;
  if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = () => {
      const keep = () => {
        const f_0 = field.current;
        if (f_0 && activeIn(f_0) === f_0 && f_0.selectionStart !== null && f_0.selectionEnd !== null) {
          seen.current = [f_0.selectionStart, f_0.selectionEnd, f_0.selectionDirection || "none"];
        }
      };
      const f_1 = field.current;
      document.addEventListener("selectionchange", keep, true);
      if (f_1) {
        f_1.addEventListener("selectionchange", keep);
      }
      return () => {
        document.removeEventListener("selectionchange", keep, true);
        if (f_1) {
          f_1.removeEventListener("selectionchange", keep);
        }
      };
    };
    t7 = [];
    $[9] = t6;
    $[10] = t7;
  } else {
    t6 = $[9];
    t7 = $[10];
  }
  React.useEffect(t6, t7);
  const capture = () => {
    const f_2 = field.current;
    if (!f_2 || f_2.selectionStart === null || f_2.selectionEnd === null) {
      return;
    }
    const s = seen.current && activeIn(f_2) === f_2 ? seen.current : [f_2.selectionStart, f_2.selectionEnd, f_2.selectionDirection || "none"];
    caret.current = [s[0], s[1], s[2], f_2.scrollLeft, f_2.scrollWidth];
  };
  const toggle = () => {
    if (!caret.current || msSince(pressed.current) > 1e3) {
      capture();
    }
    if (!controlled) {
      setOwn(!shown);
    }
    if (props.onRevealedChange) {
      props.onRevealedChange(!shown);
    }
  };
  const t8 = cn("srp-input srp-password-input", "srp-input--size-" + size, invalid && "srp-input--invalid", rest.disabled && "srp-input--disabled", rest.readOnly && "srp-input--readonly", props.className);
  let t9;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = (e_3) => pressFocuses(field)(e_3);
    $[11] = t9;
  } else {
    t9 = $[11];
  }
  let t10;
  if ($[12] !== left) {
    t10 = left != null && left !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-input__icon srp-input__icon--start", "aria-hidden": true }, left) : null;
    $[12] = left;
    $[13] = t10;
  } else {
    t10 = $[13];
  }
  const t11 = shown ? "text" : "password";
  let t12;
  if ($[14] !== fieldRef || $[15] !== rest || $[16] !== t11) {
    t12 = /* @__PURE__ */ React.createElement("input", { ...rest, ref: fieldRef, type: t11, className: "srp-input__field", spellCheck: false, autoCapitalize: "off", autoCorrect: "off" });
    $[14] = fieldRef;
    $[15] = rest;
    $[16] = t11;
    $[17] = t12;
  } else {
    t12 = $[17];
  }
  let t13;
  if ($[18] !== caps || $[19] !== capsId || $[20] !== sds) {
    t13 = caps ? /* @__PURE__ */ React.createElement("span", { className: "srp-password-input__caps", id: capsId }, sds.labels.capsLockOn) : null;
    $[18] = caps;
    $[19] = capsId;
    $[20] = sds;
    $[21] = t13;
  } else {
    t13 = $[21];
  }
  const t14 = props.toggleLabel || sds.labels.showPassword;
  let t15;
  if ($[22] !== capture) {
    t15 = (e_4) => {
      e_4.preventDefault();
      capture();
      pressed.current = performance.now();
    };
    $[22] = capture;
    $[23] = t15;
  } else {
    t15 = $[23];
  }
  const t16 = shown ? icons.VisibilityOff : icons.Visibility;
  let t17;
  if ($[24] !== t16) {
    t17 = /* @__PURE__ */ React.createElement(Icon, { icon: t16 });
    $[24] = t16;
    $[25] = t17;
  } else {
    t17 = $[25];
  }
  let t18;
  if ($[26] !== rest.disabled || $[27] !== rest.id || $[28] !== shown || $[29] !== t14 || $[30] !== t15 || $[31] !== t17 || $[32] !== toggle) {
    t18 = /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-password-input__toggle", "aria-label": t14, "aria-pressed": shown, "aria-controls": rest.id, disabled: rest.disabled, onClick: toggle, onMouseDown: t15 }, t17);
    $[26] = rest.disabled;
    $[27] = rest.id;
    $[28] = shown;
    $[29] = t14;
    $[30] = t15;
    $[31] = t17;
    $[32] = toggle;
    $[33] = t18;
  } else {
    t18 = $[33];
  }
  let t19;
  if ($[34] !== props.style || $[35] !== size || $[36] !== t10 || $[37] !== t12 || $[38] !== t13 || $[39] !== t18 || $[40] !== t8) {
    t19 = /* @__PURE__ */ React.createElement("span", { className: t8, style: props.style, "data-component": "password-input", "data-size": size, onMouseDown: t9 }, t10, t12, t13, t18);
    $[34] = props.style;
    $[35] = size;
    $[36] = t10;
    $[37] = t12;
    $[38] = t13;
    $[39] = t18;
    $[40] = t8;
    $[41] = t19;
  } else {
    t19 = $[41];
  }
  return t19;
}
var PasswordInput = /* @__PURE__ */ named("PasswordInput", PasswordInputRender);
export {
  PasswordInput
};
//# sourceMappingURL=PasswordInput.js.map
