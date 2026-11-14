"use client";

// src/components/TagGroup/TagGroup.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
import { useSettings } from "../../internal/provider.js";
import { Icon } from "../Icon/Icon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { en as comboWords } from "../Combobox/labels.js";
import { en as moreWords } from "../ShowMore/labels.js";
var allWords = /* @__PURE__ */ Object.assign({}, words, comboWords, moreWords);
var TagGroup = /* @__PURE__ */ component("TagGroup", function TagGroup2(props, ref) {
  const L = useSettings(allWords).labels;
  const rest = omit(props, { items: 1, label: 1, onRemove: 1, selectionMode: 1, selected: 1, defaultSelected: 1, onSelectedChange: 1, max: 1, empty: 1, className: 1, "aria-label": 1, "aria-labelledby": 1 });
  const id = React.useId(), labelId = `${id}-label`;
  const mode = props.selectionMode || "none";
  const [own, setOwn] = React.useState(props.defaultSelected || []);
  const picked = props.selected !== void 0 ? props.selected : own;
  const [all, setAll] = React.useState(false);
  const max = props.max != null && props.max >= 0 ? Math.floor(props.max) : Infinity;
  const shown = all ? props.items : props.items.slice(0, max);
  const hidden = props.items.length - shown.length;
  const [active, setActive] = React.useState(null);
  const current = shown.some((t) => t.id === active) ? active : shown[0] ? shown[0].id : null;
  const grid = React.useRef(null);
  const after = React.useRef(false);
  const rowOf = (tid) => grid.current && grid.current.querySelector(`[data-tag-id="${CSS.escape(tid)}"]`);
  React.useLayoutEffect(() => {
    if (after.current === false) return;
    const to = after.current;
    after.current = false;
    const row = to != null ? rowOf(to) : null;
    const none = !row && grid.current && grid.current.parentElement && grid.current.parentElement.querySelector(".dk-tag-group__empty");
    (row || none || grid.current)?.focus();
  });
  const select = (t) => {
    if (mode === "none" || t.disabled) return;
    const live = picked.filter((x) => props.items.some((o) => o.id === x)), on = live.includes(t.id);
    const next = mode === "single" ? on ? [] : [t.id] : on ? live.filter((x) => x !== t.id) : [...live, t.id];
    if (props.selected === void 0) setOwn(next);
    if (props.onSelectedChange) props.onSelectedChange(next);
  };
  const remove = (t) => {
    if (!props.onRemove || t.disabled) return;
    const i = props.items.findIndex((x) => x.id === t.id);
    const next = props.items[i + 1] || props.items[i - 1];
    after.current = next ? next.id : null;
    if (next) setActive(next.id);
    props.onRemove(t.id);
    announce(L.valueRemoved(t.label));
  };
  const onKeyDown = (e, t, i) => {
    const rtl = grid.current ? getComputedStyle(grid.current).direction === "rtl" : false;
    const step = (d) => {
      const n = shown[Math.min(Math.max(i + d, 0), shown.length - 1)];
      if (n) {
        setActive(n.id);
        const r = rowOf(n.id);
        if (r) r.focus();
      }
    };
    switch (e.key) {
      case "ArrowRight":
        step(rtl ? -1 : 1);
        break;
      case "ArrowLeft":
        step(rtl ? 1 : -1);
        break;
      case "ArrowDown":
        step(1);
        break;
      case "ArrowUp":
        step(-1);
        break;
      case "Home":
        step(-shown.length);
        break;
      case "End":
        step(shown.length);
        break;
      case "Delete":
      case "Backspace":
        remove(t);
        break;
      case " ":
      case "Enter":
        select(t);
        break;
      default:
        return;
    }
    e.preventDefault();
  };
  const named = props.label != null ? labelId : props["aria-labelledby"];
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cn("dk-tag-group", props.className), "data-component": "tag-group" }, props.label != null ? /* @__PURE__ */ React.createElement("div", { className: "dk-tag-group__label", id: labelId }, props.label) : null, props.items.length === 0 && props.empty != null ? /* @__PURE__ */ React.createElement("div", { className: "dk-tag-group__empty", tabIndex: -1 }, props.empty) : null, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: grid,
      role: "grid",
      className: "dk-tag-group__tags",
      tabIndex: shown.length ? void 0 : -1,
      "aria-labelledby": named,
      "aria-label": named ? void 0 : props["aria-label"],
      "aria-multiselectable": mode === "multiple" || void 0
    },
    shown.map((t, i) => {
      const on = picked.includes(t.id);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: t.id,
          role: "row",
          "data-tag-id": t.id,
          tabIndex: t.id === current ? 0 : -1,
          className: cn("dk-tag-group__tag", on && "dk-tag-group__tag--selected"),
          "aria-selected": mode !== "none" ? on : void 0,
          "aria-disabled": t.disabled || void 0,
          onFocus: () => setActive(t.id),
          onKeyDown: (e) => onKeyDown(e, t, i),
          onClick: () => select(t)
        },
        /* @__PURE__ */ React.createElement("span", { role: "gridcell", className: "dk-tag-group__text" }, mode !== "none" && on ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "dk-tag-group__check" }) : null, t.label),
        props.onRemove && !t.disabled ? /* @__PURE__ */ React.createElement("span", { role: "gridcell", className: "dk-tag-group__cell" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            tabIndex: -1,
            className: "dk-tag-group__remove",
            "aria-label": L.tagRemove(t.label),
            onClick: (e) => {
              e.stopPropagation();
              remove(t);
            }
          },
          /* @__PURE__ */ React.createElement(Icon, { icon: icons.Close })
        )) : null
      );
    })
  ), hidden > 0 || all && props.items.length > max ? /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "dk-tag-group__more",
      "aria-expanded": all,
      onClick: () => setAll(!all)
    },
    all ? L.showLess : L.showMore
  ) : null);
});
export {
  TagGroup
};
//# sourceMappingURL=TagGroup.js.map
