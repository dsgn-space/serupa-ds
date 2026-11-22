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
  const $ = _c(94);
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
  const step = Number(props.step) > 0 ? Number(props.step) / factor : formatOptions?.style === "percent" ? 0.01 : 1;
  const large = Number(props.largeStep) > 0 ? Number(props.largeStep) : 10;
  const min = props.min != null && isFinite(props.min) ? major(props.min) : void 0;
  const max = props.max != null && isFinite(props.max) ? major(props.max) : void 0;
  if (process.env.NODE_ENV !== "production" && min != null && max != null && min > max) {
    warnOnce("number-range", `NumberInput: min (${props.min}) is above max (${props.max}), so no value fits. Swap them, or check where they come from.`);
  }
  const optionsKey = String(formatOptions ? JSON.stringify(formatOptions) : "");
  let o;
  let t4;
  if ($[5] !== locale || $[6] !== optionsKey) {
    o = keyed(optionsKey);
    t4 = o?.style === "currency" || o?.style === "percent" ? new Intl.NumberFormat(locale, o).resolvedOptions().maximumFractionDigits ?? 0 : 0;
    $[5] = locale;
    $[6] = optionsKey;
    $[7] = o;
    $[8] = t4;
  } else {
    o = $[7];
    t4 = $[8];
  }
  const shown = t4;
  const shownPlaces = o?.style === "percent" ? shown + 2 : shown;
  const places = Math.max(gridPlaces(min, step), shownPlaces);
  let t5;
  if ($[9] !== locale || $[10] !== optionsKey) {
    const o_0 = keyed(optionsKey);
    t5 = o_0 ? parseNumber(formatNumber(1, locale, o_0), locale) || 1 : 1;
    $[9] = locale;
    $[10] = optionsKey;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  const scale = t5;
  const digits = String(props.numberingSystem || formatOptions?.numberingSystem || "");
  let t6;
  if ($[12] !== optionsKey) {
    t6 = keyed(optionsKey) || {
      useGrouping: false,
      maximumFractionDigits: 20
    };
    $[12] = optionsKey;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  let t7;
  if ($[14] !== digits || $[15] !== locale) {
    t7 = digits || new Intl.NumberFormat(locale).resolvedOptions().numberingSystem;
    $[14] = digits;
    $[15] = locale;
    $[16] = t7;
  } else {
    t7 = $[16];
  }
  let t8;
  if ($[17] !== t6 || $[18] !== t7) {
    t8 = {
      ...t6,
      numberingSystem: t7
    };
    $[17] = t6;
    $[18] = t7;
    $[19] = t8;
  } else {
    t8 = $[19];
  }
  const shownOptions = t8;
  let t9;
  if ($[20] !== locale || $[21] !== shownOptions) {
    t9 = (v) => v == null ? "" : formatNumber(v, locale, shownOptions);
    $[20] = locale;
    $[21] = shownOptions;
    $[22] = t9;
  } else {
    t9 = $[22];
  }
  const show = t9;
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
  let t10;
  if ($[23] !== shown_0 || $[24] !== synced) {
    t10 = [shown_0, synced];
    $[23] = shown_0;
    $[24] = synced;
    $[25] = t10;
  } else {
    t10 = $[25];
  }
  React.useEffect(() => {
    if (!typing.current) {
      setText(shown_0);
    }
  }, t10);
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
  let t11;
  if ($[26] !== locale || $[27] !== scale) {
    t11 = (s) => {
      const n_4 = parseNumber(s, locale);
      return n_4 != null && scale !== 1 ? n_4 / scale : n_4;
    };
    $[26] = locale;
    $[27] = scale;
    $[28] = t11;
  } else {
    t11 = $[28];
  }
  const parse = t11;
  let t12;
  if ($[29] !== parse) {
    t12 = (s_0) => {
      const n_5 = parse(s_0);
      const t = s_0.trim();
      return n_5 === void 0 && /[.,\u066b]$/.test(t) ? parse(t.slice(0, -1)) : n_5;
    };
    $[29] = parse;
    $[30] = t12;
  } else {
    t12 = $[30];
  }
  const finished = t12;
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
  const t13 = props;
  let t14;
  if ($[31] !== t13.startIcon) {
    t14 = asIcon(t13.startIcon);
    $[31] = t13.startIcon;
    $[32] = t14;
  } else {
    t14 = $[32];
  }
  const left = t14;
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
  let t15;
  if ($[33] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t15 = () => {
      const h = hold.current;
      if (h) {
        window.clearTimeout(h.timer);
        window.clearInterval(h.timer);
        h.timer = 0;
      }
    };
    $[33] = t15;
  } else {
    t15 = $[33];
  }
  const stop = t15;
  let t16;
  let t17;
  if ($[34] !== stop) {
    t16 = () => {
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
    t17 = [stop];
    $[34] = stop;
    $[35] = t16;
    $[36] = t17;
  } else {
    t16 = $[35];
    t17 = $[36];
  }
  React.useEffect(t16, t17);
  const atEnd = (by_1) => locked || (by_1 < 0 ? min !== void 0 && now != null && now <= min : max !== void 0 && now != null && now >= max);
  let t18;
  if ($[37] !== atEnd || $[38] !== stop) {
    t18 = () => {
      const h_0 = hold.current;
      if (h_0 && h_0.timer && atEnd(h_0.by)) {
        stop();
      }
    };
    $[37] = atEnd;
    $[38] = stop;
    $[39] = t18;
  } else {
    t18 = $[39];
  }
  React.useEffect(t18);
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
  let t19;
  if ($[40] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t19 = (e_4) => {
      if (hold.current && hold.current.timer) {
        e_4.preventDefault();
      }
    };
    $[40] = t19;
  } else {
    t19 = $[40];
  }
  const longTouch = t19;
  const clickStep = (by_3) => {
    if (hold.current) {
      hold.current = null;
    } else {
      press(by_3);
    }
  };
  const mergedRef = useMergedRef(ref, nameRef, el);
  const t20 = cn("srp-input srp-number-input", "srp-input--size-" + size, invalid && "srp-input--invalid", rest.disabled && "srp-input--disabled", rest.readOnly && "srp-input--readonly", props.steppers !== false && "srp-number-input--steppers", props.className);
  const t21 = props;
  const t22 = "number-input";
  let t23;
  if ($[41] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t23 = (e_5) => pressFocuses(el)(e_5);
    $[41] = t23;
  } else {
    t23 = $[41];
  }
  let t24;
  if ($[42] !== left) {
    t24 = left != null && left !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-input__icon srp-input__icon--start", "aria-hidden": true }, left) : null;
    $[42] = left;
    $[43] = t24;
  } else {
    t24 = $[43];
  }
  const t25 = invalid || rest["aria-invalid"];
  const t26 = rest.lang ?? lang;
  const t27 = "text";
  const t28 = rest.inputMode || (places > 0 || min !== void 0 && min < 0 || min === void 0 ? "decimal" : "numeric");
  const t29 = "spinbutton";
  const t30 = now ?? void 0;
  const t31 = formatOptions && now != null ? show(now) : void 0;
  const t32 = rest.autoComplete || "off";
  const t33 = "srp-input__field";
  const t34 = cn(rest["aria-describedby"], affix.ids, rejected && niId + "-rejected") || void 0;
  let t35;
  if ($[44] !== max || $[45] !== mergedRef || $[46] !== min || $[47] !== onBlur || $[48] !== onChange || $[49] !== onKeyDown || $[50] !== rest || $[51] !== t25 || $[52] !== t26 || $[53] !== t28 || $[54] !== t30 || $[55] !== t31 || $[56] !== t32 || $[57] !== t34 || $[58] !== text) {
    t35 = /* @__PURE__ */ React.createElement("input", { ...rest, "aria-invalid": t25, ref: mergedRef, lang: t26, type: t27, inputMode: t28, role: t29, "aria-valuenow": t30, "aria-valuetext": t31, "aria-valuemin": min, "aria-valuemax": max, autoComplete: t32, className: t33, value: text, "aria-describedby": t34, onChange, onBlur, onKeyDown, onFocus: rest.onFocus });
    $[44] = max;
    $[45] = mergedRef;
    $[46] = min;
    $[47] = onBlur;
    $[48] = onChange;
    $[49] = onKeyDown;
    $[50] = rest;
    $[51] = t25;
    $[52] = t26;
    $[53] = t28;
    $[54] = t30;
    $[55] = t31;
    $[56] = t32;
    $[57] = t34;
    $[58] = text;
    $[59] = t35;
  } else {
    t35 = $[59];
  }
  let t36;
  if ($[60] !== name || $[61] !== out || $[62] !== rest.disabled || $[63] !== rest.form || $[64] !== value) {
    t36 = name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", ref: raw, name, form: rest.form, disabled: rest.disabled, value: value == null ? "" : String(out(value)) }) : null;
    $[60] = name;
    $[61] = out;
    $[62] = rest.disabled;
    $[63] = rest.form;
    $[64] = value;
    $[65] = t36;
  } else {
    t36 = $[65];
  }
  let t37;
  if ($[66] !== atEnd || $[67] !== clickStep || $[68] !== holdDown || $[69] !== longTouch || $[70] !== props.decrementLabel || $[71] !== props.incrementLabel || $[72] !== props.steppers || $[73] !== rest.id || $[74] !== sds || $[75] !== stop) {
    t37 = props.steppers !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-number-input__steppers" }, /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: -1, className: "srp-number-input__step", "aria-label": props.decrementLabel || sds.labels.decrease, "aria-controls": rest.id, disabled: atEnd(-1), onPointerDown: (e_6) => holdDown(e_6, -1), onPointerLeave: stop, onContextMenu: longTouch, onClick: () => clickStep(-1) }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Remove })), /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: -1, className: "srp-number-input__step", "aria-label": props.incrementLabel || sds.labels.increase, "aria-controls": rest.id, disabled: atEnd(1), onPointerDown: (e_7) => holdDown(e_7, 1), onPointerLeave: stop, onContextMenu: longTouch, onClick: () => clickStep(1) }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Add }))) : null;
    $[66] = atEnd;
    $[67] = clickStep;
    $[68] = holdDown;
    $[69] = longTouch;
    $[70] = props.decrementLabel;
    $[71] = props.incrementLabel;
    $[72] = props.steppers;
    $[73] = rest.id;
    $[74] = sds;
    $[75] = stop;
    $[76] = t37;
  } else {
    t37 = $[76];
  }
  let t38;
  if ($[77] !== affix.prefix || $[78] !== affix.suffix || $[79] !== size || $[80] !== t20 || $[81] !== t21.style || $[82] !== t23 || $[83] !== t24 || $[84] !== t35 || $[85] !== t36 || $[86] !== t37) {
    t38 = /* @__PURE__ */ React.createElement("span", { className: t20, style: t21.style, "data-component": t22, "data-size": size, onMouseDown: t23 }, t24, affix.prefix, t35, affix.suffix, t36, t37);
    $[77] = affix.prefix;
    $[78] = affix.suffix;
    $[79] = size;
    $[80] = t20;
    $[81] = t21.style;
    $[82] = t23;
    $[83] = t24;
    $[84] = t35;
    $[85] = t36;
    $[86] = t37;
    $[87] = t38;
  } else {
    t38 = $[87];
  }
  let t39;
  if ($[88] !== niId || $[89] !== rejected) {
    t39 = rejected && /* @__PURE__ */ React.createElement("span", { id: niId + "-rejected", className: "srp-input-rejected" }, rejected);
    $[88] = niId;
    $[89] = rejected;
    $[90] = t39;
  } else {
    t39 = $[90];
  }
  let t40;
  if ($[91] !== t38 || $[92] !== t39) {
    t40 = /* @__PURE__ */ React.createElement(React.Fragment, null, t38, t39);
    $[91] = t38;
    $[92] = t39;
    $[93] = t40;
  } else {
    t40 = $[93];
  }
  return t40;
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
