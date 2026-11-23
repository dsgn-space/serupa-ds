"use client";

// src/components/TagGroup/TagGroup.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
import { useSettings } from "../../internal/provider.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { en as comboWords } from "../Combobox/labels.js";
import { en as moreWords } from "../ShowMore/labels.js";
import { isRtl } from "../../internal/position.js";
import { modified } from "../../internal/roving.js";
var allWords = /* @__PURE__ */ Object.assign({}, words, comboWords, moreWords);
function TagGroupRender(t0) {
  const $ = _c(23);
  const {
    ref,
    ...props
  } = t0;
  const L = useSettings(allWords).labels;
  const rest = omit(props, {
    items: 1,
    label: 1,
    onRemove: 1,
    selectionMode: 1,
    selected: 1,
    defaultSelected: 1,
    onSelectedChange: 1,
    max: 1,
    emptyText: 1,
    className: 1,
    "aria-label": 1,
    "aria-labelledby": 1
  });
  const emptyText = props.emptyText;
  const id = React.useId();
  const labelId = `${id}-label`;
  const mode = props.selectionMode || "none";
  const [picked, setOwn] = useControllable(props.selected, props.defaultSelected || [], "TagGroup", "selected");
  const [all, setAll] = React.useState(false);
  const max = props.max != null && props.max >= 0 ? Math.floor(props.max) : Infinity;
  const shown = all ? props.items : props.items.slice(0, max);
  const hidden = props.items.length - shown.length;
  const [active, setActive] = React.useState(null);
  const current = shown.some((t) => t.id === active) ? active : shown[0] ? shown[0].id : null;
  const grid = React.useRef(null);
  const after = React.useRef(false);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = (tid) => grid.current && grid.current.querySelector(`[data-tag-id="${CSS.escape(tid)}"]`);
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const rowOf = t1;
  let t2;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => {
      if (after.current === false) {
        return;
      }
      const to = after.current;
      after.current = false;
      const row = to != null ? rowOf(to) : null;
      const none = !row && grid.current && grid.current.parentElement && grid.current.parentElement.querySelector(".srp-tag-group__empty");
      (row || none || grid.current)?.focus();
    };
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  React.useLayoutEffect(t2);
  const select = (t_0) => {
    if (mode === "none" || t_0.disabled) {
      return;
    }
    const live = picked.filter((x) => props.items.some((o) => o.id === x));
    const on = live.includes(t_0.id);
    const next = mode === "single" ? on ? [] : [t_0.id] : on ? live.filter((x_0) => x_0 !== t_0.id) : [...live, t_0.id];
    if (props.selected === void 0) {
      setOwn(next);
    }
    if (props.onSelectedChange) {
      props.onSelectedChange(next);
    }
  };
  const remove = (t_1) => {
    if (!props.onRemove || t_1.disabled) {
      return;
    }
    const i = props.items.findIndex((x_1) => x_1.id === t_1.id);
    const next_0 = props.items[i + 1] || props.items[i - 1];
    after.current = next_0 ? next_0.id : null;
    if (next_0) {
      setActive(next_0.id);
    }
    props.onRemove(t_1.id);
    announce(L.valueRemoved(t_1.label));
  };
  const onKeyDown = (e, t_2, i_0) => {
    if (modified(e)) {
      return;
    }
    const rtl = grid.current ? isRtl(grid.current) : false;
    const step = (d) => {
      const n = shown[Math.min(Math.max(i_0 + d, 0), shown.length - 1)];
      if (n) {
        setActive(n.id);
        const r = rowOf(n.id);
        if (r) {
          r.focus();
        }
      }
    };
    bb135: switch (e.key) {
      case "ArrowRight": {
        step(rtl ? -1 : 1);
        break bb135;
      }
      case "ArrowLeft": {
        step(rtl ? 1 : -1);
        break bb135;
      }
      case "ArrowDown": {
        step(1);
        break bb135;
      }
      case "ArrowUp": {
        step(-1);
        break bb135;
      }
      case "Home": {
        step(-shown.length);
        break bb135;
      }
      case "End": {
        step(shown.length);
        break bb135;
      }
      case "Delete":
      case "Backspace": {
        remove(t_2);
        break bb135;
      }
      case " ":
      case "Enter": {
        select(t_2);
        break bb135;
      }
      default: {
        return;
      }
    }
    e.preventDefault();
  };
  const named2 = props.label != null ? labelId : props["aria-labelledby"];
  const t3 = cn("srp-tag-group", props.className);
  const t4 = "tag-group";
  const t5 = props.label != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-tag-group__label", id: labelId }, props.label) : null;
  const t6 = props.items.length === 0 && emptyText != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-tag-group__empty", tabIndex: -1 }, emptyText) : null;
  const t7 = "grid";
  const t8 = "srp-tag-group__tags";
  const t9 = shown.length ? void 0 : -1;
  const t10 = named2 ? void 0 : props["aria-label"];
  const t11 = mode === "multiple" || void 0;
  const t12 = shown.map((t_3, i_1) => {
    const on_0 = picked.includes(t_3.id);
    return /* @__PURE__ */ React.createElement("div", { key: t_3.id, role: "row", "data-tag-id": t_3.id, tabIndex: t_3.id === current ? 0 : -1, className: cn("srp-tag-group__tag", on_0 && "srp-tag-group__tag--selected"), "aria-selected": mode !== "none" ? on_0 : void 0, "aria-disabled": t_3.disabled || void 0, onFocus: () => setActive(t_3.id), onKeyDown: (e_0) => onKeyDown(e_0, t_3, i_1), onClick: () => select(t_3) }, /* @__PURE__ */ React.createElement("span", { role: "gridcell", className: "srp-tag-group__text" }, mode !== "none" && on_0 ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "srp-tag-group__check" }) : t_3.icon != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-tag-group__icon", "aria-hidden": "true" }, asIcon(t_3.icon)) : null, t_3.avatar != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-tag-group__avatar", "aria-hidden": "true" }, t_3.avatar) : null, t_3.label), props.onRemove && !t_3.disabled ? /* @__PURE__ */ React.createElement("span", { role: "gridcell", className: "srp-tag-group__cell" }, /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: -1, className: "srp-tag-group__remove", "aria-label": L.tagRemove(t_3.label), onClick: (e_1) => {
      e_1.stopPropagation();
      remove(t_3);
    } }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Close }))) : null);
  });
  let t13;
  if ($[2] !== named2 || $[3] !== t10 || $[4] !== t11 || $[5] !== t12 || $[6] !== t9) {
    t13 = /* @__PURE__ */ React.createElement("div", { ref: grid, role: t7, className: t8, tabIndex: t9, "aria-labelledby": named2, "aria-label": t10, "aria-multiselectable": t11 }, t12);
    $[2] = named2;
    $[3] = t10;
    $[4] = t11;
    $[5] = t12;
    $[6] = t9;
    $[7] = t13;
  } else {
    t13 = $[7];
  }
  let t14;
  if ($[8] !== L || $[9] !== all || $[10] !== hidden || $[11] !== max || $[12] !== props || $[13] !== setAll) {
    t14 = hidden > 0 || all && props.items.length > max ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-tag-group__more", "aria-expanded": all, onClick: () => setAll(!all) }, all ? L.showLess : L.showMore) : null;
    $[8] = L;
    $[9] = all;
    $[10] = hidden;
    $[11] = max;
    $[12] = props;
    $[13] = setAll;
    $[14] = t14;
  } else {
    t14 = $[14];
  }
  let t15;
  if ($[15] !== ref || $[16] !== rest || $[17] !== t13 || $[18] !== t14 || $[19] !== t3 || $[20] !== t5 || $[21] !== t6) {
    t15 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t3, "data-component": t4 }, t5, t6, t13, t14);
    $[15] = ref;
    $[16] = rest;
    $[17] = t13;
    $[18] = t14;
    $[19] = t3;
    $[20] = t5;
    $[21] = t6;
    $[22] = t15;
  } else {
    t15 = $[22];
  }
  return t15;
}
var TagGroup = /* @__PURE__ */ named("TagGroup", TagGroupRender);
export {
  TagGroup
};
//# sourceMappingURL=TagGroup.js.map
