"use client";

// src/components/Select/Select.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
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
  const $ = _c(27);
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
  const controlled = rest.value !== void 0;
  if (hasPh && !controlled && rest.defaultValue === void 0) {
    rest.defaultValue = "";
  }
  const [picked, setPicked] = React.useState(controlled ? rest.value : rest.defaultValue);
  const cur = controlled ? rest.value : picked;
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
  React.useEffect(() => {
    const s = ownRef.current;
    if (process.env.NODE_ENV !== "production" && controlled && cur != null && s && ![...s.options].some((o) => o.value === String(cur))) {
      warnOnce("select-value", `Select: value "${String(cur)}" matches no option, so it shows "${s.value}" and a form sends that. Set value to one of the options' values, or add an option for it.`);
    }
  }, [controlled, cur]);
  const shownRef = React.useRef("");
  let t1;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      if (ownRef.current) {
        shownRef.current = ownRef.current.value;
      }
    };
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  React.useEffect(t1);
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
  let t2;
  if ($[4] !== props.startIcon) {
    t2 = asIcon(props.startIcon);
    $[4] = props.startIcon;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const left = t2;
  const t3 = cn("srp-select", "srp-select--size-" + size, invalid && "srp-select--invalid", props.disabled && "srp-select--disabled", readOnly && "srp-select--readonly", empty && "srp-select--empty", left != null && left !== false && "srp-select--has-icon", props.className);
  const t4 = props.style;
  let t5;
  if ($[6] !== left) {
    t5 = left == null || left === false ? null : /* @__PURE__ */ React.createElement("span", { className: "srp-select__icon srp-select__icon--start", "aria-hidden": true, key: "left" }, left);
    $[6] = left;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== hasPh || $[9] !== props.placeholder) {
    t6 = hasPh ? /* @__PURE__ */ React.createElement("option", { value: "", disabled: true, key: "__placeholder", className: "srp-select__placeholder" }, props.placeholder) : null;
    $[8] = hasPh;
    $[9] = props.placeholder;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  let t7;
  if ($[11] !== props.options) {
    t7 = optionNodes(props.options);
    $[11] = props.options;
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  let t8;
  if ($[13] !== handlers || $[14] !== props.children || $[15] !== rest || $[16] !== setRefs || $[17] !== t6 || $[18] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("select", { ...rest, ...handlers, ref: setRefs, className: "srp-select__field", key: "field" }, t6, t7, props.children);
    $[13] = handlers;
    $[14] = props.children;
    $[15] = rest;
    $[16] = setRefs;
    $[17] = t6;
    $[18] = t7;
    $[19] = t8;
  } else {
    t8 = $[19];
  }
  let t9;
  if ($[20] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = /* @__PURE__ */ React.createElement("span", { className: "srp-select__icon srp-select__icon--chevron", "aria-hidden": true, key: "chevron" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore }));
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  let t10;
  if ($[21] !== props.style || $[22] !== size || $[23] !== t3 || $[24] !== t5 || $[25] !== t8) {
    t10 = /* @__PURE__ */ React.createElement("span", { className: t3, style: t4, "data-component": "select", "data-size": size }, t5, t8, t9);
    $[21] = props.style;
    $[22] = size;
    $[23] = t3;
    $[24] = t5;
    $[25] = t8;
    $[26] = t10;
  } else {
    t10 = $[26];
  }
  return t10;
}
var Select = /* @__PURE__ */ named("Select", SelectRender);
export {
  Select
};
//# sourceMappingURL=Select.js.map
