"use client";

// src/components/Toolbar/Toolbar.tsx
import * as React from "react";
import { cn, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { ControlSize } from "../../internal/controlSize.js";
import { useSettings } from "../../internal/provider.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu, MenuCheckboxItem, MenuItem } from "../Menu/Menu.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var ITEMS = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="checkbox"], [role="radio"], [role="switch"], [contenteditable="true"]';
var POPUP = '[popover], [role="menu"], [role="listbox"], [role="dialog"], [role="tooltip"], [role="toolbar"], [hidden], [inert]';
var itemsOf = (root, all) => Array.from(root.querySelectorAll(ITEMS)).filter(function(it) {
  if (!all && it.matches(":disabled")) return false;
  const p = it.parentElement && it.parentElement.closest(POPUP);
  return !p || p === root || !root.contains(p);
});
var shown = (e) => e.getClientRects().length > 0;
var OUT = "data-dk-overflow";
var isSep = (k) => k.getAttribute("role") === "separator" || k.tagName === "HR";
var movable = (k) => {
  if (isSep(k)) return false;
  const all = itemsOf(k, true).concat(k.matches(ITEMS) ? [k] : []);
  return all.length > 0 && all.every((c) => (c instanceof HTMLButtonElement || c.getAttribute("role") === "button") && !c.hasAttribute("aria-haspopup"));
};
var typing = (e) => e.isContentEditable || e instanceof HTMLTextAreaElement || e instanceof HTMLSelectElement || e instanceof HTMLInputElement && !/^(button|checkbox|radio|submit|reset|image|color|file|range)$/.test(e.type);
var Toolbar = /* @__PURE__ */ component("Toolbar", function Toolbar2(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { orientation: 1, size: 1, className: 1, children: 1, overflow: 1, moreLabel: 1 });
  const size = props.size === "sm" || props.size === "md" || props.size === "lg" ? props.size : void 0;
  const vertical = props.orientation === "vertical";
  const root = React.useRef(null);
  const active = React.useRef(null);
  const sync = React.useCallback(function() {
    const r = root.current;
    if (!r) return;
    const items = itemsOf(r), seen = items.filter(shown);
    const pick = seen.length ? seen : items;
    if (!active.current || pick.indexOf(active.current) < 0) active.current = pick[0] || null;
    for (const it of itemsOf(r, true)) it.tabIndex = it === active.current ? 0 : -1;
  }, []);
  const more = React.useRef(null);
  const fold = !vertical && !!props.overflow;
  const layout = React.useCallback(function() {
    const r = root.current, m = more.current;
    if (!r || !m) return;
    const kids = Array.from(r.children).filter((k) => k !== m && k instanceof HTMLElement && !k.matches(POPUP));
    for (const k of kids) k.removeAttribute(OUT);
    m.removeAttribute(OUT);
    const cs = getComputedStyle(r), gap = parseFloat(cs.columnGap) || 0;
    const room = r.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const width = (k) => k.getBoundingClientRect().width;
    const used = (list) => list.reduce((a, k) => a + width(k), 0) + gap * Math.max(list.length - 1, 0);
    const shownKids = () => kids.filter((k) => !k.hasAttribute(OUT));
    if (used(kids) > room + 0.5) {
      const moreW = width(m) + gap;
      const order = kids.map((k, i) => ({ k, i, p: Number(k.getAttribute("data-priority")) || 0 })).filter((x) => movable(x.k)).sort((a, b) => a.p - b.p || b.i - a.i);
      for (const x of order) {
        if (used(shownKids()) + moreW <= room + 0.5) break;
        x.k.setAttribute(OUT, "");
      }
      let prev = null;
      for (const k of kids) {
        if (k.hasAttribute(OUT)) continue;
        if (isSep(k) && (!prev || isSep(prev))) {
          k.setAttribute(OUT, "");
          continue;
        }
        prev = k;
      }
      if (prev && isSep(prev)) prev.setAttribute(OUT, "");
    }
    if (!kids.some((k) => k.hasAttribute(OUT) && !isSep(k))) m.setAttribute(OUT, "");
    sync();
  }, [sync]);
  const [entries, setEntries] = React.useState([]);
  const collect = function() {
    const r = root.current;
    if (!r) return [];
    const out = [];
    for (const k of Array.from(r.children)) {
      if (!(k instanceof HTMLElement) || k === more.current || !k.hasAttribute(OUT) || k.matches(POPUP)) continue;
      for (const el of itemsOf(k, true).concat(k.matches(ITEMS) ? [k] : [])) {
        const state = el.getAttribute("aria-pressed") || el.getAttribute("aria-checked");
        const label = (el.getAttribute("aria-label") || el.textContent || "").trim();
        if (label) out.push({ el, label, disabled: el.matches(":disabled") || el.getAttribute("aria-disabled") === "true", checked: state == null ? null : state === "true" });
      }
    }
    return out;
  };
  useIsoLayoutEffect(function() {
    sync();
    if (fold) layout();
  });
  React.useEffect(function() {
    const r = root.current;
    if (!r) return;
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
    const watch = function() {
      if (ro) {
        ro.disconnect();
        for (const it of itemsOf(r, true)) ro.observe(it);
      }
    };
    watch();
    const mo = typeof MutationObserver === "undefined" ? null : new MutationObserver(function(records) {
      watch();
      if (fold && records.some((x) => x.type === "childList")) layout();
      else sync();
    });
    const rr = fold && typeof ResizeObserver !== "undefined" ? new ResizeObserver(function() {
      layout();
    }) : null;
    if (rr) rr.observe(r);
    if (mo) mo.observe(r, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"] });
    return function() {
      if (mo) mo.disconnect();
      if (ro) ro.disconnect();
      if (rr) rr.disconnect();
    };
  }, [sync, fold, layout]);
  const onFocus = function(e) {
    if (rest.onFocus) rest.onFocus(e);
    const r = root.current;
    if (r && e.target instanceof HTMLElement && e.target !== active.current && itemsOf(r).indexOf(e.target) >= 0) {
      active.current = e.target;
      sync();
    }
  };
  const onKeyDown = function(e) {
    if (rest.onKeyDown) rest.onKeyDown(e);
    const r = root.current, t = e.target;
    if (e.defaultPrevented || !r || !(t instanceof HTMLElement) || e.altKey || e.ctrlKey || e.metaKey) return;
    const items = itemsOf(r).filter(shown), i = items.indexOf(t);
    if (i < 0 || typing(t)) return;
    const rtl = getComputedStyle(r).direction === "rtl";
    let n;
    switch (e.key) {
      case "ArrowRight":
        if (vertical) return;
        n = i + (rtl ? -1 : 1);
        break;
      case "ArrowLeft":
        if (vertical) return;
        n = i + (rtl ? 1 : -1);
        break;
      case "ArrowDown":
        if (!vertical) return;
        n = i + 1;
        break;
      case "ArrowUp":
        if (!vertical) return;
        n = i - 1;
        break;
      case "Home":
        n = 0;
        break;
      case "End":
        n = items.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const next = items[(n + items.length) % items.length];
    if (!next) return;
    active.current = next;
    sync();
    next.focus();
  };
  const mergedRef = useMergedRef(ref, (n) => {
    root.current = n;
  });
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: mergedRef,
      role: "toolbar",
      "aria-orientation": vertical ? "vertical" : "horizontal",
      className: cn("dk-toolbar", vertical && "dk-toolbar--vertical", fold && "dk-toolbar--overflow", props.className),
      "data-component": "toolbar",
      "data-orientation": vertical ? "vertical" : "horizontal",
      onFocus,
      onKeyDown
    },
    size ? /* @__PURE__ */ React.createElement(ControlSize.Provider, { value: size }, props.children) : props.children,
    fold ? /* @__PURE__ */ React.createElement("span", { ref: more, className: "dk-toolbar__more", ...{ [OUT]: "" } }, /* @__PURE__ */ React.createElement(
      Menu,
      {
        placement: "bottom-end",
        onOpenChange: (open) => {
          if (open) setEntries(collect());
        },
        trigger: /* @__PURE__ */ React.createElement(IconButton, { icon: icons.MoreHoriz, label: props.moreLabel || L.toolbarMore, variant: "ghost", size })
      },
      entries.map((e, i) => e.checked != null ? /* @__PURE__ */ React.createElement(MenuCheckboxItem, { key: i, checked: e.checked, disabled: e.disabled, onCheckedChange: () => e.el.click() }, e.label) : /* @__PURE__ */ React.createElement(MenuItem, { key: i, disabled: e.disabled, onSelect: () => e.el.click() }, e.label))
    )) : null
  );
});
export {
  Toolbar
};
//# sourceMappingURL=Toolbar.js.map
