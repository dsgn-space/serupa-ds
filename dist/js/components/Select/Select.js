"use client";

// src/components/Select/Select.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, isInvalid, oneOf, omit, useMergedRef, SIZES } from "../../internal/cn.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { warnOnce } from "../../internal/warn.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import * as icons from "../../material/builtin.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
var OWN = {
  size: 1,
  invalid: 1,
  startIcon: 1,
  placeholder: 1,
  options: 1,
  children: 1,
  className: 1,
  style: 1,
  multiple: 1,
  readOnly: 1
};
function optionNodes(list) {
  return (list || []).map(function(o, i) {
    if (o != null && typeof o === "object" && "options" in o && Array.isArray(o.options)) return /* @__PURE__ */ React.createElement("optgroup", { key: "g" + i, label: o.label, disabled: o.disabled }, optionNodes(o.options));
    const v = o != null && typeof o === "object" ? o : {
      value: o,
      label: o,
      disabled: void 0
    };
    return /* @__PURE__ */ React.createElement("option", { key: String(v.value), value: v.value, disabled: v.disabled }, v.label != null ? v.label : v.value);
  });
}
function SelectRender(t0) {
  const $ = _c(35);
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
  const nameRef = useNameCheck("Select", NAME_HOW.field);
  props = useFieldControl(props);
  const rest = omit(props, OWN);
  if (process.env.NODE_ENV !== "production" && props.multiple) {
    warnOnce("select-multiple", "Serupa.Select: multiple isn't supported (a native multi-select is hard to use); use checkboxes instead. It was ignored.");
  }
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) {
    rest["aria-invalid"] = true;
  }
  const hasPh = props.placeholder != null && props.placeholder !== "";
  if (hasPh && rest.value === void 0 && rest.defaultValue === void 0) {
    rest.defaultValue = "";
  }
  const [cur, setPicked, controlled] = useControllable(rest.value, rest.defaultValue, "Select", "value");
  const {
    onChange,
    onKeyDown,
    onMouseDown
  } = rest;
  const ownRef = React.useRef(null);
  const setRefs = useMergedRef(ref, nameRef, ownRef);
  const start = rest.defaultValue;
  useFormReset(ownRef, () => {
    if (!controlled) {
      setPicked(start);
    }
  });
  let t1;
  let t2;
  if ($[3] !== controlled || $[4] !== cur) {
    t1 = () => {
      const s = ownRef.current;
      if (process.env.NODE_ENV !== "production" && controlled && cur != null && s && ![...s.options].some((o) => o.value === String(cur))) {
        warnOnce("select-value", `Select: value "${String(cur)}" matches no option, so it shows "${s.value}" and a form sends that. Set value to one of the options' values, or add an option for it.`);
      }
    };
    t2 = [controlled, cur];
    $[3] = controlled;
    $[4] = cur;
    $[5] = t1;
    $[6] = t2;
  } else {
    t1 = $[5];
    t2 = $[6];
  }
  React.useEffect(t1, t2);
  const shownRef = React.useRef("");
  let t3;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => {
      if (ownRef.current) {
        shownRef.current = ownRef.current.value;
      }
    };
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  React.useEffect(t3);
  const readOnly = !!props.readOnly;
  if (readOnly) {
    rest["aria-readonly"] = true;
  }
  const handlers = readOnly ? {
    onKeyDown: (e) => {
      if (onKeyDown) {
        onKeyDown(e);
      }
      if (e.key !== "Tab" && e.key !== "Escape" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    },
    onMouseDown: (e_0) => {
      if (onMouseDown) {
        onMouseDown(e_0);
      }
      e_0.preventDefault();
      e_0.currentTarget.focus();
    },
    onChange: (e_1) => {
      e_1.target.value = shownRef.current;
    }
  } : {
    onChange: (e_2) => {
      if (!controlled) {
        setPicked(e_2.target.value);
      }
      if (onChange) {
        onChange(e_2);
      }
    }
  };
  const empty = hasPh && (cur == null || cur === "");
  let t4;
  if ($[8] !== props.startIcon) {
    t4 = asIcon(props.startIcon);
    $[8] = props.startIcon;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  const left = t4;
  const t5 = cn("srp-select", "srp-select--size-" + size, invalid && "srp-select--invalid", props.disabled && "srp-select--disabled", readOnly && "srp-select--readonly", empty && "srp-select--empty", left != null && left !== false && "srp-select--has-icon", props.className);
  const t6 = invalid ? "" : void 0;
  const t7 = props.disabled ? "" : void 0;
  const t8 = readOnly ? "" : void 0;
  const t9 = empty ? "" : void 0;
  const t10 = props.style;
  let t11;
  if ($[10] !== left) {
    t11 = left == null || left === false ? null : /* @__PURE__ */ React.createElement("span", { className: "srp-select__icon srp-select__icon--start", "aria-hidden": true, key: "left" }, left);
    $[10] = left;
    $[11] = t11;
  } else {
    t11 = $[11];
  }
  let t12;
  if ($[12] !== hasPh || $[13] !== props.placeholder) {
    t12 = hasPh ? /* @__PURE__ */ React.createElement("option", { value: "", disabled: true, key: "__placeholder", className: "srp-select__placeholder" }, props.placeholder) : null;
    $[12] = hasPh;
    $[13] = props.placeholder;
    $[14] = t12;
  } else {
    t12 = $[14];
  }
  let t13;
  if ($[15] !== props.options) {
    t13 = optionNodes(props.options);
    $[15] = props.options;
    $[16] = t13;
  } else {
    t13 = $[16];
  }
  let t14;
  if ($[17] !== handlers || $[18] !== props.children || $[19] !== rest || $[20] !== setRefs || $[21] !== t12 || $[22] !== t13) {
    t14 = /* @__PURE__ */ React.createElement("select", { ...rest, ...handlers, ref: setRefs, className: "srp-select__field", key: "field" }, t12, t13, props.children);
    $[17] = handlers;
    $[18] = props.children;
    $[19] = rest;
    $[20] = setRefs;
    $[21] = t12;
    $[22] = t13;
    $[23] = t14;
  } else {
    t14 = $[23];
  }
  let t15;
  if ($[24] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t15 = /* @__PURE__ */ React.createElement("span", { className: "srp-select__icon srp-select__icon--chevron", "aria-hidden": true, key: "chevron" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore }));
    $[24] = t15;
  } else {
    t15 = $[24];
  }
  let t16;
  if ($[25] !== props.style || $[26] !== size || $[27] !== t11 || $[28] !== t14 || $[29] !== t5 || $[30] !== t6 || $[31] !== t7 || $[32] !== t8 || $[33] !== t9) {
    t16 = /* @__PURE__ */ React.createElement("span", { className: t5, "data-invalid": t6, "data-disabled": t7, "data-readonly": t8, "data-empty": t9, style: t10, "data-component": "select", "data-size": size }, t11, t14, t15);
    $[25] = props.style;
    $[26] = size;
    $[27] = t11;
    $[28] = t14;
    $[29] = t5;
    $[30] = t6;
    $[31] = t7;
    $[32] = t8;
    $[33] = t9;
    $[34] = t16;
  } else {
    t16 = $[34];
  }
  return t16;
}
var Select = /* @__PURE__ */ named("Select", SelectRender);
export {
  Select
};
//# sourceMappingURL=Select.js.map
