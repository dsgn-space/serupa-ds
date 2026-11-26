"use client";

// src/components/Radio/Radio.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, domId, isInvalid, omit, oneOf, useMergedRef, SIZES, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { warnOnce } from "../../internal/warn.js";
import { markKeyFocus } from "../../internal/keyFocus.js";
import { listenForInput } from "../../internal/lastInput.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { isRtl } from "../../internal/position.js";
var VARIANTS = ["plain", "card"];
var RadioContext = /* @__PURE__ */ React.createContext(null);
var GROUP_OWN = {
  name: 1,
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
  orientation: 1,
  size: 1,
  variant: 1,
  invalid: 1,
  disabled: 1,
  required: 1,
  readOnly: 1,
  children: 1,
  className: 1,
  autoFocus: 1
};
function RadioGroupRender(t0) {
  const $ = _c(3);
  const {
    ref,
    ...props
  } = t0;
  const nameRef = useNameCheck("RadioGroup", NAME_HOW.group);
  const rest = omit(props, GROUP_OWN);
  const autoName = domId("srp-rg", React.useId());
  const [cur, setPicked, controlled] = useControllable(props.value, props.defaultValue, "RadioGroup", "value");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  const orientation = props.orientation === "horizontal" ? "horizontal" : "vertical";
  const onValueChange = props.onValueChange;
  const root = React.useRef(null);
  const [, rerender] = React.useState(0);
  useFormReset(root, function() {
    if (!controlled) {
      setPicked(props.defaultValue);
    }
    rerender(_temp);
  });
  const around = useControlSize(props.size);
  const ctx = {
    name: props.name || autoName,
    value: cur,
    size: around,
    variant: props.variant,
    invalid,
    disabled: !!props.disabled,
    required: !!props.required,
    readOnly: !!props.readOnly,
    select: function(v, e) {
      if (!controlled) {
        setPicked(v);
      }
      if (onValueChange) {
        onValueChange(v, {
          event: e
        });
      }
    }
  };
  const own = rest.onKeyDown;
  rest.onKeyDown = function(e_0) {
    if (own) {
      own(e_0);
    }
    const t = e_0.target;
    const k = e_0.key;
    if (props.readOnly && t.type === "radio" && k.indexOf("Arrow") === 0) {
      e_0.preventDefault();
      return;
    }
    if (e_0.defaultPrevented || e_0.altKey || e_0.ctrlKey || e_0.metaKey || t.type !== "radio" || k.indexOf("Arrow") !== 0) {
      return;
    }
    const all = Array.prototype.filter.call(root.current.querySelectorAll("input[type=radio]"), function(r) {
      return r.name === t.name && !r.disabled && r.getClientRects().length > 0;
    });
    const fwd = k === "ArrowDown" || k === (isRtl(t) ? "ArrowLeft" : "ArrowRight");
    const i = all.indexOf(t);
    const to = fwd ? i === all.length - 1 ? all[0] : null : i === 0 ? all[all.length - 1] : null;
    if (!to || to === t) {
      return;
    }
    e_0.preventDefault();
    to.focus();
    to.click();
  };
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => root.current;
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  useAutoFocus(props.autoFocus, t1);
  let t2;
  if ($[1] !== nameRef) {
    t2 = function(n_0) {
      root.current = n_0;
      delegateFocus(n_0, () => n_0 && (n_0.querySelector("input:checked:enabled") || n_0.querySelector("input:enabled")));
      nameRef(n_0);
    };
    $[1] = nameRef;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const groupRef = useMergedRef(ref, t2);
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: groupRef, role: "radiogroup", "aria-invalid": invalid || void 0, "aria-required": props.required || rest["aria-required"] || void 0, "aria-disabled": props.disabled || void 0, "aria-readonly": props.readOnly || void 0, className: cn("srp-radio-group", "srp-radio-group--" + orientation, props.variant === "card" && "srp-radio-group--card", invalid && "srp-radio-group--invalid", props.className), "data-component": "radio-group", "data-orientation": orientation }, /* @__PURE__ */ React.createElement(RadioContext.Provider, { value: ctx }, props.children));
}
function _temp(n) {
  return n + 1;
}
var RadioGroup = /* @__PURE__ */ named("RadioGroup", RadioGroupRender);
var OWN = {
  size: 1,
  variant: 1,
  invalid: 1,
  description: 1,
  children: 1,
  className: 1,
  style: 1,
  type: 1
};
function RadioRender(t0) {
  const $ = _c(22);
  const {
    ref,
    ...props
  } = t0;
  const nameRef = useNameCheck("Radio", NAME_HOW.label, ref);
  if (process.env.NODE_ENV !== "production" && props.label != null) {
    warnOnce("label-prop", "Radio: label isn't one of its props, so it lands on the <input> as an attribute and names nothing. Put the text in children.", "label-prop:Radio");
  }
  const ctx = React.useContext(RadioContext);
  const rest = omit(props, OWN);
  const outer = useControlSize(void 0);
  const size = oneOf(SIZES, props.size, oneOf(SIZES, ctx ? ctx.size : outer, "md"));
  const card = oneOf(VARIANTS, props.variant, oneOf(VARIANTS, ctx && ctx.variant, "plain")) === "card";
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) {
    rest["aria-invalid"] = true;
  }
  if (ctx) {
    const own = rest.onChange;
    rest.name = ctx.name;
    rest.checked = ctx.value != null && String(ctx.value) === String(props.value);
    delete rest.defaultChecked;
    rest.onChange = function(e) {
      if (own) {
        own(e);
      }
      ctx.select(props.value, e);
    };
    if (ctx.disabled) {
      rest.disabled = true;
    }
    if (ctx.required) {
      rest.required = true;
    }
    if (ctx.readOnly) {
      rest.readOnly = true;
    }
  }
  const readOnly = !!rest.readOnly;
  if (readOnly) {
    delete rest.onChange;
    const onClick = rest.onClick;
    rest.onClick = (e_0) => {
      if (onClick) {
        onClick(e_0);
      }
      e_0.preventDefault();
    };
  }
  markKeyFocus(rest);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  useIsoLayoutEffect(listenForInput, t1);
  const base = domId("srp-rd", React.useId());
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
  const t2 = cn("srp-radio", "srp-radio--size-" + size, card && "srp-radio--card", (invalid || ctx && ctx.invalid) && "srp-radio--invalid", rest.disabled && "srp-radio--disabled", readOnly && "srp-radio--readonly", !hasLabel && !hasDesc && "srp-radio--bare", props.className);
  const t3 = invalid || ctx && ctx.invalid ? "" : void 0;
  const t4 = readOnly ? "" : void 0;
  const t5 = size;
  let t6;
  if ($[1] !== nameRef || $[2] !== rest) {
    t6 = /* @__PURE__ */ React.createElement("input", { ...rest, ref: nameRef, type: "radio", className: "srp-radio__input", key: "input" });
    $[1] = nameRef;
    $[2] = rest;
    $[3] = t6;
  } else {
    t6 = $[3];
  }
  let t7;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = /* @__PURE__ */ React.createElement("span", { className: "srp-radio__dot", "aria-hidden": true, key: "dot" });
    $[4] = t7;
  } else {
    t7 = $[4];
  }
  let t8;
  if ($[5] !== t6) {
    t8 = /* @__PURE__ */ React.createElement("span", { className: "srp-radio__control", key: "control" }, t6, t7);
    $[5] = t6;
    $[6] = t8;
  } else {
    t8 = $[6];
  }
  let t9;
  if ($[7] !== descId || $[8] !== hasDesc || $[9] !== hasLabel || $[10] !== labelId || $[11] !== props.children || $[12] !== props.description) {
    t9 = hasLabel || hasDesc ? /* @__PURE__ */ React.createElement("span", { className: "srp-radio__text", key: "text" }, hasLabel ? /* @__PURE__ */ React.createElement("span", { className: "srp-radio__label", id: labelId, key: "label" }, props.children) : null, hasDesc ? /* @__PURE__ */ React.createElement("span", { className: "srp-radio__description", id: descId, key: "desc" }, props.description) : null) : null;
    $[7] = descId;
    $[8] = hasDesc;
    $[9] = hasLabel;
    $[10] = labelId;
    $[11] = props.children;
    $[12] = props.description;
    $[13] = t9;
  } else {
    t9 = $[13];
  }
  let t10;
  if ($[14] !== props.style || $[15] !== t2 || $[16] !== t3 || $[17] !== t4 || $[18] !== t5 || $[19] !== t8 || $[20] !== t9) {
    t10 = /* @__PURE__ */ React.createElement("label", { className: t2, "data-invalid": t3, "data-readonly": t4, style: props.style, "data-component": "radio", "data-size": t5 }, t8, t9);
    $[14] = props.style;
    $[15] = t2;
    $[16] = t3;
    $[17] = t4;
    $[18] = t5;
    $[19] = t8;
    $[20] = t9;
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  return t10;
}
var Radio = /* @__PURE__ */ named("Radio", RadioRender);
export {
  Radio,
  RadioGroup
};
//# sourceMappingURL=Radio.js.map
