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
  const $ = _c(103);
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
  const t9 = "time-picker";
  const t10 = open ? "open" : "closed";
  let t11;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = (e_0) => pressFocuses(field)(e_0);
    $[11] = t11;
  } else {
    t11 = $[11];
  }
  const t12 = rest.lang ?? lang;
  const t13 = rest.dir ?? dir;
  const t14 = "text";
  const t15 = "combobox";
  const t16 = rest.autoComplete || "off";
  const t17 = rest.spellCheck ?? false;
  const t18 = rest.autoCorrect ?? "off";
  const t19 = rest.autoCapitalize ?? "off";
  const t20 = "srp-input__field";
  const t21 = placeholder != null ? placeholder : timePattern(locale, h12);
  const t22 = invalid || void 0;
  const t23 = cn(rest["aria-describedby"], id + "-format", rejected && id + "-rejected");
  const t24 = open ? `${id}-${active}` : void 0;
  let t25;
  if ($[12] !== locale || $[13] !== nearest || $[14] !== open || $[15] !== setActive || $[16] !== setRejected || $[17] !== setText) {
    t25 = (e_1) => {
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
    $[18] = t25;
  } else {
    t25 = $[18];
  }
  let t26;
  if ($[19] !== onBlur || $[20] !== read) {
    t26 = (e_2) => {
      if (!windowBlur(e_2)) {
        read();
      }
      if (onBlur) {
        onBlur(e_2);
      }
    };
    $[19] = onBlur;
    $[20] = read;
    $[21] = t26;
  } else {
    t26 = $[21];
  }
  let t27;
  if ($[22] !== disabled || $[23] !== id || $[24] !== keys || $[25] !== mergedRef || $[26] !== open || $[27] !== readOnly || $[28] !== rest || $[29] !== t12 || $[30] !== t13 || $[31] !== t16 || $[32] !== t17 || $[33] !== t18 || $[34] !== t19 || $[35] !== t21 || $[36] !== t22 || $[37] !== t23 || $[38] !== t24 || $[39] !== t25 || $[40] !== t26 || $[41] !== text) {
    t27 = /* @__PURE__ */ React.createElement("input", { ...rest, ref: mergedRef, lang: t12, dir: t13, type: t14, role: t15, autoComplete: t16, spellCheck: t17, autoCorrect: t18, autoCapitalize: t19, className: t20, value: text, disabled, readOnly, placeholder: t21, "aria-invalid": t22, "aria-describedby": t23, "aria-expanded": open, "aria-controls": id, "aria-autocomplete": "none", "aria-haspopup": "listbox", "aria-activedescendant": t24, onChange: t25, onBlur: t26, onKeyDown: keys });
    $[22] = disabled;
    $[23] = id;
    $[24] = keys;
    $[25] = mergedRef;
    $[26] = open;
    $[27] = readOnly;
    $[28] = rest;
    $[29] = t12;
    $[30] = t13;
    $[31] = t16;
    $[32] = t17;
    $[33] = t18;
    $[34] = t19;
    $[35] = t21;
    $[36] = t22;
    $[37] = t23;
    $[38] = t24;
    $[39] = t25;
    $[40] = t26;
    $[41] = text;
    $[42] = t27;
  } else {
    t27 = $[42];
  }
  const t28 = !!disabled || !!readOnly;
  let t29;
  if ($[43] !== open || $[44] !== setOpen || $[45] !== show) {
    t29 = () => {
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
    $[46] = t29;
  } else {
    t29 = $[46];
  }
  let t30;
  if ($[47] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t30 = /* @__PURE__ */ React.createElement(Icon, { icon: CLOCK });
    $[47] = t30;
  } else {
    t30 = $[47];
  }
  let t31;
  if ($[48] !== id || $[49] !== label || $[50] !== open || $[51] !== t28 || $[52] !== t29) {
    t31 = /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: -1, className: "srp-time-picker__button", "aria-label": label, "aria-controls": id, "aria-expanded": open, disabled: t28, onMouseDown: _temp, onClick: t29 }, t30);
    $[48] = id;
    $[49] = label;
    $[50] = open;
    $[51] = t28;
    $[52] = t29;
    $[53] = t31;
  } else {
    t31 = $[53];
  }
  const t32 = id + "-format";
  let t33;
  if ($[54] !== h12 || $[55] !== locale || $[56] !== sds.labels) {
    t33 = sds.labels.formatHint(timePattern(locale, h12));
    $[54] = h12;
    $[55] = locale;
    $[56] = sds.labels;
    $[57] = t33;
  } else {
    t33 = $[57];
  }
  let t34;
  if ($[58] !== t32 || $[59] !== t33) {
    t34 = /* @__PURE__ */ React.createElement("span", { id: t32, hidden: true }, t33);
    $[58] = t32;
    $[59] = t33;
    $[60] = t34;
  } else {
    t34 = $[60];
  }
  let t35;
  if ($[61] !== disabled || $[62] !== name || $[63] !== rest || $[64] !== value) {
    t35 = name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name, form: rest.form, value: value == null ? "" : toHHmm(value), disabled }) : null;
    $[61] = disabled;
    $[62] = name;
    $[63] = rest;
    $[64] = value;
    $[65] = t35;
  } else {
    t35 = $[65];
  }
  let t36;
  if ($[66] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t36 = {
      popover: "manual"
    };
    $[66] = t36;
  } else {
    t36 = $[66];
  }
  const t37 = !open || void 0;
  const t38 = !open || void 0;
  const t39 = exit.instant ? "" : void 0;
  let t40;
  if ($[67] !== active || $[68] !== dir || $[69] !== exit.leaving || $[70] !== fmt || $[71] !== id || $[72] !== lang || $[73] !== open || $[74] !== pick || $[75] !== setActive || $[76] !== times || $[77] !== value) {
    t40 = open || exit.leaving ? times.map((n_9, i_1) => /* @__PURE__ */ React.createElement("li", { key: n_9, id: `${id}-${i_1}`, lang, role: "option", "aria-selected": n_9 === value, "data-value": toHHmm(n_9), className: cn("srp-time-picker__option", i_1 === active && "srp-time-picker__option--active", n_9 === value && "srp-time-picker__option--selected"), onMouseDown: _temp2, onMouseMove: () => {
      if (i_1 !== active) {
        typed.current = false;
        setActive(i_1);
      }
    }, onClick: () => pick(n_9) }, /* @__PURE__ */ React.createElement("span", { className: "srp-time-picker__time" }, dir ? /* @__PURE__ */ React.createElement("span", { dir }, fmt(n_9)) : fmt(n_9)), n_9 === value ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "srp-time-picker__check" }) : null)) : null;
    $[67] = active;
    $[68] = dir;
    $[69] = exit.leaving;
    $[70] = fmt;
    $[71] = id;
    $[72] = lang;
    $[73] = open;
    $[74] = pick;
    $[75] = setActive;
    $[76] = times;
    $[77] = value;
    $[78] = t40;
  } else {
    t40 = $[78];
  }
  let t41;
  if ($[79] !== id || $[80] !== label || $[81] !== t37 || $[82] !== t38 || $[83] !== t39 || $[84] !== t40) {
    t41 = /* @__PURE__ */ React.createElement("ul", { ref: list, id, role: "listbox", "aria-label": label, ...t36, hidden: t37, inert: t38, "data-instant": t39, className: "srp-time-picker__list" }, t40);
    $[79] = id;
    $[80] = label;
    $[81] = t37;
    $[82] = t38;
    $[83] = t39;
    $[84] = t40;
    $[85] = t41;
  } else {
    t41 = $[85];
  }
  let t42;
  if ($[86] !== size || $[87] !== style || $[88] !== t10 || $[89] !== t11 || $[90] !== t27 || $[91] !== t31 || $[92] !== t34 || $[93] !== t35 || $[94] !== t41 || $[95] !== t8) {
    t42 = /* @__PURE__ */ React.createElement("span", { ref: box, className: t8, style, "data-component": t9, "data-state": t10, "data-size": size, onMouseDown: t11 }, t27, t31, t34, t35, t41);
    $[86] = size;
    $[87] = style;
    $[88] = t10;
    $[89] = t11;
    $[90] = t27;
    $[91] = t31;
    $[92] = t34;
    $[93] = t35;
    $[94] = t41;
    $[95] = t8;
    $[96] = t42;
  } else {
    t42 = $[96];
  }
  let t43;
  if ($[97] !== id || $[98] !== rejected) {
    t43 = rejected && /* @__PURE__ */ React.createElement("span", { id: id + "-rejected", className: "srp-input-rejected" }, rejected);
    $[97] = id;
    $[98] = rejected;
    $[99] = t43;
  } else {
    t43 = $[99];
  }
  let t44;
  if ($[100] !== t42 || $[101] !== t43) {
    t44 = /* @__PURE__ */ React.createElement(React.Fragment, null, t42, t43);
    $[100] = t42;
    $[101] = t43;
    $[102] = t44;
  } else {
    t44 = $[102];
  }
  return t44;
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
