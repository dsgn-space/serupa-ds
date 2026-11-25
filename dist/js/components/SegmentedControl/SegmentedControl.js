"use client";

// src/components/SegmentedControl/SegmentedControl.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, isInvalid, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { lastInputKeyboard, listenForInput } from "../../internal/lastInput.js";
import { useFieldLabel } from "../../internal/fieldLabel.js";
import { useFieldControl } from "../../internal/field.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { reflow } from "../../internal/reflow.js";
import { isRtl } from "../../internal/position.js";
var OWN = {
  options: 1,
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
  size: 1,
  fullWidth: 1,
  disabled: 1,
  name: 1,
  form: 1,
  invalid: 1,
  required: 1,
  readOnly: 1,
  "aria-invalid": 1,
  "aria-required": 1,
  "aria-readonly": 1,
  autoFocus: 1,
  className: 1
};
function SegmentedControlRender(t0) {
  const $ = _c(58);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const nameRef = useNameCheck("SegmentedControl", NAME_HOW.group);
  props = useFieldControl(props);
  const rest = omit(props, OWN);
  const options = props.options || [];
  const disabled = !!props.disabled;
  const invalid = isInvalid(props.invalid, props["aria-invalid"]);
  const truthy = _temp;
  const readOnly = !!props.readOnly || truthy(props["aria-readonly"]);
  const required = !!props.required || truthy(props["aria-required"]);
  let t2;
  if ($[0] !== disabled) {
    t2 = (o) => !o.disabled && !disabled;
    $[0] = disabled;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const usable = options.filter(t2);
  const [value, setOwn, controlled] = useControllable(props.value, props.defaultValue ?? (options.find(_temp2) || {}).value, "SegmentedControl", "value");
  const root = React.useRef(null);
  useFormReset(root, () => {
    if (!controlled) {
      setOwn(props.defaultValue ?? (options.find(_temp3) || {}).value);
    }
  }, props.form);
  let t3;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = {};
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const buttons = React.useRef(t3);
  const [box, setBox] = React.useState(null);
  const sized = useControlSize(props.size);
  const size = sized === "sm" || sized === "lg" ? sized : "md";
  const fieldLabel = useFieldLabel(props.id);
  let t4;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = () => root.current && root.current.querySelector('[role=radio][tabindex="0"]');
    $[3] = t4;
  } else {
    t4 = $[3];
  }
  const tabStop = t4;
  useAutoFocus(props.autoFocus, tabStop);
  const choose = (v, focus) => {
    if (focus) {
      const b = buttons.current[v];
      if (b) {
        b.focus();
      }
    }
    if (v === value || readOnly) {
      return;
    }
    if (!controlled) {
      setOwn(v);
    }
    if (props.onValueChange) {
      props.onValueChange(v);
    }
  };
  const [cut, setCut] = React.useState("");
  const [tight, setTight] = React.useState(false);
  const fullWidth = !!props.fullWidth;
  let t5;
  if ($[4] !== fullWidth || $[5] !== value) {
    t5 = () => {
      const r = root.current;
      const b_0 = value != null ? buttons.current[value] : null;
      let c = "";
      let total = 0;
      let n = 0;
      let most = 0;
      for (const k in buttons.current) {
        const btn = buttons.current[k];
        const l = btn?.querySelector(".srp-segmented__label");
        if (!btn) {
          continue;
        }
        total = total + btn.offsetWidth;
        n++;
        if (fullWidth) {
          const cs = getComputedStyle(btn);
          const kids = [...btn.children];
          let need = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + (parseFloat(cs.columnGap) || 0) * Math.max(0, kids.length - 1);
          for (const kid of kids) {
            need = need + (kid === l ? l.scrollWidth : kid.offsetWidth);
          }
          most = Math.max(most, need);
        }
        if (l && l.scrollWidth > l.clientWidth) {
          c = c + (k + "\n");
        }
      }
      setCut(c);
      setTight(!!fullWidth && n > 0 && most > total / n + 0.5);
      if (!r || !b_0) {
        setBox(null);
        return;
      }
      const rb = r.getBoundingClientRect();
      const bb = b_0.getBoundingClientRect();
      const k_0 = !rb.width || Math.abs(r.offsetWidth - rb.width) < 1 ? 1 : (parseFloat(getComputedStyle(r).width) || r.offsetWidth) / rb.width;
      const own = parseFloat(getComputedStyle(b_0).scale) || 1;
      const w = bb.width * k_0 / own;
      const x = (bb.left + bb.width / 2 - rb.left) * k_0 - w / 2 - r.clientLeft;
      setBox((p) => p && p.x === x && p.w === w ? p : {
        x,
        w
      });
    };
    $[4] = fullWidth;
    $[5] = value;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  const measure = t5;
  let t6;
  if ($[7] !== measure || $[8] !== options || $[9] !== size || $[10] !== tight) {
    t6 = [measure, options.length, size, tight];
    $[7] = measure;
    $[8] = options;
    $[9] = size;
    $[10] = tight;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  useIsoLayoutEffect(measure, t6);
  const indicator = React.useRef(null);
  const last = React.useRef(null);
  const sliding = React.useRef(void 0);
  let t7;
  if ($[12] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = {
      l: 0,
      w: 0
    };
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  const span = React.useRef(t7);
  let t8;
  if ($[13] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t8 = (el) => {
      const [, t92, , t102] = (getComputedStyle(el, "::before").clipPath.match(/-?[\d.]+(?:e-?\d+)?px/g) || []).map(parseFloat);
      const r_0 = t92 === void 0 ? 0 : t92;
      const l_0 = t102 === void 0 ? 0 : t102;
      return {
        x: span.current.l + l_0,
        w: span.current.w - l_0 - r_0
      };
    };
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  const drawnAt = t8;
  const settle = _temp4;
  let t9;
  if ($[14] !== box || $[15] !== value) {
    t9 = () => {
      const el_1 = indicator.current;
      let was = last.current;
      last.current = box ? {
        ...box,
        v: value
      } : null;
      clearTimeout(sliding.current);
      if (el_1 && box && el_1.hasAttribute("data-slide")) {
        if (was) {
          was = {
            ...was,
            ...drawnAt(el_1)
          };
        }
        settle(el_1, box);
      }
      if (!el_1 || !box || !was || was.v === value || !box.w || was.x === box.x && was.w === box.w || lastInputKeyboard()) {
        return;
      }
      const l_1 = Math.min(was.x, box.x);
      const r_1 = Math.max(was.x + was.w, box.x + box.w);
      const cut_0 = (at_0) => {
        el_1.style.setProperty("--srp-seg-l", at_0.x - l_1 + "px");
        el_1.style.setProperty("--srp-seg-r", r_1 - at_0.x - at_0.w + "px");
      };
      el_1.setAttribute("data-flip", "");
      el_1.setAttribute("data-slide", "");
      span.current = {
        l: l_1,
        w: r_1 - l_1
      };
      el_1.style.left = l_1 + "px";
      el_1.style.width = r_1 - l_1 + "px";
      cut_0(was);
      reflow(el_1);
      el_1.removeAttribute("data-flip");
      const t = getComputedStyle(el_1, "::after");
      const ms = (parseFloat(t.transitionDuration) + parseFloat(t.transitionDelay)) * 1e3 || 0;
      cut_0(box);
      if (ms > 0) {
        sliding.current = setTimeout(() => settle(el_1, box), ms);
      } else {
        settle(el_1, box);
      }
    };
    $[14] = box;
    $[15] = value;
    $[16] = t9;
  } else {
    t9 = $[16];
  }
  let t10;
  if ($[17] !== box) {
    t10 = [box];
    $[17] = box;
    $[18] = t10;
  } else {
    t10 = $[18];
  }
  useIsoLayoutEffect(t9, t10);
  let t11;
  let t12;
  if ($[19] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = () => () => clearTimeout(sliding.current);
    t12 = [];
    $[19] = t11;
    $[20] = t12;
  } else {
    t11 = $[19];
    t12 = $[20];
  }
  React.useEffect(t11, t12);
  let t13;
  if ($[21] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t13 = [];
    $[21] = t13;
  } else {
    t13 = $[21];
  }
  useIsoLayoutEffect(listenForInput, t13);
  let t14;
  if ($[22] !== measure) {
    t14 = () => {
      const r_2 = root.current;
      if (!r_2 || typeof ResizeObserver === "undefined") {
        return;
      }
      const ro = new ResizeObserver(() => measure());
      ro.observe(r_2);
      for (const k_1 in buttons.current) {
        const b_1 = buttons.current[k_1];
        if (b_1) {
          ro.observe(b_1);
        }
      }
      return () => ro.disconnect();
    };
    $[22] = measure;
    $[23] = t14;
  } else {
    t14 = $[23];
  }
  let t15;
  if ($[24] !== measure || $[25] !== options) {
    t15 = [measure, options.length];
    $[24] = measure;
    $[25] = options;
    $[26] = t15;
  } else {
    t15 = $[26];
  }
  React.useEffect(t14, t15);
  const onKeyDownCapture = (e) => {
    if (rest.onKeyDownCapture) {
      rest.onKeyDownCapture(e);
    }
    if (rest.onKeyDown) {
      rest.onKeyDown(e);
    }
  };
  const onKeyDown = (e_0) => {
    if (!usable.length || e_0.defaultPrevented || e_0.altKey || e_0.ctrlKey || e_0.metaKey) {
      return;
    }
    const rtl = isRtl(e_0.currentTarget);
    const from = readOnly || !usable.some((o_2) => o_2.value === value) ? e_0.currentTarget.dataset.value : value;
    const i = usable.findIndex((o_3) => o_3.value === from);
    let n_0;
    bb293: switch (e_0.key) {
      case "ArrowRight": {
        n_0 = i + (rtl ? -1 : 1);
        break bb293;
      }
      case "ArrowDown": {
        n_0 = i + 1;
        break bb293;
      }
      case "ArrowLeft": {
        n_0 = i + (rtl ? 1 : -1);
        break bb293;
      }
      case "ArrowUp": {
        n_0 = i - 1;
        break bb293;
      }
      case "Home": {
        n_0 = 0;
        break bb293;
      }
      case "End": {
        n_0 = usable.length - 1;
        break bb293;
      }
      default: {
        return;
      }
    }
    e_0.preventDefault();
    const o_4 = usable[(n_0 + usable.length) % usable.length];
    if (o_4) {
      choose(o_4.value, true);
    }
  };
  const crossing = _temp5;
  const onFocus = (e_2) => {
    if (rest.onFocus && crossing(e_2)) {
      rest.onFocus(e_2);
    }
  };
  const onBlur = (e_3) => {
    if (rest.onBlur && crossing(e_3)) {
      rest.onBlur(e_3);
    }
  };
  let t16;
  if ($[27] !== value) {
    t16 = (o_5) => o_5.value === value;
    $[27] = value;
    $[28] = t16;
  } else {
    t16 = $[28];
  }
  const checkedUsable = usable.some(t16);
  let t17;
  if ($[29] !== nameRef) {
    t17 = (n_1) => {
      root.current = n_1;
      nameRef(n_1);
      delegateFocus(n_1, tabStop);
    };
    $[29] = nameRef;
    $[30] = t17;
  } else {
    t17 = $[30];
  }
  const mergedRef = useMergedRef(ref, t17);
  const t18 = "radiogroup";
  const t19 = disabled || void 0;
  const t20 = invalid || void 0;
  const t21 = required || void 0;
  const t22 = readOnly || void 0;
  const t23 = props["aria-labelledby"] ?? (props["aria-label"] ? void 0 : fieldLabel);
  const t24 = cn("srp-segmented", "srp-segmented--size-" + size, props.fullWidth && "srp-segmented--full", props.fullWidth && tight && "srp-segmented--fit", disabled && "srp-segmented--disabled", invalid && "srp-segmented--invalid", readOnly && "srp-segmented--readonly", props.className);
  const t25 = disabled ? "" : void 0;
  const t26 = invalid ? "" : void 0;
  const t27 = readOnly ? "" : void 0;
  const t28 = "segmented-control";
  const t29 = void 0;
  let t30;
  if ($[31] !== box) {
    t30 = box ? /* @__PURE__ */ React.createElement("span", { ref: indicator, className: "srp-segmented__indicator", "aria-hidden": true, style: {
      left: box.x,
      width: box.w
    } }) : null;
    $[31] = box;
    $[32] = t30;
  } else {
    t30 = $[32];
  }
  const t31 = options.map((o_6) => {
    const on = o_6.value === value;
    const off = disabled || !!o_6.disabled;
    const icon = asIcon(o_6.icon);
    const hasLabel = o_6.label != null && o_6.label !== false && o_6.label !== "";
    const tab = off ? -1 : on || !checkedUsable && usable[0] && usable[0].value === o_6.value ? 0 : -1;
    return /* @__PURE__ */ React.createElement("button", { key: o_6.value, ref: (n_2) => {
      buttons.current[o_6.value] = n_2;
    }, type: "button", role: "radio", "aria-checked": on, "aria-label": o_6["aria-label"], title: typeof o_6.label === "string" && !o_6["aria-label"] && cut.split("\n").includes(o_6.value) ? o_6.label : void 0, disabled: off, tabIndex: tab, "data-value": o_6.value, className: cn("srp-segmented__item", on && "srp-segmented__item--selected", !hasLabel && "srp-segmented__item--icon-only"), "data-selected": on ? "" : void 0, onClick: () => choose(o_6.value), onKeyDown }, icon != null && icon !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-segmented__icon", "aria-hidden": true }, icon) : null, hasLabel ? /* @__PURE__ */ React.createElement("span", { className: "srp-segmented__label" }, o_6.label) : null);
  });
  let t32;
  if ($[33] !== disabled || $[34] !== props.form || $[35] !== props.name || $[36] !== value) {
    t32 = props.name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: props.form, value: value ?? "", disabled }) : null;
    $[33] = disabled;
    $[34] = props.form;
    $[35] = props.name;
    $[36] = value;
    $[37] = t32;
  } else {
    t32 = $[37];
  }
  let t33;
  if ($[38] !== mergedRef || $[39] !== onBlur || $[40] !== onFocus || $[41] !== onKeyDownCapture || $[42] !== rest || $[43] !== size || $[44] !== t19 || $[45] !== t20 || $[46] !== t21 || $[47] !== t22 || $[48] !== t23 || $[49] !== t24 || $[50] !== t25 || $[51] !== t26 || $[52] !== t27 || $[53] !== t29 || $[54] !== t30 || $[55] !== t31 || $[56] !== t32) {
    t33 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, role: t18, "aria-disabled": t19, "aria-invalid": t20, "aria-required": t21, "aria-readonly": t22, "aria-labelledby": t23, className: t24, "data-disabled": t25, "data-invalid": t26, "data-readonly": t27, "data-component": t28, "data-size": size, onKeyDown: t29, onKeyDownCapture, onFocus, onBlur }, t30, t31, t32);
    $[38] = mergedRef;
    $[39] = onBlur;
    $[40] = onFocus;
    $[41] = onKeyDownCapture;
    $[42] = rest;
    $[43] = size;
    $[44] = t19;
    $[45] = t20;
    $[46] = t21;
    $[47] = t22;
    $[48] = t23;
    $[49] = t24;
    $[50] = t25;
    $[51] = t26;
    $[52] = t27;
    $[53] = t29;
    $[54] = t30;
    $[55] = t31;
    $[56] = t32;
    $[57] = t33;
  } else {
    t33 = $[57];
  }
  return t33;
}
function _temp5(e_1) {
  return !(e_1.relatedTarget instanceof Node && e_1.currentTarget.contains(e_1.relatedTarget));
}
function _temp4(el_0, at) {
  el_0.removeAttribute("data-slide");
  el_0.style.left = at.x + "px";
  el_0.style.width = at.w + "px";
}
function _temp3(o_1) {
  return !o_1.disabled;
}
function _temp2(o_0) {
  return !o_0.disabled;
}
function _temp(a) {
  return a === true || a === "true";
}
var SegmentedControl = /* @__PURE__ */ named("SegmentedControl", SegmentedControlRender);
export {
  SegmentedControl
};
//# sourceMappingURL=SegmentedControl.js.map
