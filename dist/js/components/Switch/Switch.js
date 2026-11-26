"use client";

// src/components/Switch/Switch.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, domId, isInvalid, oneOf, omit, SIZES } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { warnOnce } from "../../internal/warn.js";
import { Check } from "../../material/builtin.js";
var OWN = {
  size: 1,
  icon: 1,
  invalid: 1,
  loading: 1,
  onCheckedChange: 1,
  description: 1,
  labelPlacement: 1,
  children: 1,
  className: 1,
  style: 1,
  type: 1,
  role: 1
};
var NATIVE_SWITCH = {
  switch: ""
};
function SwitchRender(t0) {
  const $ = _c(30);
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
  const nameRef = useNameCheck("Switch", NAME_HOW.label, ref);
  if (process.env.NODE_ENV !== "production" && props.label != null) {
    warnOnce("label-prop", "Switch: label isn't one of its props, so it lands on the <input> as an attribute and names nothing. Put the text in children.", "label-prop:Switch");
  }
  props = useFieldControl(props);
  const rest = omit(props, OWN);
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) {
    rest["aria-invalid"] = true;
  }
  const checkedChange = props.onCheckedChange;
  if (checkedChange) {
    const before = rest.onChange;
    rest.onChange = function(e) {
      if (before) {
        before(e);
      }
      checkedChange(e.currentTarget.checked, {
        event: e
      });
    };
  }
  const readOnly = !!rest.readOnly;
  const pending = !!props.loading;
  if (pending) {
    rest["aria-busy"] = true;
  }
  if (readOnly || pending) {
    if (readOnly) {
      rest["aria-readonly"] = true;
    }
    rest.onChange = _temp;
    const onClick = rest.onClick;
    rest.onClick = (e_0) => {
      if (onClick) {
        onClick(e_0);
      }
      e_0.preventDefault();
    };
  }
  const base = domId("srp-sw", React.useId());
  const labelId = base + "-label";
  const descId = base + "-desc";
  const hasLabel = props.children != null && props.children !== false && props.children !== "";
  const hasDesc = props.description != null && props.description !== false && props.description !== "";
  if (hasDesc) {
    rest["aria-describedby"] = cn(rest["aria-describedby"], descId);
  }
  if (hasDesc && hasLabel && rest["aria-label"] == null && rest["aria-labelledby"] == null) {
    rest["aria-labelledby"] = labelId;
  }
  const t1 = cn("srp-switch", "srp-switch--size-" + size, props.labelPlacement === "start" && "srp-switch--label-start", invalid && "srp-switch--invalid", rest.disabled && "srp-switch--disabled", readOnly && "srp-switch--readonly", pending && "srp-switch--pending", !hasLabel && !hasDesc && "srp-switch--bare", props.className);
  const t2 = invalid ? "" : void 0;
  const t3 = readOnly ? "" : void 0;
  const t4 = pending ? "" : void 0;
  let t5;
  if ($[3] !== nameRef || $[4] !== rest) {
    t5 = /* @__PURE__ */ React.createElement("input", { ...rest, ...NATIVE_SWITCH, ref: nameRef, type: "checkbox", role: "switch", className: "srp-switch__input", key: "input" });
    $[3] = nameRef;
    $[4] = rest;
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  let t6;
  if ($[6] !== pending || $[7] !== props.icon) {
    t6 = pending ? /* @__PURE__ */ React.createElement("span", { className: "srp-switch__spinner", key: "spin" }) : props.icon ? /* @__PURE__ */ React.createElement("svg", { className: "srp-switch__check", key: "check", width: "1em", height: "1em", viewBox: "0 -960 960 960", fill: "currentColor", focusable: "false" }, /* @__PURE__ */ React.createElement("path", { d: Check.d })) : null;
    $[6] = pending;
    $[7] = props.icon;
    $[8] = t6;
  } else {
    t6 = $[8];
  }
  let t7;
  if ($[9] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("span", { className: "srp-switch__thumb", "aria-hidden": true, key: "thumb" }, t6);
    $[9] = t6;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  let t8;
  if ($[11] !== t5 || $[12] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("span", { className: "srp-switch__control", key: "control" }, t5, t7);
    $[11] = t5;
    $[12] = t7;
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  let t9;
  if ($[14] !== descId || $[15] !== hasDesc || $[16] !== hasLabel || $[17] !== labelId || $[18] !== props.children || $[19] !== props.description) {
    t9 = hasLabel || hasDesc ? /* @__PURE__ */ React.createElement("span", { className: "srp-switch__text", key: "text" }, hasLabel ? /* @__PURE__ */ React.createElement("span", { className: "srp-switch__label", id: labelId, key: "label" }, props.children) : null, hasDesc ? /* @__PURE__ */ React.createElement("span", { className: "srp-switch__description", id: descId, key: "desc" }, props.description) : null) : null;
    $[14] = descId;
    $[15] = hasDesc;
    $[16] = hasLabel;
    $[17] = labelId;
    $[18] = props.children;
    $[19] = props.description;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  let t10;
  if ($[21] !== props.style || $[22] !== size || $[23] !== t1 || $[24] !== t2 || $[25] !== t3 || $[26] !== t4 || $[27] !== t8 || $[28] !== t9) {
    t10 = /* @__PURE__ */ React.createElement("label", { className: t1, "data-invalid": t2, "data-readonly": t3, style: props.style, "data-component": "switch", "data-size": size, "data-pending": t4 }, t8, t9);
    $[21] = props.style;
    $[22] = size;
    $[23] = t1;
    $[24] = t2;
    $[25] = t3;
    $[26] = t4;
    $[27] = t8;
    $[28] = t9;
    $[29] = t10;
  } else {
    t10 = $[29];
  }
  return t10;
}
function _temp() {
}
var Switch = /* @__PURE__ */ named("Switch", SwitchRender);
export {
  Switch
};
//# sourceMappingURL=Switch.js.map
