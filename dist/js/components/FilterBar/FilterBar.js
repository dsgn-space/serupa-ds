"use client";

// src/components/FilterBar/FilterBar.tsx
import { c as _c } from "../../internal/memoCache.js";
import { numberFormat, dateFormat, listFormat } from "../../internal/intl.js";
import * as React from "react";
import { isComposing } from "../../internal/ime.js";
import { TruncatedText } from "../TruncatedText/TruncatedText.js";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
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
import { useControllable } from "../../internal/controllable.js";
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
  if (f.type === "date-range") return {
    start: null,
    end: null
  };
  if (f.type === "boolean") return true;
  return "";
}
var toDate = (iso) => {
  const [y = NaN, m = NaN, d = NaN] = iso.split("-").map(Number);
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
      if (r && typeof r === "object" && !Array.isArray(r) && isDayOrNull(r.start) && isDayOrNull(r.end)) ok = {
        start: r.start ?? null,
        end: r.end ?? null
      };
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
function FilterBarRender(t0) {
  const $ = _c(57);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const L = sds.labels;
  const locale = useLocale();
  const rest = omit(props, {
    fields: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    resultsCount: 1,
    actions: 1,
    className: 1
  });
  const base = domId("srp-fb", React.useId());
  let t1;
  if ($[0] !== props.defaultValue) {
    t1 = props.defaultValue || {};
    $[0] = props.defaultValue;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const [raw, setOwn, controlled] = useControllable(props.value, t1, "FilterBar", "value");
  let t2;
  if ($[2] !== props.fields || $[3] !== raw) {
    t2 = clean(props.fields, raw);
    $[2] = props.fields;
    $[3] = raw;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const value = t2;
  const [editing, setEditing] = React.useState(null);
  const root = React.useRef(null);
  const focusNext = React.useRef(null);
  let t3;
  if ($[5] !== controlled || $[6] !== props || $[7] !== setOwn) {
    t3 = (next) => {
      if (!controlled) {
        setOwn(next);
      }
      if (props.onValueChange) {
        props.onValueChange(next);
      }
    };
    $[5] = controlled;
    $[6] = props;
    $[7] = setOwn;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  const set = t3;
  let t4;
  if ($[9] !== value) {
    t4 = (id) => {
      const next_0 = {
        ...value
      };
      delete next_0[id];
      return next_0;
    };
    $[9] = value;
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  const without = t4;
  let t5;
  if ($[11] !== value) {
    t5 = (f) => f.id in value;
    $[11] = value;
    $[12] = t5;
  } else {
    t5 = $[12];
  }
  const active = props.fields.filter(t5);
  let t6;
  if ($[13] !== value) {
    t6 = (f_0) => !(f_0.id in value);
    $[13] = value;
    $[14] = t6;
  } else {
    t6 = $[14];
  }
  const unused = props.fields.filter(t6);
  let t7;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => {
      const to = focusNext.current;
      if (!to || !root.current) {
        return;
      }
      focusNext.current = null;
      const el = root.current.querySelector(to === "add" ? "[data-filter-add]" : '[data-filter="' + CSS.escape(to) + '"]');
      if (el) {
        el.focus();
      }
    };
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  React.useEffect(t7);
  const add = (f_1) => {
    set({
      ...value,
      [f_1.id]: emptyFor(f_1)
    });
    if (f_1.type === "boolean") {
      focusNext.current = f_1.id;
    } else {
      setEditing(f_1.id);
    }
  };
  const remove = (f_2) => {
    const i = active.indexOf(f_2);
    const after = active[i + 1] || active[i - 1];
    focusNext.current = after ? after.id : "add";
    set(without(f_2.id));
  };
  const closeEditor = (f_3) => {
    setEditing(null);
    if (isEmpty(value[f_3.id])) {
      focusNext.current = "add";
      set(without(f_3.id));
    }
  };
  let t8;
  if ($[16] !== locale) {
    t8 = (vs) => {
      try {
        return listFormat(locale, {
          type: "disjunction"
        }).format(vs);
      } catch {
        return vs.join(", ");
      }
    };
    $[16] = locale;
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  const list = t8;
  let t9;
  if ($[18] !== L || $[19] !== list || $[20] !== locale || $[21] !== value) {
    t9 = (f_4) => {
      const v = value[f_4.id];
      if (isEmpty(v)) {
        return L.filterAny(f_4.label);
      }
      if (f_4.type === "boolean") {
        return f_4.label;
      }
      if (f_4.type === "text") {
        return L.filterContains(f_4.label, typeof v === "string" ? v.trim() : "");
      }
      if (f_4.type === "date-range") {
        const r = v;
        const fmt = dateFormat(locale, {
          dateStyle: "medium"
        });
        const plain = _temp;
        if (!r.end) {
          return L.filterFrom(f_4.label, plain(fmt.format(toDate(r.start))));
        }
        if (!r.start) {
          return L.filterUntil(f_4.label, plain(fmt.format(toDate(r.end))));
        }
        return L.filterIs(f_4.label, plain(fmt.formatRange(toDate(r.start), toDate(r.end))));
      }
      const chosen = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
      return L.filterIs(f_4.label, list(chosen.map((c) => {
        const o = f_4.options.find((x) => valueOf(x) === c);
        return o ? labelOf(o) : c;
      })));
    };
    $[18] = L;
    $[19] = list;
    $[20] = locale;
    $[21] = value;
    $[22] = t9;
  } else {
    t9 = $[22];
  }
  const said = t9;
  const editor = (f_5) => {
    const v_0 = value[f_5.id];
    const put = (x_0) => set({
      ...value,
      [f_5.id]: x_0
    });
    if (f_5.type === "select" && f_5.multiple) {
      return /* @__PURE__ */ React.createElement(CheckboxGroup, { "aria-label": f_5.label, value: Array.isArray(v_0) ? v_0 : [], onValueChange: (x_1) => put(x_1), className: "srp-filter-bar__options" }, f_5.options.map(_temp2));
    }
    if (f_5.type === "select") {
      return /* @__PURE__ */ React.createElement(RadioGroup, { "aria-label": f_5.label, value: typeof v_0 === "string" ? v_0 : "", onValueChange: (x_2) => put(x_2), className: "srp-filter-bar__options" }, f_5.options.map(_temp3));
    }
    if (f_5.type === "date-range") {
      const r_0 = v_0 && typeof v_0 === "object" && !Array.isArray(v_0) ? v_0 : {
        start: null,
        end: null
      };
      return /* @__PURE__ */ React.createElement(DateRangePicker, { "aria-label": f_5.label, value: r_0, onValueChange: (_, t10) => {
        const {
          iso
        } = t10;
        return put(iso);
      } });
    }
    if (f_5.type === "boolean") {
      return /* @__PURE__ */ React.createElement(Switch, { checked: v_0 === true, onCheckedChange: (on) => put(on) }, f_5.label);
    }
    return /* @__PURE__ */ React.createElement(Input, { "aria-label": f_5.label, placeholder: f_5.placeholder, value: typeof v_0 === "string" ? v_0 : "", onChange: (e) => put(e.target.value), onKeyDown: (e_0) => {
      if (e_0.key === "Enter" && !isComposing(e_0)) {
        e_0.preventDefault();
        focusNext.current = f_5.id;
        closeEditor(f_5);
      }
    } });
  };
  let t11;
  if ($[23] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = (n) => {
      root.current = n;
    };
    $[23] = t11;
  } else {
    t11 = $[23];
  }
  const mergedRef = useMergedRef(ref, t11);
  const t12 = "group";
  const t13 = props["aria-label"] || (props["aria-labelledby"] ? void 0 : L.filterBar);
  let t14;
  if ($[24] !== props.className) {
    t14 = cn("srp-filter-bar", props.className);
    $[24] = props.className;
    $[25] = t14;
  } else {
    t14 = $[25];
  }
  const t15 = "filter-bar";
  const t16 = "srp-filter-bar__chips";
  const t17 = "list";
  const t18 = active.map((f_6) => /* @__PURE__ */ React.createElement("li", { key: f_6.id, className: cn("srp-filter-bar__chip", isEmpty(value[f_6.id]) && "srp-filter-bar__chip--empty") }, /* @__PURE__ */ React.createElement(Popover, { title: f_6.label, placement: "bottom-start", sheet: "mobile", open: editing === f_6.id, onOpenChange: (open) => {
    if (open) {
      setEditing(f_6.id);
    } else {
      closeEditor(f_6);
    }
  }, trigger: /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-filter-bar__edit", "data-filter": f_6.id, dir: "auto" }, /* @__PURE__ */ React.createElement(TruncatedText, null, said(f_6))) }, (close) => /* @__PURE__ */ React.createElement("div", { className: "srp-filter-bar__editor" }, editor(f_6), /* @__PURE__ */ React.createElement(Button, { size: "sm", className: "srp-filter-bar__done", onClick: () => {
    close();
  } }, L.filterDone))), /* @__PURE__ */ React.createElement(IconButton, { className: "srp-filter-bar__remove", icon: icons.Close, size: "sm", variant: "ghost", label: L.filterRemove(f_6.label), onClick: () => remove(f_6) })));
  const t19 = "srp-filter-bar__add";
  const T0 = Menu;
  let t20;
  if ($[26] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t20 = /* @__PURE__ */ React.createElement(Icon, { icon: icons.Add });
    $[26] = t20;
  } else {
    t20 = $[26];
  }
  const t21 = !unused.length;
  let t22;
  if ($[27] !== L.filterAdd || $[28] !== t21) {
    t22 = /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", startIcon: t20, disabled: t21, "data-filter-add": "" }, L.filterAdd);
    $[27] = L.filterAdd;
    $[28] = t21;
    $[29] = t22;
  } else {
    t22 = $[29];
  }
  const t23 = unused.map((f_7) => /* @__PURE__ */ React.createElement(MenuItem, { key: f_7.id, onSelect: () => add(f_7) }, f_7.label));
  let t24;
  if ($[30] !== T0 || $[31] !== t22 || $[32] !== t23) {
    t24 = /* @__PURE__ */ React.createElement("li", { className: t19 }, /* @__PURE__ */ React.createElement(T0, { trigger: t22 }, t23));
    $[30] = T0;
    $[31] = t22;
    $[32] = t23;
    $[33] = t24;
  } else {
    t24 = $[33];
  }
  let t25;
  if ($[34] !== t18 || $[35] !== t24) {
    t25 = /* @__PURE__ */ React.createElement("ul", { className: t16, role: t17 }, t18, t24);
    $[34] = t18;
    $[35] = t24;
    $[36] = t25;
  } else {
    t25 = $[36];
  }
  let t26;
  if ($[37] !== L.filterClear || $[38] !== active.length || $[39] !== set) {
    t26 = active.length ? /* @__PURE__ */ React.createElement(Button, { variant: "link", size: "sm", className: "srp-filter-bar__clear", onClick: () => {
      focusNext.current = "add";
      setEditing(null);
      set({});
    } }, L.filterClear) : null;
    $[37] = L.filterClear;
    $[38] = active.length;
    $[39] = set;
    $[40] = t26;
  } else {
    t26 = $[40];
  }
  let t27;
  if ($[41] !== props.actions) {
    t27 = props.actions != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-filter-bar__actions" }, props.actions) : null;
    $[41] = props.actions;
    $[42] = t27;
  } else {
    t27 = $[42];
  }
  let t28;
  if ($[43] !== L || $[44] !== base || $[45] !== locale || $[46] !== props.resultsCount) {
    t28 = props.resultsCount != null && !Number.isNaN(props.resultsCount) ? /* @__PURE__ */ React.createElement("span", { className: "srp-filter-bar__count", role: "status", id: base + "-count" }, L.filterResults(props.resultsCount, numberFormat(locale).format(props.resultsCount))) : null;
    $[43] = L;
    $[44] = base;
    $[45] = locale;
    $[46] = props.resultsCount;
    $[47] = t28;
  } else {
    t28 = $[47];
  }
  let t29;
  if ($[48] !== mergedRef || $[49] !== rest || $[50] !== t13 || $[51] !== t14 || $[52] !== t25 || $[53] !== t26 || $[54] !== t27 || $[55] !== t28) {
    t29 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, role: t12, "aria-label": t13, className: t14, "data-component": t15 }, t25, t26, t27, t28);
    $[48] = mergedRef;
    $[49] = rest;
    $[50] = t13;
    $[51] = t14;
    $[52] = t25;
    $[53] = t26;
    $[54] = t27;
    $[55] = t28;
    $[56] = t29;
  } else {
    t29 = $[56];
  }
  return t29;
}
function _temp3(o_1) {
  return /* @__PURE__ */ React.createElement(Radio, { key: valueOf(o_1), value: valueOf(o_1) }, labelOf(o_1));
}
function _temp2(o_0) {
  return /* @__PURE__ */ React.createElement(Checkbox, { key: valueOf(o_0), value: valueOf(o_0) }, labelOf(o_0));
}
function _temp(t) {
  return t.replace(/[\u2009\u202f]/g, " ");
}
var FilterBar = /* @__PURE__ */ named("FilterBar", FilterBarRender);
export {
  FilterBar
};
//# sourceMappingURL=FilterBar.js.map
