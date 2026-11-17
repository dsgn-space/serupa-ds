"use client";

// src/components/PeriodPicker/PeriodPicker.tsx
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, domId, isInvalid, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
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
var PER = { month: 12, quarter: 4, year: 1 };
var COLS = { month: 3, quarter: 2, year: 3 };
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
  return { start, end };
}
var pageOf = (n, unit) => unit === "year" ? Math.floor(n / 12) * 12 : Math.floor(n / PER[unit]) * PER[unit];
var pageSize = (unit) => unit === "year" ? 12 : PER[unit];
var never = () => () => {
};
var yes = () => true;
var no = () => false;
var PeriodPicker = /* @__PURE__ */ component("PeriodPicker", function PeriodPicker2(props, ref) {
  props = useFieldControl(props);
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { unit: 1, value: 1, defaultValue: 1, onValueChange: 1, min: 1, max: 1, locale: 1, placeholder: 1, size: 1, invalid: 1, required: 1, readOnly: 1, name: 1, open: 1, defaultOpen: 1, onOpenChange: 1, className: 1, style: 1, form: 1, disabled: 1 });
  const unit = props.unit === "quarter" || props.unit === "year" ? props.unit : "month";
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const base = domId("dk-pp", React.useId());
  const sized = useControlSize(props.size);
  const size = sized === "sm" || sized === "lg" ? sized : "md";
  const invalid = isInvalid(props.invalid, props["aria-invalid"]);
  const disabled = !!props.disabled, readOnly = !!props.readOnly;
  const [chosen, setOwn, controlled] = useControllable(props.value, periodIndex(props.defaultValue, unit), "PeriodPicker", "value");
  const value = controlled ? periodIndex(chosen, unit) : chosen;
  const min = periodIndex(props.min, unit), max = periodIndex(props.max, unit);
  const off = (n) => min != null && n < min || max != null && n > max;
  const clamp = (n) => min != null && n < min ? min : max != null && n > max ? max : n;
  const hydrated = React.useSyncExternalStore(never, yes, no);
  const now = /* @__PURE__ */ new Date(), current = now.getFullYear() * PER[unit] + Math.floor(now.getMonth() / (12 / PER[unit]));
  const [open, setOpenState] = useOpenState(props.open, props.defaultOpen, props.onOpenChange, "PeriodPicker", !!props.disabled || !!props.readOnly);
  const [held, setFocus] = React.useState(() => clamp(value ?? current));
  const focus = clamp(held);
  const page = pageOf(focus, unit), count = pageSize(unit), cols = COLS[unit];
  const button = React.useRef(null);
  const required = !!props.required;
  const { missing, onInvalid } = useRequired(value != null, () => button.current?.focus());
  const panel = React.useRef(null);
  const grid = React.useRef(null);
  const hidden = React.useRef(null);
  const prevNav = React.useRef(null), nextNav = React.useRef(null);
  const wantFocus = React.useRef(false);
  const handover = useFocusHandover();
  const fmt = React.useMemo(() => ({
    year: new Intl.DateTimeFormat(locale, { year: "numeric" }),
    short: new Intl.DateTimeFormat(locale, { month: "short" }),
    long: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })
  }), [locale]);
  const yearText = (y) => {
    const d = new Date(2e3, 6, 1);
    d.setFullYear(y);
    return fmt.year.format(d);
  };
  const name = (n) => {
    const { start } = rangeOf(n, unit), y = Math.floor(n / PER[unit]);
    return unit === "month" ? fmt.long.format(start) : unit === "quarter" ? L.periodQuarter(n - y * 4 + 1, yearText(y)) : yearText(y);
  };
  const cellText = (n) => {
    const y = Math.floor(n / PER[unit]);
    return unit === "month" ? fmt.short.format(rangeOf(n, unit).start) : unit === "quarter" ? L.periodQuarter(n - y * 4 + 1) : yearText(y);
  };
  const title = unit === "year" ? yearText(page) + "\u2013" + yearText(page + 11) : yearText(page / PER[unit]);
  const close = (toButton, reason) => {
    setOpenState(false, reason);
    if (toButton && button.current) button.current.focus();
  };
  const show = () => {
    if (disabled || readOnly) return;
    setFocus(clamp(value ?? current));
    wantFocus.current = true;
    setOpenState(true, "trigger");
  };
  const pick = (n) => {
    if (off(n)) return;
    if (!controlled) setOwn(n);
    if (n !== value && props.onValueChange) props.onValueChange(periodValue(n, unit), rangeOf(n, unit));
    close(true, "select");
  };
  const move = (n) => {
    setFocus(clamp(n));
    wantFocus.current = true;
  };
  const escape = (e) => {
    if (e.key === "Escape" && !isComposing(e)) {
      e.preventDefault();
      e.stopPropagation();
      close(true, "escape");
    }
  };
  const onKeyDown = (e) => {
    if (e.key === "Escape") return escape(e);
    if (e.altKey || e.ctrlKey || e.metaKey || isComposing(e)) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl", at = focus - page, rowStart = focus - at % cols;
    switch (e.key) {
      case "ArrowLeft":
        move(focus + (rtl ? 1 : -1));
        break;
      case "ArrowRight":
        move(focus + (rtl ? -1 : 1));
        break;
      case "ArrowUp":
        move(focus - cols);
        break;
      case "ArrowDown":
        move(focus + cols);
        break;
      case "Home":
        move(rowStart);
        break;
      case "End":
        move(Math.min(rowStart + cols - 1, page + count - 1));
        break;
      case "PageUp":
        move(focus - count);
        break;
      case "PageDown":
        move(focus + count);
        break;
      case "Enter":
      case " ":
        pick(focus);
        break;
      default:
        return;
    }
    e.preventDefault();
  };
  useFormReset(hidden, () => {
    if (!controlled) setOwn(periodIndex(props.defaultValue, unit));
    setOpenState(false, "api");
  }, props.form);
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, button, { placement: "bottom-start", offsetVar: "--dk-pp-offset", onOutside: () => close(false, "outside"), onFocusOutside: () => close(false, "blur"), inside: button });
  useIsoLayoutEffect(() => {
    if (!open || !wantFocus.current || !grid.current) return;
    wantFocus.current = false;
    const b = grid.current.querySelector('[tabindex="0"]');
    if (b) b.focus();
  });
  const placeholder = props.placeholder ?? L.periodPlaceholder(unit);
  const cells = [];
  for (let i = 0; i < count; i++) cells.push(page + i);
  const rows = [];
  for (let i = 0; i < cells.length; i += cols) rows.push(cells.slice(i, i + cols));
  const mergedRef = useMergedRef(ref, (n) => {
    button.current = n;
  });
  return /* @__PURE__ */ React.createElement("div", { className: cn("dk-period-picker", "dk-period-picker--size-" + size, (invalid || missing) && "dk-period-picker--invalid", disabled && "dk-period-picker--disabled", readOnly && "dk-period-picker--readonly", props.className), style: props.style, "data-component": "period-picker", "data-state": open ? "open" : "closed", "data-unit": unit }, /* @__PURE__ */ React.createElement(
    "button",
    {
      ...rest,
      ref: mergedRef,
      type: "button",
      role: "combobox",
      className: "dk-period-picker__button",
      lang: rest.lang ?? lang,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      "aria-controls": open ? base + "-panel" : void 0,
      "aria-invalid": invalid || missing || void 0,
      "aria-required": props["aria-required"] ?? (required || void 0),
      "aria-readonly": readOnly || void 0,
      disabled,
      onClick: (e) => {
        if (rest.onClick) rest.onClick(e);
        if (!e.defaultPrevented) {
          if (open) close(false, "trigger");
          else show();
        }
      },
      onKeyDown: (e) => {
        if (rest.onKeyDown) rest.onKeyDown(e);
        if (!e.defaultPrevented && !open && (e.key === "ArrowDown" || e.key === "ArrowUp") && !isComposing(e)) {
          e.preventDefault();
          show();
        }
      }
    },
    /* @__PURE__ */ React.createElement(TruncatedText, { className: cn("dk-period-picker__value", value == null && "dk-period-picker__value--empty") }, value == null ? placeholder : name(value)),
    /* @__PURE__ */ React.createElement(Icon, { icon: icons.CalendarToday, className: "dk-period-picker__icon" })
  ), /* @__PURE__ */ React.createElement("input", { ref: hidden, type: "hidden", name: props.name, form: props.form, value: value == null ? "" : periodValue(value, unit), disabled: disabled || !props.name }), required ? /* @__PURE__ */ React.createElement(
    "input",
    {
      key: value != null ? "filled" : "empty",
      className: "dk-period-picker__validity",
      tabIndex: -1,
      "aria-hidden": true,
      required: true,
      defaultValue: value != null ? "filled" : "",
      disabled: disabled || readOnly,
      form: props.form,
      onInvalid
    }
  ) : null, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: panel,
      id: base + "-panel",
      role: "dialog",
      "aria-label": L.periodPlaceholder(unit),
      lang,
      ...{ popover: "manual" },
      hidden: !open || void 0,
      inert: !open || void 0,
      "data-instant": exit.instant ? "" : void 0,
      className: "dk-period-picker__panel"
    },
    open || exit.leaving ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "dk-period-picker__header" }, /* @__PURE__ */ React.createElement(
      IconButton,
      {
        ref: prevNav,
        icon: icons.ChevronLeft,
        className: "dk-period-picker__nav",
        label: L.periodPrevious(unit),
        size: "sm",
        variant: "ghost",
        hideTitle: true,
        onKeyDown: escape,
        disabled: min != null && page - 1 < min,
        onClick: (e) => {
          handover(e.currentTarget, () => nextNav.current);
          setFocus(clamp(focus - count));
        }
      }
    ), /* @__PURE__ */ React.createElement("h2", { className: "dk-period-picker__title", id: base + "-title", "aria-live": "polite" }, title), /* @__PURE__ */ React.createElement(
      IconButton,
      {
        ref: nextNav,
        icon: icons.ChevronRight,
        className: "dk-period-picker__nav",
        label: L.periodNext(unit),
        size: "sm",
        variant: "ghost",
        hideTitle: true,
        onKeyDown: escape,
        disabled: max != null && page + count > max,
        onClick: (e) => {
          handover(e.currentTarget, () => prevNav.current);
          setFocus(clamp(focus + count));
        }
      }
    )), /* @__PURE__ */ React.createElement("table", { ref: grid, role: "grid", className: "dk-period-picker__grid", "aria-labelledby": base + "-title", onKeyDown }, /* @__PURE__ */ React.createElement("tbody", null, rows.map((row) => /* @__PURE__ */ React.createElement("tr", { key: row[0] }, row.map((n) => {
      const sel = n === value, no2 = off(n), here = hydrated && n === current;
      return /* @__PURE__ */ React.createElement("td", { key: n, role: "gridcell", "aria-selected": sel }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          tabIndex: n === focus ? 0 : -1,
          "aria-disabled": no2 || void 0,
          "aria-current": here ? "date" : void 0,
          className: cn("dk-period-picker__period", sel && "dk-period-picker__period--selected", here && "dk-period-picker__period--current", no2 && "dk-period-picker__period--disabled"),
          "data-value": periodValue(n, unit),
          onClick: () => pick(n),
          onFocus: () => {
            if (n !== focus) setFocus(n);
          }
        },
        /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, cellText(n)),
        /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, name(n))
      ));
    })))))) : null
  ));
});
export {
  PeriodPicker,
  periodIndex,
  periodValue
};
//# sourceMappingURL=PeriodPicker.js.map
