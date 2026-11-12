"use client";

// src/components/FilterBar/FilterBar.tsx
import * as React from "react";
import { isComposing } from "../../internal/ime.js";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Icon } from "../Icon/Icon.js";
import { Popover } from "../Popover/Popover.js";
import { Menu, MenuItem } from "../Menu/Menu.js";
import { Checkbox, CheckboxGroup } from "../Checkbox/Checkbox.js";
import { Radio, RadioGroup } from "../Radio/Radio.js";
import { Switch } from "../Switch/Switch.js";
import { Input } from "../Input/Input.js";
import { DateRangePicker } from "../DateRangePicker/DateRangePicker.js";
import * as icons from "../../material/builtin.js";
import { warnOnce } from "../../internal/warn.js";
import { en as words } from "./labels.js";
var labelOf = (o) => typeof o === "string" ? o : o.label;
var valueOf = (o) => typeof o === "string" ? o : o.value;
function isEmpty(v) {
  if (v == null || v === false || typeof v === "string" && !v.trim()) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return !v.start && !v.end;
  return false;
}
function emptyFor(f) {
  if (f.type === "select") return f.multiple ? [] : "";
  if (f.type === "date-range") return { start: null, end: null };
  if (f.type === "boolean") return true;
  return "";
}
var toDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
var isDay = (x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x) && toDate(x).getDate() === Number(x.slice(8));
var isDayOrNull = (x) => x == null || isDay(x);
function clean(fields, raw) {
  const out = {};
  for (const id of Object.keys(raw)) {
    const f = fields.find((x) => x.id === id), v = raw[id];
    let ok;
    if (f?.type === "select") {
      if (Array.isArray(v) && v.every((x) => typeof x === "string")) ok = f.multiple ? v : v[0] ?? "";
      else if (typeof v === "string") ok = f.multiple ? v ? [v] : [] : v;
    } else if (f?.type === "date-range") {
      const r = v;
      if (r && typeof r === "object" && !Array.isArray(r) && isDayOrNull(r.start) && isDayOrNull(r.end)) ok = { start: r.start ?? null, end: r.end ?? null };
    } else if (f?.type === "boolean") {
      if (v === true) ok = true;
    } else if (f?.type === "text") {
      if (typeof v === "string") ok = v;
    }
    if (ok === void 0) {
      if (process.env.NODE_ENV !== "production") warnOnce("filter-value", 'FilterBar: the value for "' + id + '" ' + (f ? "isn't one its " + f.type + " field can take" : "names no field") + ", so that filter is left out.", "filter-value:" + id);
      continue;
    }
    out[id] = ok;
  }
  return out;
}
var FilterBar = /* @__PURE__ */ component("FilterBar", function FilterBar2(props, ref) {
  const sds = useSettings(words), L = sds.labels, locale = useLocale();
  const rest = omit(props, { fields: 1, value: 1, defaultValue: 1, onValueChange: 1, resultsCount: 1, actions: 1, className: 1 });
  const base = domId("dk-fb", React.useId());
  const controlled = props.value !== void 0;
  const [own, setOwn] = React.useState(props.defaultValue || {});
  const raw = controlled ? props.value : own;
  const value = React.useMemo(() => clean(props.fields, raw), [props.fields, raw]);
  const [editing, setEditing] = React.useState(null);
  const root = React.useRef(null);
  const focusNext = React.useRef(null);
  const set = (next) => {
    if (!controlled) setOwn(next);
    if (props.onValueChange) props.onValueChange(next);
  };
  const without = (id) => {
    const next = { ...value };
    delete next[id];
    return next;
  };
  const active = props.fields.filter((f) => f.id in value);
  const unused = props.fields.filter((f) => !(f.id in value));
  React.useEffect(() => {
    const to = focusNext.current;
    if (!to || !root.current) return;
    focusNext.current = null;
    const el = root.current.querySelector(to === "add" ? "[data-filter-add]" : '[data-filter="' + CSS.escape(to) + '"]');
    if (el) el.focus();
  });
  const add = (f) => {
    set({ ...value, [f.id]: emptyFor(f) });
    if (f.type === "boolean") focusNext.current = f.id;
    else setEditing(f.id);
  };
  const remove = (f) => {
    const i = active.indexOf(f), after = active[i + 1] || active[i - 1];
    focusNext.current = after ? after.id : "add";
    set(without(f.id));
  };
  const closeEditor = (f) => {
    setEditing(null);
    if (isEmpty(value[f.id])) {
      focusNext.current = "add";
      set(without(f.id));
    }
  };
  const list = (vs) => {
    try {
      return new Intl.ListFormat(locale, { type: "disjunction" }).format(vs);
    } catch {
      return vs.join(", ");
    }
  };
  const said = (f) => {
    const v = value[f.id];
    if (isEmpty(v)) return L.filterAny(f.label);
    if (f.type === "boolean") return f.label;
    if (f.type === "text") return L.filterContains(f.label, typeof v === "string" ? v.trim() : "");
    if (f.type === "date-range") {
      const r = v;
      const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
      const plain = (t) => t.replace(/[\u2009\u202f]/g, " ");
      if (!r.end) return L.filterFrom(f.label, plain(fmt.format(toDate(r.start))));
      if (!r.start) return L.filterUntil(f.label, plain(fmt.format(toDate(r.end))));
      return L.filterIs(f.label, plain(fmt.formatRange(toDate(r.start), toDate(r.end))));
    }
    const chosen = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
    return L.filterIs(f.label, list(chosen.map((c) => {
      const o = f.options.find((x) => valueOf(x) === c);
      return o ? labelOf(o) : c;
    })));
  };
  const editor = (f) => {
    const v = value[f.id], put = (x) => set({ ...value, [f.id]: x });
    if (f.type === "select" && f.multiple) {
      return /* @__PURE__ */ React.createElement(CheckboxGroup, { "aria-label": f.label, value: Array.isArray(v) ? v : [], onValueChange: (x) => put(x), className: "dk-filter-bar__options" }, f.options.map((o) => /* @__PURE__ */ React.createElement(Checkbox, { key: valueOf(o), value: valueOf(o) }, labelOf(o))));
    }
    if (f.type === "select") {
      return /* @__PURE__ */ React.createElement(RadioGroup, { "aria-label": f.label, value: typeof v === "string" ? v : "", onValueChange: (x) => put(x), className: "dk-filter-bar__options" }, f.options.map((o) => /* @__PURE__ */ React.createElement(Radio, { key: valueOf(o), value: valueOf(o) }, labelOf(o))));
    }
    if (f.type === "date-range") {
      const r = v && typeof v === "object" && !Array.isArray(v) ? v : { start: null, end: null };
      return /* @__PURE__ */ React.createElement(DateRangePicker, { "aria-label": f.label, value: r, onValueChange: (_, iso) => put(iso) });
    }
    if (f.type === "boolean") return /* @__PURE__ */ React.createElement(Switch, { checked: v === true, onCheckedChange: (on) => put(on) }, f.label);
    return /* @__PURE__ */ React.createElement(
      Input,
      {
        "aria-label": f.label,
        placeholder: f.placeholder,
        value: typeof v === "string" ? v : "",
        onChange: (e) => put(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && !isComposing(e)) {
            e.preventDefault();
            focusNext.current = f.id;
            closeEditor(f);
          }
        }
      }
    );
  };
  const mergedRef = useMergedRef(ref, (n) => {
    root.current = n;
  });
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: mergedRef,
      role: "group",
      "aria-label": props["aria-label"] || (props["aria-labelledby"] ? void 0 : L.filterBar),
      className: cn("dk-filter-bar", props.className),
      "data-component": "filter-bar"
    },
    /* @__PURE__ */ React.createElement("ul", { className: "dk-filter-bar__chips", role: "list" }, active.map((f) => /* @__PURE__ */ React.createElement("li", { key: f.id, className: cn("dk-filter-bar__chip", isEmpty(value[f.id]) && "dk-filter-bar__chip--empty") }, /* @__PURE__ */ React.createElement(
      Popover,
      {
        title: f.label,
        placement: "bottom-start",
        sheet: "mobile",
        open: editing === f.id,
        onOpenChange: (open) => {
          if (open) setEditing(f.id);
          else closeEditor(f);
        },
        trigger: /* @__PURE__ */ React.createElement("button", { type: "button", className: "dk-filter-bar__edit", "data-filter": f.id, dir: "auto", title: said(f) }, said(f))
      },
      (close) => /* @__PURE__ */ React.createElement("div", { className: "dk-filter-bar__editor" }, editor(f), /* @__PURE__ */ React.createElement(Button, { size: "sm", className: "dk-filter-bar__done", onClick: () => {
        close();
      } }, L.filterDone))
    ), /* @__PURE__ */ React.createElement(IconButton, { className: "dk-filter-bar__remove", icon: icons.Close, size: "sm", variant: "ghost", label: L.filterRemove(f.label), onClick: () => remove(f) }))), /* @__PURE__ */ React.createElement("li", { className: "dk-filter-bar__add" }, /* @__PURE__ */ React.createElement(Menu, { trigger: /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", leftIcon: /* @__PURE__ */ React.createElement(Icon, { icon: icons.Add }), disabled: !unused.length, "data-filter-add": "" }, L.filterAdd) }, unused.map((f) => /* @__PURE__ */ React.createElement(MenuItem, { key: f.id, onSelect: () => add(f) }, f.label))))),
    active.length ? /* @__PURE__ */ React.createElement(Button, { variant: "link", size: "sm", className: "dk-filter-bar__clear", onClick: () => {
      focusNext.current = "add";
      setEditing(null);
      set({});
    } }, L.filterClear) : null,
    props.actions != null ? /* @__PURE__ */ React.createElement("div", { className: "dk-filter-bar__actions" }, props.actions) : null,
    props.resultsCount != null ? /* @__PURE__ */ React.createElement("span", { className: "dk-filter-bar__count", role: "status", id: base + "-count" }, L.filterResults(props.resultsCount, new Intl.NumberFormat(locale).format(props.resultsCount))) : null
  );
});
export {
  FilterBar
};
//# sourceMappingURL=FilterBar.js.map
