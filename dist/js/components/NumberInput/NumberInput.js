"use client";

// src/components/NumberInput/NumberInput.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { useLatest, useMergedRef, cn, domId, isInvalid, omit, oneOf, SIZES } from "../../internal/cn.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { pressFocuses, useAffixes } from "../../internal/affix.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { isComposing } from "../../internal/ime.js";
import { formatNumber, parseNumber } from "../../internal/numbers.js";
import { gridPlaces, roundTo } from "../../internal/step.js";
import { useLocale, useOwnLang, useSettings } from "../../internal/provider.js";
import { minorDigits, pinCurrencyDigits } from "../../internal/currency.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { reject } from "../../internal/rejectInput.js";
import * as icons from "../../material/builtin.js";
import { en as NumberInputWords } from "./labels.js";
import { en as DatePickerWords } from "../DatePicker/labels.js";
import { windowBlur } from "../../internal/focus.js";
import { warnOnce } from "../../internal/warn.js";
import { holdDelay, holdRepeat } from "../../internal/timing.js";
var words = /* @__PURE__ */ Object.assign({}, NumberInputWords, DatePickerWords);
var keyed = (key) => key ? JSON.parse(key) : void 0;
function NumberInputRender(t0) {
  const $ = _c(99);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const nameRef = useNameCheck("NumberInput", NAME_HOW.field);
  props = useFieldControl(props);
  const sds = useSettings(words);
  const {
    onValueChange,
    onInvalidInput
  } = props;
  const rest = omit(props, {
    size: 1,
    invalid: 1,
    startIcon: 1,
    prefix: 1,
    suffix: 1,
    className: 1,
    style: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    onInvalidInput: 1,
    min: 1,
    max: 1,
    step: 1,
    largeStep: 1,
    steppers: 1,
    decrementLabel: 1,
    incrementLabel: 1,
    locale: 1,
    formatOptions: 1,
    numberingSystem: 1,
    currency: 1,
    minorUnits: 1
  });
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  const locale = useLocale(props.locale);
  const lang = useOwnLang(props.locale);
  const given = props.currency ? {
    style: "currency",
    currency: props.currency,
    ...props.formatOptions
  } : props.formatOptions;
  const formatOptions = given && pinCurrencyDigits(given);
  const minor = !!(props.minorUnits && formatOptions?.style === "currency" && formatOptions.currency);
  const factor = minor ? 10 ** minorDigits(formatOptions.currency) : 1;
  let t2;
  if ($[0] !== factor || $[1] !== minor) {
    t2 = (n) => minor ? Math.round(n * factor) : n;
    $[0] = factor;
    $[1] = minor;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const out = t2;
  let t3;
  if ($[3] !== factor) {
    t3 = (n_0) => n_0 == null || !Number.isFinite(n_0) ? null : factor === 1 ? n_0 : n_0 / factor;
    $[3] = factor;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const major = t3;
  const rawStep = Number(props.step);
  const rawLarge = Number(props.largeStep);
  const step = Number.isFinite(rawStep) && rawStep > 0 ? rawStep / factor : formatOptions?.style === "percent" ? 0.01 : 1;
  let t4;
  if ($[5] !== rawLarge) {
    t4 = Number.isFinite(rawLarge) && rawLarge > 0 ? rawLarge : 10;
    $[5] = rawLarge;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  const large = t4;
  const min = props.min != null && isFinite(props.min) ? major(props.min) : void 0;
  const max = props.max != null && isFinite(props.max) ? major(props.max) : void 0;
  if (process.env.NODE_ENV !== "production" && min != null && max != null && min > max) {
    warnOnce("number-range", `NumberInput: min (${props.min}) is above max (${props.max}), so no value fits. Swap them, or check where they come from.`);
  }
  const optionsKey = String(formatOptions ? JSON.stringify(formatOptions) : "");
  let o;
  let t5;
  if ($[7] !== locale || $[8] !== optionsKey) {
    o = keyed(optionsKey);
    t5 = o?.style === "currency" || o?.style === "percent" ? new Intl.NumberFormat(locale, o).resolvedOptions().maximumFractionDigits ?? 0 : 0;
    $[7] = locale;
    $[8] = optionsKey;
    $[9] = o;
    $[10] = t5;
  } else {
    o = $[9];
    t5 = $[10];
  }
  const shown = t5;
  const shownPlaces = o?.style === "percent" ? shown + 2 : shown;
  const places = Math.max(gridPlaces(min, step), shownPlaces);
  let t6;
  if ($[11] !== locale || $[12] !== optionsKey) {
    const o_0 = keyed(optionsKey);
    t6 = o_0 ? parseNumber(formatNumber(1, locale, o_0), locale) || 1 : 1;
    $[11] = locale;
    $[12] = optionsKey;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  const scale = t6;
  const digits = String(props.numberingSystem || formatOptions?.numberingSystem || "");
  let t7;
  if ($[14] !== optionsKey) {
    t7 = keyed(optionsKey) || {
      useGrouping: false,
      maximumFractionDigits: 20
    };
    $[14] = optionsKey;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  let t8;
  if ($[16] !== digits || $[17] !== locale) {
    t8 = digits || new Intl.NumberFormat(locale).resolvedOptions().numberingSystem;
    $[16] = digits;
    $[17] = locale;
    $[18] = t8;
  } else {
    t8 = $[18];
  }
  let t9;
  if ($[19] !== t7 || $[20] !== t8) {
    t9 = {
      ...t7,
      numberingSystem: t8
    };
    $[19] = t7;
    $[20] = t8;
    $[21] = t9;
  } else {
    t9 = $[21];
  }
  const shownOptions = t9;
  let t10;
  if ($[22] !== locale || $[23] !== shownOptions) {
    t10 = (v) => v == null ? "" : formatNumber(v, locale, shownOptions);
    $[22] = locale;
    $[23] = shownOptions;
    $[24] = t10;
  } else {
    t10 = $[24];
  }
  const show = t10;
  const asShown = (v_0) => {
    if (v_0 == null || !formatOptions) {
      return v_0 ?? null;
    }
    const n_1 = parseNumber(show(v_0), locale);
    return typeof n_1 === "number" ? n_1 / scale : v_0;
  };
  const [held, setOwnValue, controlled] = useControllable(props.value, asShown(major(props.defaultValue)), "NumberInput", "value");
  const value = controlled ? asShown(major(held)) : held;
  const shown_0 = show(value);
  const [text, setText] = React.useState(shown_0);
  const typing = React.useRef(false);
  const [synced, resync] = React.useState(0);
  let t11;
  if ($[25] !== shown_0 || $[26] !== synced) {
    t11 = [shown_0, synced];
    $[25] = shown_0;
    $[26] = synced;
    $[27] = t11;
  } else {
    t11 = $[27];
  }
  React.useEffect(() => {
    if (!typing.current) {
      setText(shown_0);
    }
  }, t11);
  const el = React.useRef(null);
  const name = rest.name;
  delete rest.name;
  const raw = React.useRef(null);
  const [, rerender] = React.useState(0);
  useFormReset(name ? raw : el, () => {
    typing.current = false;
    const v_1 = controlled ? value : asShown(major(props.defaultValue));
    if (!controlled) {
      setOwnValue(v_1);
    }
    setText(show(v_1));
    rerender(_temp);
  });
  const locked = !!rest.disabled || !!rest.readOnly;
  const fit = (v_2) => {
    let n_3 = roundTo(v_2, places);
    if (min !== void 0 && n_3 < min) {
      n_3 = min;
    }
    if (max !== void 0 && n_3 > max) {
      n_3 = max;
    }
    return n_3;
  };
  let t12;
  if ($[28] !== locale || $[29] !== scale) {
    t12 = (s) => {
      const n_4 = parseNumber(s, locale);
      return n_4 != null && scale !== 1 ? n_4 / scale : n_4;
    };
    $[28] = locale;
    $[29] = scale;
    $[30] = t12;
  } else {
    t12 = $[30];
  }
  const parse = t12;
  let t13;
  if ($[31] !== parse) {
    t13 = (s_0) => {
      const n_5 = parse(s_0);
      const t = s_0.trim();
      return n_5 === void 0 && /[.,\u066b]$/.test(t) ? parse(t.slice(0, -1)) : n_5;
    };
    $[31] = parse;
    $[32] = t13;
  } else {
    t13 = $[32];
  }
  const finished = t13;
  const commit = (v_3) => {
    if (!controlled) {
      setOwnValue(v_3);
    }
    if (v_3 !== value && onValueChange) {
      onValueChange(v_3 == null ? v_3 : out(v_3));
    }
  };
  const put = (v_4) => {
    typing.current = false;
    setText(show(v_4));
    commit(v_4);
    resync(_temp2);
  };
  const nudge = (by) => {
    if (locked) {
      return;
    }
    const base = parse(text);
    const from = typeof base === "number" ? base : value ?? (min !== void 0 && min > 0 ? min - step : max !== void 0 && max < 0 ? max + step : 0);
    const origin = min ?? 0;
    const k = roundTo((from - origin) / step, 9);
    const onGrid = Number.isInteger(k) || places > gridPlaces(min, step);
    const to = onGrid ? k + by : by > 0 ? Math.floor(k) + by : Math.ceil(k) + by;
    put(fit(origin + to * step));
  };
  const [rejected, setRejected] = React.useState("");
  const onChange = (e) => {
    setRejected("");
    setText(e.target.value);
    typing.current = true;
    const n_7 = parse(e.target.value);
    if (n_7 === null || n_7 !== void 0 && (min === void 0 || n_7 >= min) && (max === void 0 || n_7 <= max)) {
      commit(n_7);
    }
    if (rest.onChange) {
      rest.onChange(e);
    }
  };
  const outside = (n_8) => min !== void 0 && n_8 < min || max !== void 0 && n_8 > max;
  const onBlur = (e_0) => {
    if (windowBlur(e_0)) {
      if (rest.onBlur) {
        rest.onBlur(e_0);
      }
      return;
    }
    if (!typing.current) {
      if (rest.onBlur) {
        rest.onBlur(e_0);
      }
      return;
    }
    const n_9 = finished(text);
    const v_5 = n_9 == null ? null : fit(n_9 === void 0 ? value ?? 0 : n_9);
    const out_0 = n_9 === void 0 ? value : v_5;
    put(out_0);
    if (n_9 === void 0) {
      reject(text, "unreadable", onInvalidInput, sds.labels.inputNotAccepted, setRejected);
    } else {
      if (n_9 != null && outside(n_9) && onInvalidInput) {
        onInvalidInput(text.trim(), "range");
      }
    }
    if (rest.onBlur) {
      rest.onBlur(e_0);
    }
  };
  const onKeyDown = (e_1) => {
    if (rest.onKeyDown) {
      rest.onKeyDown(e_1);
    }
    if (e_1.defaultPrevented || isComposing(e_1)) {
      return;
    }
    const k_0 = e_1.key;
    const big = e_1.shiftKey ? large : 1;
    if ((e_1.altKey || e_1.ctrlKey || e_1.metaKey) && k_0 !== "Enter") {
      return;
    }
    if (k_0 === "ArrowUp") {
      nudge(big);
    } else {
      if (k_0 === "ArrowDown") {
        nudge(-big);
      } else {
        if (k_0 === "PageUp") {
          nudge(large);
        } else {
          if (k_0 === "PageDown") {
            nudge(-large);
          } else {
            if (k_0 === "Home" && min !== void 0 && !locked) {
              put(min);
            } else {
              if (k_0 === "End" && max !== void 0 && !locked) {
                put(max);
              } else {
                if (k_0 === "Enter") {
                  const n_10 = finished(text);
                  if (n_10 != null) {
                    put(fit(n_10));
                    if (outside(n_10) && onInvalidInput) {
                      onInvalidInput(text.trim(), "range");
                    }
                  }
                  return;
                } else {
                  return;
                }
              }
            }
          }
        }
      }
    }
    e_1.preventDefault();
  };
  const current = parse(text);
  const now = typeof current === "number" ? current : value;
  const t14 = props;
  let t15;
  if ($[33] !== t14.startIcon) {
    t15 = asIcon(t14.startIcon);
    $[33] = t14.startIcon;
    $[34] = t15;
  } else {
    t15 = $[34];
  }
  const left = t15;
  const niId = domId("srp-ni", React.useId());
  const affix = useAffixes(props.prefix, props.suffix, niId, el);
  const press = (by_0) => {
    nudge(by_0);
    if (el.current && document.activeElement !== el.current) {
      el.current.focus({
        preventScroll: true
      });
    }
  };
  const nudgeRef = useLatest(nudge);
  const hold = React.useRef(null);
  let t16;
  if ($[35] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t16 = () => {
      const h = hold.current;
      if (h) {
        window.clearTimeout(h.timer);
        window.clearInterval(h.timer);
        h.timer = 0;
      }
    };
    $[35] = t16;
  } else {
    t16 = $[35];
  }
  const stop = t16;
  let t17;
  let t18;
  if ($[36] !== stop) {
    t17 = () => {
      const onKey = (e_2) => {
        if (e_2.key === "Escape") {
          stop();
        }
      };
      const up = () => {
        stop();
        window.setTimeout(() => {
          hold.current = null;
        }, 0);
      };
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", stop);
      window.addEventListener("blur", stop);
      window.addEventListener("keydown", onKey);
      return () => {
        stop();
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", stop);
        window.removeEventListener("blur", stop);
        window.removeEventListener("keydown", onKey);
      };
    };
    t18 = [stop];
    $[36] = stop;
    $[37] = t17;
    $[38] = t18;
  } else {
    t17 = $[37];
    t18 = $[38];
  }
  React.useEffect(t17, t18);
  const atEnd = (by_1) => locked || (by_1 < 0 ? min !== void 0 && now != null && now <= min : max !== void 0 && now != null && now >= max);
  let t19;
  if ($[39] !== atEnd || $[40] !== stop) {
    t19 = () => {
      const h_0 = hold.current;
      if (h_0 && h_0.timer && atEnd(h_0.by)) {
        stop();
      }
    };
    $[39] = atEnd;
    $[40] = stop;
    $[41] = t19;
  } else {
    t19 = $[41];
  }
  React.useEffect(t19);
  const holdDown = (e_3, by_2) => {
    e_3.preventDefault();
    if (e_3.button !== 0) {
      return;
    }
    stop();
    press(by_2);
    const h_1 = {
      by: by_2,
      timer: 0
    };
    h_1.timer = window.setTimeout(() => {
      if (hold.current === h_1) {
        h_1.timer = window.setInterval(() => nudgeRef.current(by_2), holdRepeat);
      }
    }, holdDelay);
    hold.current = h_1;
  };
  let t20;
  if ($[42] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t20 = (e_4) => {
      if (hold.current && hold.current.timer) {
        e_4.preventDefault();
      }
    };
    $[42] = t20;
  } else {
    t20 = $[42];
  }
  const longTouch = t20;
  const clickStep = (by_3) => {
    if (hold.current) {
      hold.current = null;
    } else {
      press(by_3);
    }
  };
  const mergedRef = useMergedRef(ref, nameRef, el);
  const t21 = cn("srp-input srp-number-input", "srp-input--size-" + size, invalid && "srp-input--invalid", rest.disabled && "srp-input--disabled", rest.readOnly && "srp-input--readonly", props.steppers !== false && "srp-number-input--steppers", props.className);
  const t22 = invalid ? "" : void 0;
  const t23 = rest.disabled ? "" : void 0;
  const t24 = rest.readOnly ? "" : void 0;
  const t25 = props;
  const t26 = "number-input";
  let t27;
  if ($[43] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t27 = (e_5) => pressFocuses(el)(e_5);
    $[43] = t27;
  } else {
    t27 = $[43];
  }
  let t28;
  if ($[44] !== left) {
    t28 = left != null && left !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-input__icon srp-input__icon--start", "aria-hidden": true }, left) : null;
    $[44] = left;
    $[45] = t28;
  } else {
    t28 = $[45];
  }
  const t29 = invalid || rest["aria-invalid"];
  const t30 = rest.lang ?? lang;
  const t31 = "text";
  const t32 = rest.inputMode || (places > 0 || min !== void 0 && min < 0 || min === void 0 ? "decimal" : "numeric");
  const t33 = "spinbutton";
  const t34 = now ?? void 0;
  const t35 = formatOptions && now != null ? show(now) : void 0;
  const t36 = rest.autoComplete || "off";
  const t37 = "srp-input__field";
  const t38 = cn(rest["aria-describedby"], affix.ids, rejected && niId + "-rejected") || void 0;
  let t39;
  if ($[46] !== max || $[47] !== mergedRef || $[48] !== min || $[49] !== onBlur || $[50] !== onChange || $[51] !== onKeyDown || $[52] !== rest || $[53] !== t29 || $[54] !== t30 || $[55] !== t32 || $[56] !== t34 || $[57] !== t35 || $[58] !== t36 || $[59] !== t38 || $[60] !== text) {
    t39 = /* @__PURE__ */ React.createElement("input", { ...rest, "aria-invalid": t29, ref: mergedRef, lang: t30, type: t31, inputMode: t32, role: t33, "aria-valuenow": t34, "aria-valuetext": t35, "aria-valuemin": min, "aria-valuemax": max, autoComplete: t36, className: t37, value: text, "aria-describedby": t38, onChange, onBlur, onKeyDown, onFocus: rest.onFocus });
    $[46] = max;
    $[47] = mergedRef;
    $[48] = min;
    $[49] = onBlur;
    $[50] = onChange;
    $[51] = onKeyDown;
    $[52] = rest;
    $[53] = t29;
    $[54] = t30;
    $[55] = t32;
    $[56] = t34;
    $[57] = t35;
    $[58] = t36;
    $[59] = t38;
    $[60] = text;
    $[61] = t39;
  } else {
    t39 = $[61];
  }
  let t40;
  if ($[62] !== name || $[63] !== out || $[64] !== rest.disabled || $[65] !== rest.form || $[66] !== value) {
    t40 = name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", ref: raw, name, form: rest.form, disabled: rest.disabled, value: value == null ? "" : String(out(value)) }) : null;
    $[62] = name;
    $[63] = out;
    $[64] = rest.disabled;
    $[65] = rest.form;
    $[66] = value;
    $[67] = t40;
  } else {
    t40 = $[67];
  }
  let t41;
  if ($[68] !== atEnd || $[69] !== clickStep || $[70] !== holdDown || $[71] !== longTouch || $[72] !== props.decrementLabel || $[73] !== props.incrementLabel || $[74] !== props.steppers || $[75] !== rest.id || $[76] !== sds || $[77] !== stop) {
    t41 = props.steppers !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-number-input__steppers" }, /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: -1, className: "srp-number-input__step", "aria-label": props.decrementLabel || sds.labels.decrease, "aria-controls": rest.id, disabled: atEnd(-1), onPointerDown: (e_6) => holdDown(e_6, -1), onPointerLeave: stop, onContextMenu: longTouch, onClick: () => clickStep(-1) }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Remove })), /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: -1, className: "srp-number-input__step", "aria-label": props.incrementLabel || sds.labels.increase, "aria-controls": rest.id, disabled: atEnd(1), onPointerDown: (e_7) => holdDown(e_7, 1), onPointerLeave: stop, onContextMenu: longTouch, onClick: () => clickStep(1) }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Add }))) : null;
    $[68] = atEnd;
    $[69] = clickStep;
    $[70] = holdDown;
    $[71] = longTouch;
    $[72] = props.decrementLabel;
    $[73] = props.incrementLabel;
    $[74] = props.steppers;
    $[75] = rest.id;
    $[76] = sds;
    $[77] = stop;
    $[78] = t41;
  } else {
    t41 = $[78];
  }
  let t42;
  if ($[79] !== affix.prefix || $[80] !== affix.suffix || $[81] !== size || $[82] !== t21 || $[83] !== t22 || $[84] !== t23 || $[85] !== t24 || $[86] !== t25.style || $[87] !== t27 || $[88] !== t28 || $[89] !== t39 || $[90] !== t40 || $[91] !== t41) {
    t42 = /* @__PURE__ */ React.createElement("span", { className: t21, "data-invalid": t22, "data-disabled": t23, "data-readonly": t24, style: t25.style, "data-component": t26, "data-size": size, onMouseDown: t27 }, t28, affix.prefix, t39, affix.suffix, t40, t41);
    $[79] = affix.prefix;
    $[80] = affix.suffix;
    $[81] = size;
    $[82] = t21;
    $[83] = t22;
    $[84] = t23;
    $[85] = t24;
    $[86] = t25.style;
    $[87] = t27;
    $[88] = t28;
    $[89] = t39;
    $[90] = t40;
    $[91] = t41;
    $[92] = t42;
  } else {
    t42 = $[92];
  }
  let t43;
  if ($[93] !== niId || $[94] !== rejected) {
    t43 = rejected && /* @__PURE__ */ React.createElement("span", { id: niId + "-rejected", className: "srp-input-rejected" }, rejected);
    $[93] = niId;
    $[94] = rejected;
    $[95] = t43;
  } else {
    t43 = $[95];
  }
  let t44;
  if ($[96] !== t42 || $[97] !== t43) {
    t44 = /* @__PURE__ */ React.createElement(React.Fragment, null, t42, t43);
    $[96] = t42;
    $[97] = t43;
    $[98] = t44;
  } else {
    t44 = $[98];
  }
  return t44;
}
function _temp2(n_6) {
  return n_6 + 1;
}
function _temp(n_2) {
  return n_2 + 1;
}
var NumberInput = /* @__PURE__ */ named("NumberInput", NumberInputRender);
export {
  NumberInput
};
//# sourceMappingURL=NumberInput.js.map
