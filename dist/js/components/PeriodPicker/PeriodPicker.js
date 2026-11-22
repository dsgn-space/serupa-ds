"use client";

// src/components/PeriodPicker/PeriodPicker.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, domId, isInvalid, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useOwnLang, useSettings } from "../../internal/provider.js";
import { useFieldControl } from "../../internal/field.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { useFocusHandover } from "../../internal/focus.js";
import { isComposing } from "../../internal/ime.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Icon } from "../Icon/Icon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { TruncatedText } from "../TruncatedText/TruncatedText.js";
import { useControllable } from "../../internal/controllable.js";
import { useRequired } from "../../internal/required.js";
import { useOpenState } from "../../internal/openChange.js";
var PER = {
  month: 12,
  quarter: 4,
  year: 1
};
var COLS = {
  month: 3,
  quarter: 2,
  year: 3
};
function periodIndex(s, unit) {
  const m = typeof s === "string" ? /^(\d{4})(?:-(Q?)(\d{1,2}))?$/.exec(s.trim()) : null;
  if (!m) return null;
  const y = Number(m[1]), i = m[3] ? +m[3] - 1 : -1;
  if (unit === "year") return m[3] ? null : y;
  if (unit === "quarter") return m[2] && i >= 0 && i < 4 ? y * 4 + i : null;
  return !m[2] && i >= 0 && i < 12 ? y * 12 + i : null;
}
function periodValue(n, unit) {
  const per = PER[unit], y = Math.floor(n / per), i = n - y * per;
  return String(y).padStart(4, "0") + (unit === "month" ? "-" + String(i + 1).padStart(2, "0") : unit === "quarter" ? "-Q" + (i + 1) : "");
}
function rangeOf(n, unit) {
  const months = 12 / PER[unit], y = Math.floor(n / PER[unit]), m = (n - y * PER[unit]) * months;
  const start = new Date(2e3, 0, 1), end = new Date(2e3, 0, 1);
  start.setFullYear(y, m, 1);
  end.setFullYear(y, m + months, 0);
  return {
    start,
    end
  };
}
var pageOf = (n, unit) => unit === "year" ? Math.floor(n / 12) * 12 : Math.floor(n / PER[unit]) * PER[unit];
var pageSize = (unit) => unit === "year" ? 12 : PER[unit];
var never = () => () => {
};
var yes = () => true;
var no = () => false;
function PeriodPickerRender(t0) {
  const $ = _c(40);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  props = useFieldControl(props);
  const sds = useSettings(words);
  const L = sds.labels;
  const rest = omit(props, {
    unit: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    min: 1,
    max: 1,
    locale: 1,
    placeholder: 1,
    size: 1,
    invalid: 1,
    required: 1,
    readOnly: 1,
    name: 1,
    open: 1,
    defaultOpen: 1,
    onOpenChange: 1,
    className: 1,
    style: 1,
    form: 1,
    disabled: 1
  });
  const unit = props.unit === "quarter" || props.unit === "year" ? props.unit : "month";
  const locale = useLocale(props.locale);
  const lang = useOwnLang(props.locale);
  const base = domId("srp-pp", React.useId());
  const sized = useControlSize(props.size);
  const size = sized === "sm" || sized === "lg" ? sized : "md";
  const invalid = isInvalid(props.invalid, props["aria-invalid"]);
  const disabled = !!props.disabled;
  const readOnly = !!props.readOnly;
  const [chosen, setOwn, controlled] = useControllable(props.value, periodIndex(props.defaultValue, unit), "PeriodPicker", "value");
  const value = controlled ? periodIndex(chosen, unit) : chosen;
  const min = periodIndex(props.min, unit);
  const max = periodIndex(props.max, unit);
  let t2;
  if ($[0] !== max || $[1] !== min) {
    t2 = (n) => min != null && n < min || max != null && n > max;
    $[0] = max;
    $[1] = min;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const off = t2;
  const clamp = (n_0) => min != null && n_0 < min ? min : max != null && n_0 > max ? max : n_0;
  const hydrated = React.useSyncExternalStore(never, yes, no);
  const now = /* @__PURE__ */ new Date();
  const current = now.getFullYear() * PER[unit] + Math.floor(now.getMonth() / (12 / PER[unit]));
  const [open, setOpenState] = useOpenState(props.open, props.defaultOpen, props.onOpenChange, "PeriodPicker", !!props.disabled || !!props.readOnly);
  const [held, setFocus] = React.useState(() => clamp(value ?? current));
  const focus = clamp(held);
  const page = pageOf(focus, unit);
  const count = pageSize(unit);
  const cols = COLS[unit];
  const button = React.useRef(null);
  const required = !!props.required;
  let t3;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => button.current?.focus();
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const {
    missing,
    onInvalid
  } = useRequired(value != null, t3);
  const panel = React.useRef(null);
  const grid = React.useRef(null);
  const hidden = React.useRef(null);
  const prevNav = React.useRef(null);
  const nextNav = React.useRef(null);
  const wantFocus = React.useRef(false);
  const handover = useFocusHandover();
  let t4;
  if ($[4] !== locale) {
    t4 = new Intl.DateTimeFormat(locale, {
      year: "numeric"
    });
    $[4] = locale;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  let t5;
  if ($[6] !== locale) {
    t5 = new Intl.DateTimeFormat(locale, {
      month: "short"
    });
    $[6] = locale;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== locale) {
    t6 = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric"
    });
    $[8] = locale;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== t4 || $[11] !== t5 || $[12] !== t6) {
    t7 = {
      year: t4,
      short: t5,
      long: t6
    };
    $[10] = t4;
    $[11] = t5;
    $[12] = t6;
    $[13] = t7;
  } else {
    t7 = $[13];
  }
  const fmt = t7;
  let t8;
  if ($[14] !== fmt.year) {
    t8 = (y) => {
      const d = new Date(2e3, 6, 1);
      d.setFullYear(y);
      return fmt.year.format(d);
    };
    $[14] = fmt.year;
    $[15] = t8;
  } else {
    t8 = $[15];
  }
  const yearText = t8;
  const name = (n_1) => {
    const {
      start
    } = rangeOf(n_1, unit);
    const y_0 = Math.floor(n_1 / PER[unit]);
    return unit === "month" ? fmt.long.format(start) : unit === "quarter" ? L.periodQuarter(n_1 - y_0 * 4 + 1, yearText(y_0)) : yearText(y_0);
  };
  const cellText = (n_2) => {
    const y_1 = Math.floor(n_2 / PER[unit]);
    return unit === "month" ? fmt.short.format(rangeOf(n_2, unit).start) : unit === "quarter" ? L.periodQuarter(n_2 - y_1 * 4 + 1) : yearText(y_1);
  };
  const title = unit === "year" ? yearText(page) + "\u2013" + yearText(page + 11) : yearText(page / PER[unit]);
  const close = (toButton, reason) => {
    setOpenState(false, reason);
    if (toButton && button.current) {
      button.current.focus();
    }
  };
  const show = () => {
    if (disabled || readOnly) {
      return;
    }
    setFocus(clamp(value ?? current));
    wantFocus.current = true;
    setOpenState(true, "trigger");
  };
  const pick = (n_3) => {
    if (off(n_3)) {
      return;
    }
    if (!controlled) {
      setOwn(n_3);
    }
    if (n_3 !== value && props.onValueChange) {
      props.onValueChange(periodValue(n_3, unit), {
        range: rangeOf(n_3, unit)
      });
    }
    close(true, "select");
  };
  const move = (n_4) => {
    setFocus(clamp(n_4));
    wantFocus.current = true;
  };
  const escape = (e) => {
    if (e.key === "Escape" && !isComposing(e)) {
      e.preventDefault();
      e.stopPropagation();
      close(true, "escape");
    }
  };
  const onKeyDown = (e_0) => {
    if (e_0.key === "Escape") {
      return escape(e_0);
    }
    if (e_0.altKey || e_0.ctrlKey || e_0.metaKey || isComposing(e_0)) {
      return;
    }
    const rtl = getComputedStyle(e_0.currentTarget).direction === "rtl";
    const at = focus - page;
    const rowStart = focus - at % cols;
    bb158: switch (e_0.key) {
      case "ArrowLeft": {
        move(focus + (rtl ? 1 : -1));
        break bb158;
      }
      case "ArrowRight": {
        move(focus + (rtl ? -1 : 1));
        break bb158;
      }
      case "ArrowUp": {
        move(focus - cols);
        break bb158;
      }
      case "ArrowDown": {
        move(focus + cols);
        break bb158;
      }
      case "Home": {
        move(rowStart);
        break bb158;
      }
      case "End": {
        move(Math.min(rowStart + cols - 1, page + count - 1));
        break bb158;
      }
      case "PageUp": {
        move(focus - count);
        break bb158;
      }
      case "PageDown": {
        move(focus + count);
        break bb158;
      }
      case "Enter":
      case " ": {
        pick(focus);
        break bb158;
      }
      default: {
        return;
      }
    }
    e_0.preventDefault();
  };
  useFormReset(hidden, () => {
    if (!controlled) {
      setOwn(periodIndex(props.defaultValue, unit));
    }
    setOpenState(false, "api");
  }, props.form);
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, button, {
    placement: "bottom-start",
    offsetVar: "--srp-pp-offset",
    onOutside: () => close(false, "outside"),
    onFocusOutside: () => close(false, "blur"),
    inside: button
  });
  let t9;
  if ($[16] !== open) {
    t9 = () => {
      if (!open || !wantFocus.current || !grid.current) {
        return;
      }
      wantFocus.current = false;
      const b = grid.current.querySelector('[tabindex="0"]');
      if (b) {
        b.focus();
      }
    };
    $[16] = open;
    $[17] = t9;
  } else {
    t9 = $[17];
  }
  useIsoLayoutEffect(t9);
  const placeholder = props.placeholder ?? L.periodPlaceholder(unit);
  const cells = [];
  for (let i = 0; i < count; i++) {
    cells.push(page + i);
  }
  const rows = [];
  for (let i_0 = 0; i_0 < cells.length; i_0 = i_0 + cols, i_0) {
    rows.push(cells.slice(i_0, i_0 + cols));
  }
  let t10;
  if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = (n_5) => {
      button.current = n_5;
    };
    $[18] = t10;
  } else {
    t10 = $[18];
  }
  const mergedRef = useMergedRef(ref, t10);
  const t11 = cn("srp-period-picker", "srp-period-picker--size-" + size, (invalid || missing) && "srp-period-picker--invalid", disabled && "srp-period-picker--disabled", readOnly && "srp-period-picker--readonly", props.className);
  const t12 = props.style;
  const t13 = value == null && "srp-period-picker__value--empty";
  let t14;
  if ($[19] !== t13) {
    t14 = cn("srp-period-picker__value", t13);
    $[19] = t13;
    $[20] = t14;
  } else {
    t14 = $[20];
  }
  const t15 = value == null ? placeholder : name(value);
  let t16;
  if ($[21] !== t14 || $[22] !== t15) {
    t16 = /* @__PURE__ */ React.createElement(TruncatedText, { className: t14 }, t15);
    $[21] = t14;
    $[22] = t15;
    $[23] = t16;
  } else {
    t16 = $[23];
  }
  let t17;
  if ($[24] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t17 = /* @__PURE__ */ React.createElement(Icon, { icon: icons.CalendarToday, className: "srp-period-picker__icon" });
    $[24] = t17;
  } else {
    t17 = $[24];
  }
  const t18 = props;
  const t19 = props;
  const t20 = value == null ? "" : periodValue(value, unit);
  const t21 = disabled || !props.name;
  let t22;
  if ($[25] !== t18.name || $[26] !== t19.form || $[27] !== t20 || $[28] !== t21) {
    t22 = /* @__PURE__ */ React.createElement("input", { ref: hidden, type: "hidden", name: t18.name, form: t19.form, value: t20, disabled: t21 });
    $[25] = t18.name;
    $[26] = t19.form;
    $[27] = t20;
    $[28] = t21;
    $[29] = t22;
  } else {
    t22 = $[29];
  }
  const t23 = base + "-panel";
  const t24 = "dialog";
  const t25 = L.periodPlaceholder(unit);
  let t26;
  if ($[30] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t26 = {
      popover: "manual"
    };
    $[30] = t26;
  } else {
    t26 = $[30];
  }
  const t27 = !open || void 0;
  const t28 = !open || void 0;
  const t29 = exit.instant ? "" : void 0;
  const t30 = "srp-period-picker__panel";
  const t31 = open || exit.leaving ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "srp-period-picker__header" }, /* @__PURE__ */ React.createElement(IconButton, { ref: prevNav, icon: icons.ChevronLeft, className: "srp-period-picker__nav", label: L.periodPrevious(unit), size: "sm", variant: "ghost", hideTitle: true, onKeyDown: escape, disabled: min != null && page - 1 < min, onClick: (e_3) => {
    handover(e_3.currentTarget, () => nextNav.current);
    setFocus(clamp(focus - count));
  } }), /* @__PURE__ */ React.createElement("h2", { className: "srp-period-picker__title", id: base + "-title", "aria-live": "polite" }, title), /* @__PURE__ */ React.createElement(IconButton, { ref: nextNav, icon: icons.ChevronRight, className: "srp-period-picker__nav", label: L.periodNext(unit), size: "sm", variant: "ghost", hideTitle: true, onKeyDown: escape, disabled: max != null && page + count > max, onClick: (e_4) => {
    handover(e_4.currentTarget, () => prevNav.current);
    setFocus(clamp(focus + count));
  } })), /* @__PURE__ */ React.createElement("table", { ref: grid, role: "grid", className: "srp-period-picker__grid", "aria-labelledby": base + "-title", onKeyDown }, /* @__PURE__ */ React.createElement("tbody", null, rows.map((row) => /* @__PURE__ */ React.createElement("tr", { key: row[0] }, row.map((n_6) => {
    const sel = n_6 === value;
    const no$0 = off(n_6);
    const here = hydrated && n_6 === current;
    return /* @__PURE__ */ React.createElement("td", { key: n_6, role: "gridcell", "aria-selected": sel }, /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: n_6 === focus ? 0 : -1, "aria-disabled": no$0 || void 0, "aria-current": here ? "date" : void 0, className: cn("srp-period-picker__period", sel && "srp-period-picker__period--selected", here && "srp-period-picker__period--current", no$0 && "srp-period-picker__period--disabled"), "data-value": periodValue(n_6, unit), onClick: () => pick(n_6), onFocus: () => {
      if (n_6 !== focus) {
        setFocus(n_6);
      }
    } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, cellText(n_6)), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, name(n_6))));
  })))))) : null;
  let t32;
  if ($[31] !== lang || $[32] !== t23 || $[33] !== t25 || $[34] !== t26 || $[35] !== t27 || $[36] !== t28 || $[37] !== t29 || $[38] !== t31) {
    t32 = /* @__PURE__ */ React.createElement("div", { ref: panel, id: t23, role: t24, "aria-label": t25, lang, ...t26, hidden: t27, inert: t28, "data-instant": t29, className: t30 }, t31);
    $[31] = lang;
    $[32] = t23;
    $[33] = t25;
    $[34] = t26;
    $[35] = t27;
    $[36] = t28;
    $[37] = t29;
    $[38] = t31;
    $[39] = t32;
  } else {
    t32 = $[39];
  }
  return /* @__PURE__ */ React.createElement("div", { className: t11, style: t12, "data-component": "period-picker", "data-state": open ? "open" : "closed", "data-unit": unit }, /* @__PURE__ */ React.createElement("button", { ...rest, ref: mergedRef, type: "button", role: "combobox", className: "srp-period-picker__button", lang: rest.lang ?? lang, "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? base + "-panel" : void 0, "aria-invalid": invalid || missing || void 0, "aria-required": props["aria-required"] ?? (required || void 0), "aria-readonly": readOnly || void 0, disabled, onClick: (e_1) => {
    if (rest.onClick) {
      rest.onClick(e_1);
    }
    if (!e_1.defaultPrevented) {
      if (open) {
        close(false, "trigger");
      } else {
        show();
      }
    }
  }, onKeyDown: (e_2) => {
    if (rest.onKeyDown) {
      rest.onKeyDown(e_2);
    }
    if (!e_2.defaultPrevented && !open && (e_2.key === "ArrowDown" || e_2.key === "ArrowUp") && !isComposing(e_2)) {
      e_2.preventDefault();
      show();
    }
  } }, t16, t17), t22, required ? /* @__PURE__ */ React.createElement("input", { key: value != null ? "filled" : "empty", className: "srp-period-picker__validity", tabIndex: -1, "aria-hidden": true, required: true, defaultValue: value != null ? "filled" : "", disabled: disabled || readOnly, form: props.form, onInvalid }) : null, t32);
}
var PeriodPicker = /* @__PURE__ */ named("PeriodPicker", PeriodPickerRender);
export {
  PeriodPicker,
  periodIndex,
  periodValue
};
//# sourceMappingURL=PeriodPicker.js.map
