"use client";

// src/components/TimePicker/TimePicker.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { pressFocuses } from "../../internal/affix.js";
import { cn, domId, isInvalid, oneOf, useMergedRef, SIZES, useIsoLayoutEffect } from "../../internal/cn.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { formatTime, parseTime, timePattern, toHHmm, toMinutes, uses12h } from "../../internal/times.js";
import { reject } from "../../internal/rejectInput.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { Icon } from "../Icon/Icon.js";
import { InputAction } from "../Input/Input.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { useLocale, useOwnLang, useSettings } from "../../internal/provider.js";
import { localeDir } from "../../internal/locale.js";
import { useFormReset } from "../../internal/useFormReset.js";
import * as icons from "../../material/builtin.js";
import { isComposing } from "../../internal/ime.js";
import { en as TimePickerWords } from "./labels.js";
import { en as DatePickerWords } from "../DatePicker/labels.js";
import { windowBlur } from "../../internal/focus.js";
import { useControllable } from "../../internal/controllable.js";
import { useOpenState } from "../../internal/openChange.js";
var words = /* @__PURE__ */ Object.assign({}, TimePickerWords, DatePickerWords);
var CLOCK = {
  name: "schedule:outlined",
  d: "m520-496v-144q0-17-11.5-28.5t-28.5-11.5-28.5 11.5-11.5 28.5v159q0 8 3 15.5t9 13.5l132 132q11 11 28 11t28-11 11-28-11-28zm-40 416q-83 0-156-31.5t-127-85.5-85.5-127-31.5-156 31.5-156 85.5-127 127-85.5 156-31.5 156 31.5 127 85.5 85.5 127 31.5 156-31.5 156-85.5 127-127 85.5-156 31.5zm0-80q-133 0-226.5-93.5t-93.5-226.5 93.5-226.5 226.5-93.5 226.5 93.5 93.5 226.5-93.5 226.5-226.5 93.5zm0 0q133 0 226.5-93.5t93.5-226.5-93.5-226.5-226.5-93.5-226.5 93.5-93.5 226.5 93.5 226.5 226.5 93.5z"
};
function timesFrom(lo, hi, step) {
  const out = [];
  for (let n = lo; n <= hi; n += step) out.push(n);
  return out;
}
function TimePickerRender(t0) {
  const $ = _c(105);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const nameRef = useNameCheck("TimePicker", NAME_HOW.field);
  props = useFieldControl(props);
  const sds = useSettings(words);
  const {
    value: _v,
    defaultValue: _d,
    onValueChange,
    open: _o,
    defaultOpen: _do,
    onOpenChange,
    onInvalidInput,
    min,
    max,
    step: _st,
    locale: localeProp,
    hour12: _h,
    size: _s,
    invalid: _i,
    listLabel,
    className,
    style,
    name,
    placeholder,
    disabled,
    readOnly,
    onBlur,
    onKeyDown,
    ...rest
  } = props;
  const locale = useLocale(localeProp);
  const lang = useOwnLang(localeProp);
  const dir = localeProp ? localeDir(localeProp) : void 0;
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  const h12 = props.hour12 ?? uses12h(locale);
  const step = props.step && Math.round(props.step) >= 1 ? Math.round(props.step) : 30;
  const lo = toMinutes(min) ?? 0;
  const hi = toMinutes(max) ?? 1439;
  const [chosen, setOwn, controlled] = useControllable(props.value, toMinutes(props.defaultValue), "TimePicker", "value");
  const value = controlled ? toMinutes(chosen) : chosen;
  const fmt = (n) => n == null ? "" : formatTime(n, locale, h12);
  const [text, setText] = React.useState(fmt(value));
  const [shown, setShown] = React.useState({
    value,
    as: locale + "|" + h12
  });
  if (value !== shown.value || shown.as !== locale + "|" + h12) {
    setShown({
      value,
      as: locale + "|" + h12
    });
    if (fmt(value) !== text) {
      setText(fmt(value));
    }
  }
  const showAs = (n_0) => setShown((s) => s.value === n_0 && s.as === locale + "|" + h12 ? s : {
    value: n_0,
    as: locale + "|" + h12
  });
  const [open, setOpen] = useOpenState(props.open, props.defaultOpen, onOpenChange, "TimePicker", !!disabled || !!readOnly);
  const [held, setActive] = React.useState(0);
  const id = domId("srp-tp", React.useId());
  const [rejected, setRejected] = React.useState("");
  const box = React.useRef(null);
  const field = React.useRef(null);
  useFormReset(field, () => {
    if (controlled) {
      return;
    }
    const n_1 = toMinutes(props.defaultValue);
    showAs(n_1);
    setOwn(n_1);
    setText(fmt(n_1));
    setOpen(false, "api");
  });
  const list = React.useRef(null);
  const typed = React.useRef(false);
  const times = timesFrom(lo, hi, step);
  const active = Math.max(0, Math.min(held, times.length - 1));
  const nearest = (n_2) => {
    if (n_2 == null || !times.length) {
      return 0;
    }
    let best = 0;
    times.forEach((x, i) => {
      if (Math.abs(x - n_2) < Math.abs((times[best] ?? x) - n_2)) {
        best = i;
      }
    });
    return best;
  };
  const commit = (n_3) => {
    showAs(n_3);
    setText(fmt(n_3));
    if (n_3 === value) {
      return;
    }
    if (!controlled) {
      setOwn(n_3);
    }
    if (onValueChange) {
      onValueChange(n_3 == null ? null : toHHmm(n_3));
    }
  };
  const read = () => {
    if (text.trim() === "") {
      return commit(null);
    }
    const n_4 = parseTime(text, locale);
    if (n_4 != null && n_4 >= lo && n_4 <= hi) {
      return commit(n_4);
    }
    reject(text, n_4 != null ? "unavailable" : "unreadable", onInvalidInput, sds.labels.inputNotAccepted, setRejected);
    commit(value);
  };
  const [seenOpen, setSeenOpen] = React.useState(false);
  if (open !== seenOpen) {
    setSeenOpen(open);
    if (open) {
      setActive(nearest(value));
    }
  }
  const show = () => {
    if (disabled || readOnly || !times.length) {
      return;
    }
    const n_5 = parseTime(text, locale);
    setActive(nearest(n_5 != null ? n_5 : value));
    typed.current = false;
    setSeenOpen(true);
    setOpen(true, "trigger");
  };
  let t2;
  let t3;
  if ($[0] !== open) {
    t2 = () => {
      if (open && list.current && box.current) {
        list.current.style.minWidth = box.current.offsetWidth + "px";
      }
    };
    t3 = [open];
    $[0] = open;
    $[1] = t2;
    $[2] = t3;
  } else {
    t2 = $[1];
    t3 = $[2];
  }
  useIsoLayoutEffect(t2, t3);
  const exit = useExit(open, list);
  let t4;
  if ($[3] !== setOpen) {
    t4 = {
      placement: "bottom-start",
      offsetVar: "--srp-tp-offset",
      onOutside: () => setOpen(false, "outside"),
      inside: box
    };
    $[3] = setOpen;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  useAnchoredLayer(open, list, box, t4);
  const wasOpen = React.useRef(false);
  let t5;
  let t6;
  if ($[5] !== active || $[6] !== open) {
    t5 = () => {
      if (!open) {
        wasOpen.current = false;
        return;
      }
      const opening = !wasOpen.current;
      wasOpen.current = true;
      const l = list.current;
      const o = l ? l.children[active] : void 0;
      if (!l || !o) {
        return;
      }
      if (opening) {
        l.scrollTop = Math.max(0, o.offsetTop - o.offsetHeight);
      } else {
        if (o.offsetTop < l.scrollTop) {
          l.scrollTop = o.offsetTop;
        } else {
          if (o.offsetTop + o.offsetHeight > l.scrollTop + l.clientHeight) {
            l.scrollTop = o.offsetTop + o.offsetHeight - l.clientHeight;
          }
        }
      }
    };
    t6 = [open, active];
    $[5] = active;
    $[6] = open;
    $[7] = t5;
    $[8] = t6;
  } else {
    t5 = $[7];
    t6 = $[8];
  }
  React.useEffect(t5, t6);
  const pick = (n_6) => {
    commit(n_6);
    setOpen(false, "select");
    if (field.current) {
      field.current.focus();
    }
  };
  const keys = (e) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.defaultPrevented || isComposing(e)) {
      return;
    }
    if ((e.ctrlKey || e.metaKey) && /^(Arrow|Page)/.test(e.key)) {
      return;
    }
    const last = times.length - 1;
    const move = (i_0) => {
      e.preventDefault();
      typed.current = false;
      setActive(i_0);
    };
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        show();
      } else {
        if (e.key === "Enter") {
          read();
        }
      }
      return;
    }
    bb203: switch (e.key) {
      case "ArrowDown": {
        move(Math.min(last, active + 1));
        break bb203;
      }
      case "ArrowUp": {
        move(Math.max(0, active - 1));
        break bb203;
      }
      case "PageDown": {
        move(Math.min(last, active + 4));
        break bb203;
      }
      case "PageUp": {
        move(Math.max(0, active - 4));
        break bb203;
      }
      case "Home": {
        if (e.altKey || e.ctrlKey) {
          move(0);
        }
        break bb203;
      }
      case "End": {
        if (e.altKey || e.ctrlKey) {
          move(last);
        }
        break bb203;
      }
      case "Enter": {
        e.preventDefault();
        if (typed.current) {
          read();
          setOpen(false, "select");
        } else {
          const t = times[active];
          if (t !== void 0) {
            pick(t);
          }
        }
        break bb203;
      }
      case "Escape": {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false, "escape");
        break bb203;
      }
      case "Tab": {
        setOpen(false, "blur");
      }
    }
  };
  const label = listLabel || sds.labels.chooseTime;
  let t7;
  if ($[9] !== nameRef) {
    t7 = (n_7) => {
      field.current = n_7;
      nameRef(n_7);
    };
    $[9] = nameRef;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  const mergedRef = useMergedRef(ref, t7);
  const t8 = cn("srp-input", "srp-input--size-" + size, "srp-time-picker", invalid && "srp-input--invalid", disabled && "srp-input--disabled", readOnly && "srp-input--readonly", className);
  const t9 = invalid ? "" : void 0;
  const t10 = disabled ? "" : void 0;
  const t11 = readOnly ? "" : void 0;
  const t12 = "time-picker";
  const t13 = open ? "open" : "closed";
  let t14;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t14 = (e_0) => pressFocuses(field)(e_0);
    $[11] = t14;
  } else {
    t14 = $[11];
  }
  const t15 = rest.lang ?? lang;
  const t16 = rest.dir ?? dir;
  const t17 = "text";
  const t18 = "combobox";
  const t19 = rest.autoComplete || "off";
  const t20 = rest.spellCheck ?? false;
  const t21 = rest.autoCorrect ?? "off";
  const t22 = rest.autoCapitalize ?? "off";
  const t23 = "srp-input__field";
  const t24 = placeholder != null ? placeholder : timePattern(locale, h12);
  const t25 = invalid || void 0;
  const t26 = cn(rest["aria-describedby"], id + "-format", rejected && id + "-rejected");
  const t27 = open ? `${id}-${active}` : void 0;
  let t28;
  if ($[12] !== locale || $[13] !== nearest || $[14] !== open || $[15] !== setActive || $[16] !== setRejected || $[17] !== setText) {
    t28 = (e_1) => {
      setText(e_1.target.value);
      setRejected("");
      if (open) {
        typed.current = true;
        const n_8 = parseTime(e_1.target.value, locale);
        if (n_8 != null) {
          setActive(nearest(n_8));
        }
      }
    };
    $[12] = locale;
    $[13] = nearest;
    $[14] = open;
    $[15] = setActive;
    $[16] = setRejected;
    $[17] = setText;
    $[18] = t28;
  } else {
    t28 = $[18];
  }
  let t29;
  if ($[19] !== onBlur || $[20] !== read) {
    t29 = (e_2) => {
      if (!windowBlur(e_2)) {
        read();
      }
      if (onBlur) {
        onBlur(e_2);
      }
    };
    $[19] = onBlur;
    $[20] = read;
    $[21] = t29;
  } else {
    t29 = $[21];
  }
  let t30;
  if ($[22] !== disabled || $[23] !== id || $[24] !== keys || $[25] !== mergedRef || $[26] !== open || $[27] !== readOnly || $[28] !== rest || $[29] !== t15 || $[30] !== t16 || $[31] !== t19 || $[32] !== t20 || $[33] !== t21 || $[34] !== t22 || $[35] !== t24 || $[36] !== t25 || $[37] !== t26 || $[38] !== t27 || $[39] !== t28 || $[40] !== t29 || $[41] !== text) {
    t30 = /* @__PURE__ */ React.createElement("input", { ...rest, ref: mergedRef, lang: t15, dir: t16, type: t17, role: t18, autoComplete: t19, spellCheck: t20, autoCorrect: t21, autoCapitalize: t22, className: t23, value: text, disabled, readOnly, placeholder: t24, "aria-invalid": t25, "aria-describedby": t26, "aria-expanded": open, "aria-controls": id, "aria-autocomplete": "none", "aria-haspopup": "listbox", "aria-activedescendant": t27, onChange: t28, onBlur: t29, onKeyDown: keys });
    $[22] = disabled;
    $[23] = id;
    $[24] = keys;
    $[25] = mergedRef;
    $[26] = open;
    $[27] = readOnly;
    $[28] = rest;
    $[29] = t15;
    $[30] = t16;
    $[31] = t19;
    $[32] = t20;
    $[33] = t21;
    $[34] = t22;
    $[35] = t24;
    $[36] = t25;
    $[37] = t26;
    $[38] = t27;
    $[39] = t28;
    $[40] = t29;
    $[41] = text;
    $[42] = t30;
  } else {
    t30 = $[42];
  }
  const t31 = !!disabled || !!readOnly;
  let t32;
  if ($[43] !== open || $[44] !== setOpen || $[45] !== show) {
    t32 = () => {
      if (open) {
        setOpen(false, "trigger");
      } else {
        show();
      }
      if (field.current) {
        field.current.focus();
      }
    };
    $[43] = open;
    $[44] = setOpen;
    $[45] = show;
    $[46] = t32;
  } else {
    t32 = $[46];
  }
  let t33;
  if ($[47] !== id || $[48] !== label || $[49] !== open || $[50] !== t31 || $[51] !== t32) {
    t33 = /* @__PURE__ */ React.createElement("span", { className: "srp-input__actions" }, /* @__PURE__ */ React.createElement(InputAction, { tabIndex: -1, className: "srp-time-picker__button", icon: CLOCK, label, "aria-controls": id, "aria-expanded": open, disabled: t31, onMouseDown: _temp, onClick: t32 }));
    $[47] = id;
    $[48] = label;
    $[49] = open;
    $[50] = t31;
    $[51] = t32;
    $[52] = t33;
  } else {
    t33 = $[52];
  }
  const t34 = id + "-format";
  let t35;
  if ($[53] !== h12 || $[54] !== locale || $[55] !== sds.labels) {
    t35 = sds.labels.formatHint(timePattern(locale, h12));
    $[53] = h12;
    $[54] = locale;
    $[55] = sds.labels;
    $[56] = t35;
  } else {
    t35 = $[56];
  }
  let t36;
  if ($[57] !== t34 || $[58] !== t35) {
    t36 = /* @__PURE__ */ React.createElement("span", { id: t34, hidden: true }, t35);
    $[57] = t34;
    $[58] = t35;
    $[59] = t36;
  } else {
    t36 = $[59];
  }
  let t37;
  if ($[60] !== disabled || $[61] !== name || $[62] !== rest || $[63] !== value) {
    t37 = name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name, form: rest.form, value: value == null ? "" : toHHmm(value), disabled }) : null;
    $[60] = disabled;
    $[61] = name;
    $[62] = rest;
    $[63] = value;
    $[64] = t37;
  } else {
    t37 = $[64];
  }
  let t38;
  if ($[65] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t38 = {
      popover: "manual"
    };
    $[65] = t38;
  } else {
    t38 = $[65];
  }
  const t39 = !open || void 0;
  const t40 = !open || void 0;
  const t41 = exit.instant ? "" : void 0;
  let t42;
  if ($[66] !== active || $[67] !== dir || $[68] !== exit.leaving || $[69] !== fmt || $[70] !== id || $[71] !== lang || $[72] !== open || $[73] !== pick || $[74] !== setActive || $[75] !== times || $[76] !== value) {
    t42 = open || exit.leaving ? times.map((n_9, i_1) => /* @__PURE__ */ React.createElement("li", { key: n_9, id: `${id}-${i_1}`, lang, role: "option", "aria-selected": n_9 === value, "data-value": toHHmm(n_9), className: cn("srp-time-picker__option", i_1 === active && "srp-time-picker__option--active", n_9 === value && "srp-time-picker__option--selected"), "data-active": i_1 === active ? "" : void 0, onMouseDown: _temp2, onMouseMove: () => {
      if (i_1 !== active) {
        typed.current = false;
        setActive(i_1);
      }
    }, onClick: () => pick(n_9) }, /* @__PURE__ */ React.createElement("span", { className: "srp-time-picker__time" }, dir ? /* @__PURE__ */ React.createElement("span", { dir }, fmt(n_9)) : fmt(n_9)), n_9 === value ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "srp-time-picker__check" }) : null)) : null;
    $[66] = active;
    $[67] = dir;
    $[68] = exit.leaving;
    $[69] = fmt;
    $[70] = id;
    $[71] = lang;
    $[72] = open;
    $[73] = pick;
    $[74] = setActive;
    $[75] = times;
    $[76] = value;
    $[77] = t42;
  } else {
    t42 = $[77];
  }
  let t43;
  if ($[78] !== id || $[79] !== label || $[80] !== t39 || $[81] !== t40 || $[82] !== t41 || $[83] !== t42) {
    t43 = /* @__PURE__ */ React.createElement("ul", { ref: list, id, role: "listbox", "aria-label": label, ...t38, hidden: t39, inert: t40, "data-instant": t41, className: "srp-time-picker__list" }, t42);
    $[78] = id;
    $[79] = label;
    $[80] = t39;
    $[81] = t40;
    $[82] = t41;
    $[83] = t42;
    $[84] = t43;
  } else {
    t43 = $[84];
  }
  let t44;
  if ($[85] !== size || $[86] !== style || $[87] !== t10 || $[88] !== t11 || $[89] !== t13 || $[90] !== t14 || $[91] !== t30 || $[92] !== t33 || $[93] !== t36 || $[94] !== t37 || $[95] !== t43 || $[96] !== t8 || $[97] !== t9) {
    t44 = /* @__PURE__ */ React.createElement("span", { ref: box, className: t8, "data-invalid": t9, "data-disabled": t10, "data-readonly": t11, style, "data-component": t12, "data-state": t13, "data-size": size, onMouseDown: t14 }, t30, t33, t36, t37, t43);
    $[85] = size;
    $[86] = style;
    $[87] = t10;
    $[88] = t11;
    $[89] = t13;
    $[90] = t14;
    $[91] = t30;
    $[92] = t33;
    $[93] = t36;
    $[94] = t37;
    $[95] = t43;
    $[96] = t8;
    $[97] = t9;
    $[98] = t44;
  } else {
    t44 = $[98];
  }
  let t45;
  if ($[99] !== id || $[100] !== rejected) {
    t45 = rejected && /* @__PURE__ */ React.createElement("span", { id: id + "-rejected", className: "srp-input-rejected" }, rejected);
    $[99] = id;
    $[100] = rejected;
    $[101] = t45;
  } else {
    t45 = $[101];
  }
  let t46;
  if ($[102] !== t44 || $[103] !== t45) {
    t46 = /* @__PURE__ */ React.createElement(React.Fragment, null, t44, t45);
    $[102] = t44;
    $[103] = t45;
    $[104] = t46;
  } else {
    t46 = $[104];
  }
  return t46;
}
function _temp2(e_4) {
  return e_4.preventDefault();
}
function _temp(e_3) {
  return e_3.preventDefault();
}
var TimePicker = /* @__PURE__ */ named("TimePicker", TimePickerRender);
export {
  TimePicker
};
//# sourceMappingURL=TimePicker.js.map
