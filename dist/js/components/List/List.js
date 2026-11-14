"use client";

// src/components/List/List.tsx
import * as React from "react";
import { cn, oneOf, omit, useIsoLayoutEffect, useMergedRef } from "../../internal/cn.js";
import { config } from "../../internal/config.js";
import { asIcon } from "../Icon/asIcon.js";
import { component } from "../../internal/component.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/loaderSkeleton.js";
import { useSettings } from "../../internal/provider.js";
import { warnOnce } from "../../internal/warn.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { en as words } from "./labels.js";
var PickContext = /* @__PURE__ */ React.createContext(null);
var ROWS = ":scope > [data-list-value]";
var INSIDE = "a[href], button, input, select, textarea, [tabindex]";
var val = (r) => r.dataset.listValue;
var usable = (r) => r.getAttribute("aria-disabled") !== "true";
var List = /* @__PURE__ */ component("List", function List2(props, ref) {
  if (process.env.NODE_ENV !== "production" && props.busy != null) warnOnce("list-busy", "List: busy is deprecated and removed in 15.0.0. Use loading, which does the same.");
  const rest = omit(props, { variant: 1, divided: 1, as: 1, loading: 1, busy: 1, className: 1, selectionMode: 1, selected: 1, defaultSelected: 1, onSelectedChange: 1 });
  const variant = oneOf(["plain", "card"], props.variant, "plain");
  const mode = props.selectionMode === "single" || props.selectionMode === "multiple" ? props.selectionMode : null;
  const [own, setOwn] = React.useState(props.defaultSelected || []);
  const picked = props.selected !== void 0 ? props.selected : own;
  const ul = React.useRef(null);
  const merged = useMergedRef(ref, (n) => {
    ul.current = n;
  });
  const focused = React.useRef(null);
  const anchor = React.useRef(null);
  const rows = () => ul.current ? Array.from(ul.current.querySelectorAll(ROWS)) : [];
  const rove = () => {
    const all = rows(), cur = all.find((r) => val(r) === focused.current) || all[0];
    for (const r of all) {
      r.tabIndex = r === cur ? 0 : -1;
      r.querySelectorAll(INSIDE).forEach((c) => {
        c.tabIndex = -1;
      });
    }
  };
  useIsoLayoutEffect(() => {
    if (mode) rove();
  });
  const emit = (next) => {
    if (props.selected === void 0) setOwn(next);
    if (props.onSelectedChange) props.onSelectedChange(next);
  };
  const pick = (row, run) => {
    if (!usable(row)) return;
    const v = val(row);
    if (mode === "single") {
      emit(picked.includes(v) ? [] : [v]);
      return;
    }
    const all = rows(), from = run && anchor.current != null ? all.findIndex((r) => val(r) === anchor.current) : -1;
    if (from >= 0) {
      const to = all.indexOf(row), span = all.slice(Math.min(from, to), Math.max(from, to) + 1).filter(usable).map(val);
      emit(picked.concat(span.filter((x) => !picked.includes(x))));
      return;
    }
    anchor.current = v;
    emit(picked.includes(v) ? picked.filter((x) => x !== v) : [...picked, v]);
  };
  const onKeyDown = (e) => {
    const t = e.target, row = t.closest("[data-list-value]");
    if (!row || row.parentElement !== ul.current) return;
    const all = rows(), i = all.indexOf(row), onRow = t === row;
    const inside = Array.from(row.querySelectorAll(INSIDE)).filter((c) => !c.disabled);
    const rtl = getComputedStyle(row).direction === "rtl";
    const go = (j) => {
      const r = all[Math.max(0, Math.min(j, all.length - 1))];
      if (!r) return;
      if (e.shiftKey && mode === "multiple") {
        if (anchor.current == null) anchor.current = val(row);
        pick(r, true);
      }
      r.focus();
    };
    const across = (d) => {
      const j = onRow ? d > 0 ? 0 : -1 : inside.indexOf(t) + d;
      (j >= 0 && inside[j] ? inside[j] : row).focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home" && onRow) go(0);
    else if (e.key === "End" && onRow) go(all.length - 1);
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") across(e.key === "ArrowRight" !== rtl ? 1 : -1);
    else if (onRow && e.key === " ") pick(row, e.shiftKey);
    else if (onRow && e.key === "Enter") {
      const main = row.querySelector("a.dk-list__main, button.dk-list__main");
      if (main) main.click();
      else pick(row, false);
    } else if (onRow && mode === "multiple" && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") emit(all.filter(usable).map(val));
    else return;
    e.preventDefault();
  };
  const onClick = (e) => {
    const t = e.target, row = t.closest("[data-list-value]");
    if (!row || row.parentElement !== ul.current) return;
    const control = t.closest('a, button, input, select, textarea, label, [role="button"], [role="menuitem"]');
    if (control && !(control.matches("input") && control.closest(".dk-list__select"))) return;
    pick(row, e.shiftKey);
  };
  const onFocus = (e) => {
    const row = e.target.closest("[data-list-value]");
    if (row && row.parentElement === ul.current) {
      focused.current = val(row);
      rove();
    }
  };
  const theirs = { key: rest.onKeyDown, click: rest.onClick, focus: rest.onFocus };
  const ctx = React.useMemo(() => mode ? { mode, has: (v) => picked.includes(v) } : null, [mode, picked]);
  const el = React.createElement(oneOf(["ul", "ol"], props.as, "ul"), Object.assign(rest, {
    ref: merged,
    "data-component": "list",
    role: rest.role ?? (mode ? "grid" : "list"),
    "aria-busy": rest["aria-busy"] ?? ((props.loading ?? props.busy) || void 0),
    "aria-multiselectable": mode === "multiple" || void 0,
    onKeyDown: mode ? (e) => {
      if (theirs.key) theirs.key(e);
      if (!e.defaultPrevented) onKeyDown(e);
    } : theirs.key,
    onClick: mode ? (e) => {
      if (theirs.click) theirs.click(e);
      onClick(e);
    } : theirs.click,
    onFocus: mode ? (e) => {
      if (theirs.focus) theirs.focus(e);
      onFocus(e);
    } : theirs.focus,
    className: cn("dk-list", variant === "card" && "dk-list--card", props.divided !== false && "dk-list--divided", mode && "dk-list--selectable", props.className)
  }));
  return /* @__PURE__ */ React.createElement(PickContext.Provider, { value: ctx }, el);
});
var ListItemBase = /* @__PURE__ */ component("ListItem", function ListItem(props, ref) {
  const rest = omit(props, { title: 1, description: 1, leading: 1, trailing: 1, href: 1, onClick: 1, as: 1, linkProps: 1, selected: 1, disabled: 1, className: 1, value: 1 });
  const pick = React.useContext(PickContext);
  const titleId = React.useId();
  if (process.env.NODE_ENV !== "production" && pick && props.value == null) warnOnce("list-value", "ListItem: in a List with selectionMode, give each ListItem a value, which onSelectedChange reports.");
  const value = props.value != null ? props.value : titleId;
  const on = pick ? pick.has(value) : false;
  const lead = asIcon(props.leading);
  const body = /* @__PURE__ */ React.createElement(React.Fragment, null, lead != null && lead !== false ? /* @__PURE__ */ React.createElement("span", { className: cn("dk-list__leading", typeof props.leading === "string" && "dk-list__leading--icon") }, lead) : null, /* @__PURE__ */ React.createElement("span", { className: "dk-list__text" }, /* @__PURE__ */ React.createElement("span", { className: "dk-list__title", id: pick ? titleId : void 0 }, props.title), props.description != null ? /* @__PURE__ */ React.createElement("span", { className: "dk-list__description" }, props.description) : null));
  const lp = Object.assign({}, props.linkProps);
  let main;
  if (props.href != null || props.as) {
    const attrs = Object.assign(lp, { className: cn("dk-list__main", lp.className), "aria-current": lp["aria-current"] !== void 0 ? lp["aria-current"] : props.selected ? "true" : void 0 });
    const keep = (k) => /^(aria-|data-)/.test(k) || k === "id" || k === "title" || k === "style" || k === "className" || k === "lang" || k === "dir";
    if (props.disabled) {
      for (const k of Object.keys(attrs)) if (!keep(k)) delete attrs[k];
      Object.assign(attrs, { "aria-disabled": true, tabIndex: -1, onClick: (e) => e.preventDefault() });
    } else {
      attrs.href = props.href;
      if (props.onClick) attrs.onClick = props.onClick;
    }
    main = React.createElement(props.disabled ? "a" : props.as || config.link, attrs, body);
  } else if (props.onClick) {
    main = /* @__PURE__ */ React.createElement("button", { type: "button", ...lp, className: cn("dk-list__main", lp.className), onClick: props.onClick, disabled: props.disabled, "aria-pressed": props.selected === void 0 ? void 0 : !!props.selected }, body);
  } else {
    main = /* @__PURE__ */ React.createElement("div", { className: "dk-list__main dk-list__main--static", role: pick ? "gridcell" : void 0 }, body);
  }
  const interactive = props.href != null || !!props.as || !!props.onClick;
  const row = pick ? { role: "row", "data-list-value": value, "aria-selected": on, "aria-disabled": props.disabled || void 0, "aria-labelledby": titleId } : null;
  return /* @__PURE__ */ React.createElement("li", { ...rest, ...row, ref, className: cn("dk-list__item", interactive && "dk-list__item--interactive", pick && !interactive && "dk-list__item--pickable", (props.selected || on) && "dk-list__item--selected", props.disabled && "dk-list__item--disabled", props.className) }, pick && pick.mode === "multiple" ? /* @__PURE__ */ React.createElement("span", { role: "gridcell", className: "dk-list__select" }, /* @__PURE__ */ React.createElement(Checkbox, { tabIndex: -1, "aria-labelledby": titleId, checked: on, disabled: props.disabled, onChange: noop })) : null, pick && interactive ? /* @__PURE__ */ React.createElement("span", { role: "gridcell", className: "dk-list__cell" }, main) : main, props.trailing != null ? /* @__PURE__ */ React.createElement("span", { className: "dk-list__trailing", role: pick ? "gridcell" : void 0 }, props.trailing) : null);
});
var ListItem2 = ListItemBase;
var noop = () => {
};
var ListSelectAll = /* @__PURE__ */ component("ListSelectAll", function ListSelectAll2(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { values: 1, selected: 1, onSelectedChange: 1, children: 1 });
  const some = props.values.filter((v) => props.selected.includes(v)).length;
  const all = props.values.length > 0 && some === props.values.length;
  const change = (checked) => props.onSelectedChange(checked ? props.selected.concat(props.values.filter((v) => !props.selected.includes(v))) : props.selected.filter((v) => !props.values.includes(v)));
  return /* @__PURE__ */ React.createElement(Checkbox, { ...rest, ref, checked: all, indeterminate: some > 0 && !all, disabled: props.disabled || props.values.length === 0, onCheckedChange: change }, props.children != null ? props.children : L.listSelectAll);
});
var LEADS = ["icon", "xs", "sm", "md", "lg", "xl"];
function ListLoadingItems(props) {
  const rows = Math.min(50, Math.max(1, Math.floor(Number(props.rows)) || 3));
  const lead = props.leading == null ? null : oneOf(LEADS, props.leading, "md");
  const sds = useSettings();
  const label = props.label == null ? sds.labels.loading : props.label;
  const waiting = !useSkeletonShown(label);
  const out = [];
  for (let r = 0; r < rows; r++) out.push(
    /* @__PURE__ */ React.createElement("li", { key: r, className: "dk-list__item dk-list__loading" }, /* @__PURE__ */ React.createElement("div", { className: "dk-list__main dk-list__main--static" }, lead ? /* @__PURE__ */ React.createElement("span", { className: "dk-list__leading dk-list__leading--" + lead }, /* @__PURE__ */ React.createElement(SkeletonArt, { shape: "circle", waiting })) : null, /* @__PURE__ */ React.createElement("span", { className: "dk-list__text" }, /* @__PURE__ */ React.createElement(SkeletonArt, { lines: props.description ? 2 : 1, waiting }))))
  );
  return /* @__PURE__ */ React.createElement(React.Fragment, null, out);
}
export {
  List,
  ListItem2 as ListItem,
  ListLoadingItems,
  ListSelectAll
};
//# sourceMappingURL=List.js.map
