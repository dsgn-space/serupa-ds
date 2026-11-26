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
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden.js";
import { asIcon } from "../Icon/asIcon.js";
import { InputAction } from "../Input/Input.js";
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
  const $ = _c(43);
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
  const t9 = invalid ? "" : void 0;
  const t10 = rest.disabled ? "" : void 0;
  const t11 = rest.readOnly ? "" : void 0;
  let t12;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = (e_3) => pressFocuses(field)(e_3);
    $[11] = t12;
  } else {
    t12 = $[11];
  }
  let t13;
  if ($[12] !== left) {
    t13 = left != null && left !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-input__icon srp-input__icon--start", "aria-hidden": true }, left) : null;
    $[12] = left;
    $[13] = t13;
  } else {
    t13 = $[13];
  }
  const t14 = shown ? "text" : "password";
  let t15;
  if ($[14] !== fieldRef || $[15] !== rest || $[16] !== t14) {
    t15 = /* @__PURE__ */ React.createElement("input", { ...rest, ref: fieldRef, type: t14, className: "srp-input__field", spellCheck: false, autoCapitalize: "off", autoCorrect: "off" });
    $[14] = fieldRef;
    $[15] = rest;
    $[16] = t14;
    $[17] = t15;
  } else {
    t15 = $[17];
  }
  let t16;
  if ($[18] !== caps || $[19] !== capsId || $[20] !== sds) {
    t16 = caps ? /* @__PURE__ */ React.createElement("span", { className: "srp-password-input__caps", id: capsId, title: sds.labels.capsLockOn }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.KeyboardCapslock }), /* @__PURE__ */ React.createElement(VisuallyHidden, null, sds.labels.capsLockOn)) : null;
    $[18] = caps;
    $[19] = capsId;
    $[20] = sds;
    $[21] = t16;
  } else {
    t16 = $[21];
  }
  const t17 = shown ? icons.VisibilityOff : icons.Visibility;
  const t18 = props.toggleLabel || sds.labels.showPassword;
  const t19 = !!rest.disabled;
  let t20;
  if ($[22] !== capture) {
    t20 = (e_4) => {
      e_4.preventDefault();
      capture();
      pressed.current = performance.now();
    };
    $[22] = capture;
    $[23] = t20;
  } else {
    t20 = $[23];
  }
  let t21;
  if ($[24] !== rest.id || $[25] !== shown || $[26] !== t17 || $[27] !== t18 || $[28] !== t19 || $[29] !== t20 || $[30] !== toggle) {
    t21 = /* @__PURE__ */ React.createElement("span", { className: "srp-input__actions" }, /* @__PURE__ */ React.createElement(InputAction, { className: "srp-password-input__toggle", icon: t17, label: t18, "aria-pressed": shown, "aria-controls": rest.id, disabled: t19, onClick: toggle, onMouseDown: t20 }));
    $[24] = rest.id;
    $[25] = shown;
    $[26] = t17;
    $[27] = t18;
    $[28] = t19;
    $[29] = t20;
    $[30] = toggle;
    $[31] = t21;
  } else {
    t21 = $[31];
  }
  let t22;
  if ($[32] !== props.style || $[33] !== size || $[34] !== t10 || $[35] !== t11 || $[36] !== t13 || $[37] !== t15 || $[38] !== t16 || $[39] !== t21 || $[40] !== t8 || $[41] !== t9) {
    t22 = /* @__PURE__ */ React.createElement("span", { className: t8, "data-invalid": t9, "data-disabled": t10, "data-readonly": t11, style: props.style, "data-component": "password-input", "data-size": size, onMouseDown: t12 }, t13, t15, t16, t21);
    $[32] = props.style;
    $[33] = size;
    $[34] = t10;
    $[35] = t11;
    $[36] = t13;
    $[37] = t15;
    $[38] = t16;
    $[39] = t21;
    $[40] = t8;
    $[41] = t9;
    $[42] = t22;
  } else {
    t22 = $[42];
  }
  return t22;
}
var PasswordInput = /* @__PURE__ */ named("PasswordInput", PasswordInputRender);
export {
  PasswordInput
};
//# sourceMappingURL=PasswordInput.js.map
