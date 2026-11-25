"use client";

// src/components/PinInput/PinInput.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, isInvalid, omit, oneOf, useMergedRef, SIZES } from "../../internal/cn.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { latinDigits } from "../../internal/digits.js";
import { isComposing } from "../../internal/ime.js";
var KEEP = {
  numeric: /[^0-9]/g,
  alphanumeric: /[^0-9A-Za-z]/g
};
function PinInputRender(t0) {
  const $ = _c(27);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const nameRef = useNameCheck("PinInput", NAME_HOW.field);
  props = useFieldControl(props);
  const rest = omit(props, {
    length: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    onComplete: 1,
    type: 1,
    mask: 1,
    size: 1,
    invalid: 1,
    className: 1,
    style: 1
  });
  const length = Math.min(32, Math.max(1, Math.floor(props.length && Number.isFinite(props.length) ? props.length : 6)));
  const type = oneOf(["numeric", "alphanumeric"], props.type, "numeric");
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const clean = (s) => latinDigits((s || "").normalize("NFKC")).replace(KEEP[type], "").slice(0, length);
  const [held, setOwn, controlled] = useControllable(props.value, clean(props.defaultValue), "PinInput", "value");
  const code = controlled ? clean(held) : held;
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) {
    rest["aria-invalid"] = true;
  }
  const input = React.useRef(null);
  const [focused, setFocused] = React.useState(false);
  useFormReset(input, function() {
    if (!controlled) {
      setOwn(clean(props.defaultValue));
    }
  });
  const toEnd = _temp;
  const onChange = function(e_0) {
    const next = clean(e_0.currentTarget.value);
    if (next === code) {
      e_0.currentTarget.value = code;
      return;
    }
    if (!controlled) {
      setOwn(next);
    }
    if (props.onValueChange) {
      props.onValueChange(next);
    }
    if (next.length === length && props.onComplete) {
      props.onComplete(next);
    }
  };
  const active = Math.min(code.length, length - 1);
  const boxes = [];
  for (let i = 0; i < length; i++) {
    const ch = code.charAt(i);
    boxes.push(/* @__PURE__ */ React.createElement("span", { key: i, className: cn("srp-pin-input__box", ch && "srp-pin-input__box--filled", focused && i === active && "srp-pin-input__box--active", focused && i === active && !ch && "srp-pin-input__box--caret"), "data-active": focused && i === active ? "" : void 0 }, ch ? props.mask ? "\u2022" : ch : null));
  }
  let t2;
  if ($[0] !== nameRef) {
    t2 = (n_0) => {
      input.current = n_0;
      nameRef(n_0);
    };
    $[0] = nameRef;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const mergedRef = useMergedRef(ref, t2);
  const t3 = type === "numeric" ? "[0-9]{" + length + "}" : "[0-9A-Za-z]{" + length + "}";
  const t4 = type === "numeric" ? "numeric" : "text";
  const t5 = props.mask ? "password" : "text";
  let t6;
  let t7;
  if ($[2] !== rest || $[3] !== setFocused) {
    t6 = function(e_1) {
      setFocused(true);
      if (rest.onFocus) {
        rest.onFocus(e_1);
      }
    };
    t7 = function(e_2) {
      setFocused(false);
      if (rest.onBlur) {
        rest.onBlur(e_2);
      }
    };
    $[2] = rest;
    $[3] = setFocused;
    $[4] = t6;
    $[5] = t7;
  } else {
    t6 = $[4];
    t7 = $[5];
  }
  let t8;
  let t9;
  if ($[6] !== rest || $[7] !== toEnd) {
    t8 = function(e_3) {
      if (rest.onKeyDown) {
        rest.onKeyDown(e_3);
      }
      if (e_3.defaultPrevented || isComposing(e_3)) {
        return;
      }
      if (!(e_3.altKey || e_3.ctrlKey || e_3.metaKey) && /^(Arrow(Left|Right|Up|Down)|Home|End|PageUp|PageDown)$/.test(e_3.key)) {
        e_3.preventDefault();
      } else {
        toEnd(e_3);
      }
    };
    t9 = function(e_4) {
      toEnd(e_4);
      if (rest.onSelect) {
        rest.onSelect(e_4);
      }
    };
    $[6] = rest;
    $[7] = toEnd;
    $[8] = t8;
    $[9] = t9;
  } else {
    t8 = $[8];
    t9 = $[9];
  }
  let t10;
  if ($[10] !== clean || $[11] !== length || $[12] !== rest) {
    t10 = function(e_5) {
      if (rest.onPaste) {
        rest.onPaste(e_5);
      }
      const el_0 = e_5.currentTarget;
      if (!e_5.defaultPrevented && clean(e_5.clipboardData.getData("text")).length === length) {
        el_0.setSelectionRange(0, el_0.value.length);
      }
    };
    $[10] = clean;
    $[11] = length;
    $[12] = rest;
    $[13] = t10;
  } else {
    t10 = $[13];
  }
  let t11;
  if ($[14] !== code || $[15] !== mergedRef || $[16] !== onChange || $[17] !== rest || $[18] !== t10 || $[19] !== t3 || $[20] !== t4 || $[21] !== t5 || $[22] !== t6 || $[23] !== t7 || $[24] !== t8 || $[25] !== t9) {
    t11 = /* @__PURE__ */ React.createElement("input", { autoComplete: "one-time-code", pattern: t3, inputMode: t4, autoCapitalize: "off", autoCorrect: "off", spellCheck: false, ...rest, type: t5, value: code, onChange, onFocus: t6, onBlur: t7, onKeyDown: t8, onSelect: t9, onPaste: t10, ref: mergedRef, className: "srp-pin-input__field" });
    $[14] = code;
    $[15] = mergedRef;
    $[16] = onChange;
    $[17] = rest;
    $[18] = t10;
    $[19] = t3;
    $[20] = t4;
    $[21] = t5;
    $[22] = t6;
    $[23] = t7;
    $[24] = t8;
    $[25] = t9;
    $[26] = t11;
  } else {
    t11 = $[26];
  }
  return /* @__PURE__ */ React.createElement("span", { className: cn("srp-pin-input", "srp-pin-input--size-" + size, invalid && "srp-pin-input--invalid", rest.disabled && "srp-pin-input--disabled", rest.readOnly && "srp-pin-input--readonly", props.className), "data-invalid": invalid ? "" : void 0, "data-disabled": rest.disabled ? "" : void 0, "data-readonly": rest.readOnly ? "" : void 0, style: props.style, "data-component": "pin-input", "data-size": size }, /* @__PURE__ */ React.createElement("span", { className: "srp-pin-input__boxes", "aria-hidden": true }, boxes), t11);
}
function _temp(e) {
  const el = e.currentTarget;
  const n = el.value.length;
  const s_0 = el.selectionStart;
  const end = el.selectionEnd;
  if ((s_0 !== n || end !== n) && !(s_0 === 0 && end === n)) {
    try {
      el.setSelectionRange(n, n);
    } catch {
    }
  }
}
var PinInput = /* @__PURE__ */ named("PinInput", PinInputRender);
export {
  PinInput
};
//# sourceMappingURL=PinInput.js.map
