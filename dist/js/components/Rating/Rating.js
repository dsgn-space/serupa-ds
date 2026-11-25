"use client";

// src/components/Rating/Rating.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useMergedRef, cn, domId, oneOf, SIZES } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useFieldsetDisabled } from "../../internal/useFieldsetDisabled.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
var STAR = "m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z";
var Star = () => {
  const $ = _c(1);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 -960 960 960", "aria-hidden": true, focusable: "false" }, /* @__PURE__ */ React.createElement("path", { d: STAR }));
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
};
var round = (n, by) => Math.round(n / by) * by;
function RatingRender(t0) {
  const $ = _c(72);
  let given;
  let ref;
  if ($[0] !== t0) {
    ({
      ref,
      ...given
    } = t0);
    $[0] = t0;
    $[1] = given;
    $[2] = ref;
  } else {
    given = $[1];
    ref = $[2];
  }
  const props = useFieldControl(given);
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  let allowHalf;
  let autoFocus;
  let className;
  let clearable;
  let defaultValue;
  let disabled;
  let form;
  let invalid;
  let maxIn;
  let name;
  let onKeyDown;
  let onPointerLeave;
  let onValueChange;
  let readOnly;
  let required;
  let rest;
  let sizeIn;
  let valueIn;
  if ($[3] !== props) {
    ({
      invalid,
      value: valueIn,
      defaultValue,
      onValueChange,
      max: maxIn,
      allowHalf,
      clearable,
      readOnly,
      disabled,
      name,
      form,
      required,
      size: sizeIn,
      className,
      onKeyDown,
      onPointerLeave,
      autoFocus,
      ...rest
    } = props);
    $[3] = props;
    $[4] = allowHalf;
    $[5] = autoFocus;
    $[6] = className;
    $[7] = clearable;
    $[8] = defaultValue;
    $[9] = disabled;
    $[10] = form;
    $[11] = invalid;
    $[12] = maxIn;
    $[13] = name;
    $[14] = onKeyDown;
    $[15] = onPointerLeave;
    $[16] = onValueChange;
    $[17] = readOnly;
    $[18] = required;
    $[19] = rest;
    $[20] = sizeIn;
    $[21] = valueIn;
  } else {
    allowHalf = $[4];
    autoFocus = $[5];
    className = $[6];
    clearable = $[7];
    defaultValue = $[8];
    disabled = $[9];
    form = $[10];
    invalid = $[11];
    maxIn = $[12];
    name = $[13];
    onKeyDown = $[14];
    onPointerLeave = $[15];
    onValueChange = $[16];
    readOnly = $[17];
    required = $[18];
    rest = $[19];
    sizeIn = $[20];
    valueIn = $[21];
  }
  const nameRef = useNameCheck("Rating", NAME_HOW.group);
  const sds = useSettings(words);
  const locale = useLocale();
  const size = oneOf(SIZES, sizeIn, "md");
  let t1;
  if ($[22] !== maxIn) {
    t1 = typeof maxIn === "number" && maxIn >= 1 && Number.isFinite(maxIn) ? Math.min(20, Math.floor(maxIn)) : 5;
    $[22] = maxIn;
    $[23] = t1;
  } else {
    t1 = $[23];
  }
  const max = t1;
  const step = allowHalf ? 0.5 : 1;
  let t2;
  if ($[24] !== max) {
    t2 = (n) => typeof n === "number" && isFinite(n) && n > 0 ? Math.min(max, n) : null;
    $[24] = max;
    $[25] = t2;
  } else {
    t2 = $[25];
  }
  const fit = t2;
  const [chosen, setOwn, controlled] = useControllable(valueIn, fit(defaultValue), "Rating", "value");
  const value = controlled ? fit(chosen) : chosen;
  const [hover, setHover] = React.useState(null);
  const root = React.useRef(null);
  const auto = domId("srp-rating", React.useId());
  let t3;
  if ($[26] !== controlled || $[27] !== defaultValue || $[28] !== fit || $[29] !== setOwn) {
    t3 = () => {
      if (!controlled) {
        setOwn(fit(defaultValue));
      }
    };
    $[26] = controlled;
    $[27] = defaultValue;
    $[28] = fit;
    $[29] = setOwn;
    $[30] = t3;
  } else {
    t3 = $[30];
  }
  useFormReset(root, t3, form);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const off = !!disabled || inDisabledFieldset;
  let t4;
  if ($[31] !== controlled || $[32] !== onValueChange || $[33] !== setOwn || $[34] !== value) {
    t4 = (n_0) => {
      if (n_0 === value) {
        return;
      }
      if (!controlled) {
        setOwn(n_0);
      }
      if (onValueChange) {
        onValueChange(n_0);
      }
    };
    $[31] = controlled;
    $[32] = onValueChange;
    $[33] = setOwn;
    $[34] = value;
    $[35] = t4;
  } else {
    t4 = $[35];
  }
  const set = t4;
  const picked = value == null ? null : round(value, step);
  const shown = readOnly ? value : hover ?? picked;
  const stars = Array.from({
    length: max
  }, (_, i) => {
    const share = shown == null ? 0 : Math.min(1, Math.max(0, shown - i));
    return {
      i,
      fill: Math.round(share * 100) + "%"
    };
  });
  const box = _temp;
  const styled = useServerStyles();
  let t5;
  if ($[36] !== nameRef || $[37] !== styled) {
    t5 = (n_1) => {
      root.current = n_1;
      delegateFocus(n_1, () => n_1 && (n_1.querySelector("input:checked:enabled") || n_1.querySelector("input:enabled")));
      nameRef(n_1);
      styled(n_1);
    };
    $[36] = nameRef;
    $[37] = styled;
    $[38] = t5;
  } else {
    t5 = $[38];
  }
  const ref2 = useMergedRef(ref, t5);
  let t6;
  if ($[39] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = () => root.current;
    $[39] = t6;
  } else {
    t6 = $[39];
  }
  useAutoFocus(autoFocus, t6);
  const t7 = "srp-rating--size-" + size;
  const t8 = readOnly && "srp-rating--readonly";
  const t9 = off && "srp-rating--disabled";
  let t10;
  if ($[40] !== className || $[41] !== t7 || $[42] !== t8 || $[43] !== t9) {
    t10 = cn("srp-rating", t7, t8, t9, className);
    $[40] = className;
    $[41] = t7;
    $[42] = t8;
    $[43] = t9;
    $[44] = t10;
  } else {
    t10 = $[44];
  }
  const classes = t10;
  if (readOnly) {
    const said = value == null ? 0 : Math.round(value * 10) / 10;
    let t112;
    if ($[45] !== locale || $[46] !== max || $[47] !== rest || $[48] !== said || $[49] !== sds.labels) {
      t112 = rest["aria-label"] ? rest["aria-label"] + ", " + sds.labels.ratingValue(said, max, displayNumber(said, locale), displayNumber(max, locale)) : sds.labels.ratingValue(said, max, displayNumber(said, locale), displayNumber(max, locale));
      $[45] = locale;
      $[46] = max;
      $[47] = rest;
      $[48] = said;
      $[49] = sds.labels;
      $[50] = t112;
    } else {
      t112 = $[50];
    }
    return /* @__PURE__ */ React.createElement("div", { ...rest, ref: ref2, role: "img", "aria-label": t112, className: classes, "data-readonly": readOnly ? "" : void 0, "data-disabled": off ? "" : void 0, "data-component": "rating", "data-size": size }, stars.map((s) => box(null, s.i, s.fill)));
  }
  const startHalf = _temp2;
  const radios = (i_1) => {
    const choices = allowHalf ? [i_1 + 0.5, i_1 + 1] : [i_1 + 1];
    return choices.map((v) => {
      const whole = v === i_1 + 1;
      const split = allowHalf && whole;
      return /* @__PURE__ */ React.createElement("input", { key: v, type: "radio", className: cn("srp-rating__choice", allowHalf && !whole && "srp-rating__choice--half"), name: name || auto, form, value: v, checked: picked === v, disabled, required, "aria-label": sds.labels.ratingStars(v, displayNumber(v, locale)), onChange: (e_0) => {
        if (!split || !(e_0.nativeEvent.detail > 0)) {
          set(v);
        }
      }, onClick: (e_1) => {
        const pointer = e_1.detail > 0;
        const want = split && pointer && startHalf(e_1) ? i_1 + 0.5 : v;
        if (clearable && picked === want) {
          set(null);
        } else {
          if (split && pointer) {
            set(want);
          }
        }
        if (want !== v) {
          const half = e_1.currentTarget.previousElementSibling;
          if (half) {
            half.focus();
          }
        }
      }, onPointerMove: split ? (e_2) => {
        if (!off && e_2.pointerType !== "touch") {
          setHover(e_2.clientX && startHalf(e_2) ? i_1 + 0.5 : v);
        }
      } : void 0, onPointerEnter: split ? void 0 : (e_3) => {
        if (!off && e_3.pointerType !== "touch") {
          setHover(v);
        }
      } });
    });
  };
  const t11 = "radiogroup";
  const t12 = rest["aria-labelledby"] || (rest["aria-label"] ? void 0 : fieldLabel);
  const t13 = invalid || void 0;
  const t14 = off || void 0;
  const t15 = required || rest["aria-required"] === true || rest["aria-required"] === "true" || void 0;
  const t16 = readOnly ? "" : void 0;
  const t17 = off ? "" : void 0;
  const t18 = "rating";
  let t19;
  if ($[51] !== onPointerLeave) {
    t19 = (e_4) => {
      if (onPointerLeave) {
        onPointerLeave(e_4);
      }
      setHover(null);
    };
    $[51] = onPointerLeave;
    $[52] = t19;
  } else {
    t19 = $[52];
  }
  let t20;
  if ($[53] !== clearable || $[54] !== off || $[55] !== onKeyDown || $[56] !== set) {
    t20 = (e_5) => {
      if (onKeyDown) {
        onKeyDown(e_5);
      }
      if (!e_5.defaultPrevented && clearable && !off && (e_5.key === "Backspace" || e_5.key === "Delete" || e_5.key === " " && e_5.target.checked)) {
        e_5.preventDefault();
        set(null);
      }
    };
    $[53] = clearable;
    $[54] = off;
    $[55] = onKeyDown;
    $[56] = set;
    $[57] = t20;
  } else {
    t20 = $[57];
  }
  const t21 = stars.map((s_0) => box(radios(s_0.i), s_0.i, s_0.fill));
  let t22;
  if ($[58] !== classes || $[59] !== ref2 || $[60] !== rest || $[61] !== size || $[62] !== t12 || $[63] !== t13 || $[64] !== t14 || $[65] !== t15 || $[66] !== t16 || $[67] !== t17 || $[68] !== t19 || $[69] !== t20 || $[70] !== t21) {
    t22 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: ref2, role: t11, "aria-labelledby": t12, "aria-invalid": t13, "aria-disabled": t14, "aria-required": t15, className: classes, "data-readonly": t16, "data-disabled": t17, "data-component": t18, "data-size": size, onPointerLeave: t19, onKeyDown: t20 }, t21);
    $[58] = classes;
    $[59] = ref2;
    $[60] = rest;
    $[61] = size;
    $[62] = t12;
    $[63] = t13;
    $[64] = t14;
    $[65] = t15;
    $[66] = t16;
    $[67] = t17;
    $[68] = t19;
    $[69] = t20;
    $[70] = t21;
    $[71] = t22;
  } else {
    t22 = $[71];
  }
  return t22;
}
function _temp2(e) {
  const t = e.currentTarget;
  const r = (t.parentElement || t).getBoundingClientRect();
  const x = e.clientX - r.left;
  return isRtl(t) ? x > r.width / 2 : x < r.width / 2;
}
function _temp(children, i_0, fill) {
  return /* @__PURE__ */ React.createElement("span", { key: i_0, className: "srp-rating__star", style: {
    "--srp-rating-share": fill
  } }, /* @__PURE__ */ React.createElement("span", { className: "srp-rating__empty" }, /* @__PURE__ */ React.createElement(Star, null)), /* @__PURE__ */ React.createElement("span", { className: "srp-rating__fill" }, /* @__PURE__ */ React.createElement(Star, null)), children);
}
var Rating = /* @__PURE__ */ named("Rating", RatingRender);
export {
  Rating
};
//# sourceMappingURL=Rating.js.map
