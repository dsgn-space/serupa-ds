"use client";

// src/components/Input/Input.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { useValidityMessages } from "../../internal/validity.js";
import { cn, domId, isInvalid, omit, oneOf, useMergedRef, SIZES } from "../../internal/cn.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { activeIn } from "../../internal/root.js";
import { useFieldControl } from "../../internal/field.js";
import { displayNumber } from "../../internal/numbers.js";
import { useLocale } from "../../internal/provider.js";
import { useTextLimit } from "../../internal/textLimit.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { pressFocuses, useAffixes } from "../../internal/affix.js";
import { applyMask, digitsOnly, isPlain, parseMask, unmask } from "../../internal/mask.js";
import { isComposing } from "../../internal/ime.js";
var PLAIN = {
  useGrouping: false
};
var VERBATIM = /^(email|url)$/;
var VERBATIM_AUTOCOMPLETE = /\b(username|email|url|one-time-code)\b/;
var InputBox = /* @__PURE__ */ React.createContext({
  disabled: false
});
function useMask(input, mask) {
  const $ = _c(7);
  let t0;
  if ($[0] !== mask) {
    t0 = mask ? parseMask(mask) : null;
    $[0] = mask;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const slots = t0;
  if (!slots) {
    return input;
  }
  let rest;
  if ($[2] !== input || $[3] !== slots) {
    rest = {
      ...input
    };
    let t1;
    if ($[5] !== slots) {
      t1 = (v) => applyMask(slots, unmask(slots, String(v))).text;
      $[5] = slots;
      $[6] = t1;
    } else {
      t1 = $[6];
    }
    const show = t1;
    if (rest.value != null && !Array.isArray(rest.value)) {
      rest.value = show(rest.value);
    }
    if (rest.defaultValue != null && !Array.isArray(rest.defaultValue)) {
      rest.defaultValue = show(rest.defaultValue);
    }
    if (rest.inputMode === void 0 && digitsOnly(slots)) {
      rest.inputMode = "numeric";
    }
    const change = rest.onChange;
    const key = rest.onKeyDown;
    rest.onChange = function(e) {
      const el = e.target;
      const v_0 = el.value;
      const at = el.selectionStart != null ? el.selectionStart : v_0.length;
      const typed = unmask(slots, v_0);
      const {
        text,
        ends
      } = applyMask(slots, typed);
      if (text !== v_0) {
        const n = Math.min(unmask(slots, v_0.slice(0, at)).length, ends.length);
        el.value = text;
        if (activeIn(el) === el) {
          const end = ends[n - 1] ?? 0;
          el.setSelectionRange(end, end);
        }
      }
      if (change) {
        change(e);
      }
    };
    rest.onKeyDown = function(e_0) {
      if (key) {
        key(e_0);
      }
      const el_0 = e_0.currentTarget;
      const at_0 = el_0.selectionStart;
      if (!e_0.defaultPrevented && !isComposing(e_0) && (e_0.key === "Backspace" || e_0.key === "Delete") && at_0 != null && at_0 === el_0.selectionEnd) {
        const back = e_0.key === "Backspace";
        let p = at_0;
        while (back ? p > 0 && isPlain(slots, el_0.value, p - 1) : p < el_0.value.length && isPlain(slots, el_0.value, p)) {
          p = p + (back ? -1 : 1);
        }
        if (p !== at_0 && (back ? p > 0 : p < el_0.value.length)) {
          el_0.setSelectionRange(p, p);
        }
      }
    };
    $[2] = input;
    $[3] = slots;
    $[4] = rest;
  } else {
    rest = $[4];
  }
  return rest;
}
function InputRender(t0) {
  const $ = _c(51);
  let props;
  let ref;
  if ($[0] !== t0) {
    ({
      ref,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = props;
    $[2] = ref;
  } else {
    props = $[1];
    ref = $[2];
  }
  const nameRef = useNameCheck("Input", NAME_HOW.field);
  props = useFieldControl(props);
  let rest = omit(props, {
    size: 1,
    invalid: 1,
    startIcon: 1,
    endIcon: 1,
    prefix: 1,
    suffix: 1,
    showCount: 1,
    mask: 1,
    actions: 1,
    className: 1,
    style: 1
  });
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) {
    rest["aria-invalid"] = true;
  }
  if (rest.type === void 0) {
    rest.type = "text";
  }
  if (VERBATIM.test(rest.type) || VERBATIM_AUTOCOMPLETE.test(rest.autoComplete || "")) {
    if (rest.autoCapitalize === void 0) {
      rest.autoCapitalize = "off";
    }
    if (rest.autoCorrect === void 0) {
      rest.autoCorrect = "off";
    }
    if (rest.spellCheck === void 0) {
      rest.spellCheck = false;
    }
  }
  const own = React.useRef(null);
  rest = useMask(rest, props.mask);
  const t1 = !!props.showCount;
  let t2;
  if ($[3] !== t1) {
    t2 = {
      announce: t1
    };
    $[3] = t1;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const limited = useTextLimit(rest, own, t2);
  const {
    length,
    max
  } = limited;
  rest = useValidityMessages(limited.props, own);
  const t3 = React.useId();
  let t4;
  if ($[5] !== t3) {
    t4 = domId("srp-in", t3);
    $[5] = t3;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  const countId = t4;
  const locale = useLocale();
  let t5;
  if ($[7] !== locale) {
    t5 = (n) => displayNumber(n, locale, PLAIN);
    $[7] = locale;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  const num = t5;
  let t6;
  if ($[9] !== nameRef) {
    t6 = function(node) {
      own.current = node;
      nameRef(node);
    };
    $[9] = nameRef;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  const setRefs = useMergedRef(ref, t6);
  const affix = useAffixes(props.prefix, props.suffix, countId, own);
  if (affix.ids || props.showCount) {
    const t72 = rest;
    const t82 = rest["aria-describedby"];
    const t92 = props.showCount && countId;
    let t102;
    if ($[11] !== affix.ids || $[12] !== t82 || $[13] !== t92) {
      t102 = cn(t82, affix.ids, t92);
      $[11] = affix.ids;
      $[12] = t82;
      $[13] = t92;
      $[14] = t102;
    } else {
      t102 = $[14];
    }
    let t112;
    if ($[15] !== rest || $[16] !== t102) {
      t112 = {
        ...t72,
        "aria-describedby": t102
      };
      $[15] = rest;
      $[16] = t102;
      $[17] = t112;
    } else {
      t112 = $[17];
    }
    rest = t112;
  }
  const icon = _temp;
  const t7 = cn("srp-input", "srp-input--size-" + size, invalid && "srp-input--invalid", rest.disabled && "srp-input--disabled", rest.readOnly && "srp-input--readonly", props.className);
  const t8 = invalid ? "" : void 0;
  const t9 = rest.disabled ? "" : void 0;
  const t10 = rest.readOnly ? "" : void 0;
  const t11 = props.style;
  let t12;
  if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = (e) => pressFocuses(own)(e);
    $[18] = t12;
  } else {
    t12 = $[18];
  }
  let t13;
  if ($[19] !== icon || $[20] !== props.startIcon) {
    t13 = icon(props.startIcon, "start");
    $[19] = icon;
    $[20] = props.startIcon;
    $[21] = t13;
  } else {
    t13 = $[21];
  }
  const t14 = affix.prefix;
  let t15;
  if ($[22] !== rest || $[23] !== setRefs) {
    t15 = /* @__PURE__ */ React.createElement("input", { ...rest, ref: setRefs, className: "srp-input__field", key: "field" });
    $[22] = rest;
    $[23] = setRefs;
    $[24] = t15;
  } else {
    t15 = $[24];
  }
  const t16 = affix.suffix;
  let t17;
  if ($[25] !== countId || $[26] !== length || $[27] !== max || $[28] !== num || $[29] !== props.showCount) {
    t17 = props.showCount ? /* @__PURE__ */ React.createElement("span", { className: cn("srp-input__count", max != null && length >= max && "srp-input__count--full"), id: countId, key: "count" }, max != null ? num(length) + " / " + num(max) : num(length)) : null;
    $[25] = countId;
    $[26] = length;
    $[27] = max;
    $[28] = num;
    $[29] = props.showCount;
    $[30] = t17;
  } else {
    t17 = $[30];
  }
  let t18;
  if ($[31] !== icon || $[32] !== props.endIcon) {
    t18 = icon(props.endIcon, "end");
    $[31] = icon;
    $[32] = props.endIcon;
    $[33] = t18;
  } else {
    t18 = $[33];
  }
  let t19;
  if ($[34] !== props.actions || $[35] !== rest.disabled) {
    t19 = props.actions != null && props.actions !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-input__actions", key: "actions" }, /* @__PURE__ */ React.createElement(InputBox.Provider, { value: {
      disabled: !!rest.disabled
    } }, props.actions)) : null;
    $[34] = props.actions;
    $[35] = rest.disabled;
    $[36] = t19;
  } else {
    t19 = $[36];
  }
  let t20;
  if ($[37] !== affix.prefix || $[38] !== affix.suffix || $[39] !== props.style || $[40] !== size || $[41] !== t10 || $[42] !== t13 || $[43] !== t15 || $[44] !== t17 || $[45] !== t18 || $[46] !== t19 || $[47] !== t7 || $[48] !== t8 || $[49] !== t9) {
    t20 = /* @__PURE__ */ React.createElement("span", { className: t7, "data-invalid": t8, "data-disabled": t9, "data-readonly": t10, style: t11, "data-component": "input", "data-size": size, onMouseDown: t12 }, t13, t14, t15, t16, t17, t18, t19);
    $[37] = affix.prefix;
    $[38] = affix.suffix;
    $[39] = props.style;
    $[40] = size;
    $[41] = t10;
    $[42] = t13;
    $[43] = t15;
    $[44] = t17;
    $[45] = t18;
    $[46] = t19;
    $[47] = t7;
    $[48] = t8;
    $[49] = t9;
    $[50] = t20;
  } else {
    t20 = $[50];
  }
  return t20;
}
function _temp(source, side) {
  const node_0 = asIcon(source);
  return node_0 == null || node_0 === false ? null : /* @__PURE__ */ React.createElement("span", { className: "srp-input__icon srp-input__icon--" + side, "aria-hidden": true, key: side }, node_0);
}
var Input = /* @__PURE__ */ named("Input", InputRender);
function InputActionRender(t0) {
  const $ = _c(11);
  const {
    ref,
    ...props
  } = t0;
  const box = React.useContext(InputBox);
  const rest = omit(props, {
    icon: 1,
    label: 1,
    className: 1
  });
  const node = props.icon != null ? asIcon(props.icon) : null;
  const iconOnly = node != null && node !== false;
  const t1 = "button";
  const t2 = rest.disabled ?? box.disabled;
  const t3 = cn("srp-input-action", iconOnly ? "srp-input-action--icon" : "srp-input-action--text", props.className);
  const t4 = iconOnly ? rest["aria-label"] ?? props.label : rest["aria-label"];
  let t5;
  if ($[0] !== iconOnly || $[1] !== node || $[2] !== props) {
    t5 = iconOnly ? /* @__PURE__ */ React.createElement("span", { className: "srp-input-action__icon", "aria-hidden": true }, node) : props.label;
    $[0] = iconOnly;
    $[1] = node;
    $[2] = props;
    $[3] = t5;
  } else {
    t5 = $[3];
  }
  let t6;
  if ($[4] !== ref || $[5] !== rest || $[6] !== t2 || $[7] !== t3 || $[8] !== t4 || $[9] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("button", { type: t1, ...rest, ref, disabled: t2, className: t3, "data-component": "input-action", "aria-label": t4 }, t5);
    $[4] = ref;
    $[5] = rest;
    $[6] = t2;
    $[7] = t3;
    $[8] = t4;
    $[9] = t5;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  return t6;
}
var InputAction = /* @__PURE__ */ named("InputAction", InputActionRender);
export {
  Input,
  InputAction
};
//# sourceMappingURL=Input.js.map
